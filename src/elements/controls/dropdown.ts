import { Bindable } from "@src/bindings/bindable";
import { isStore } from "@src/bindings/stores/isStore";
import { read } from "@src/bindings/stores/read";
import { BuildOutput } from "@src/building/buildOutput";
import { ParentControl } from "@src/building/parentControl";
import { WidgetCreator } from "@src/building/widgets/widgetCreator";
import * as Log from "@src/utilities/logger";
import { addSilencerToOnChange } from "@src/utilities/silencer";
import { ensureDefaultLineHeight } from "../constants";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
import { Control } from "./control";


/**
 * Automatically disable the dropdown if it is empty, or has a single item at most.
 */
export type DropdownDisableMode = "never" | "empty" | "single";


/**
 * The parameters for configuring the dropdown.
 */
export interface DropdownParams extends ElementParams
{
	/**
	 * Sets the items that will show up in the dropdown menu.
	 */
	items: Bindable<string[]>;

	/**
	 * sets the default selected item, indexed into the items array.
	 * @default 0
	 */
	selectedIndex?: Bindable<number>;

	/**
	 * Sets the message that will show when the dropdown is not available.
	 * @default undefined
	 */
	disabledMessage?: string;

	/**
	 * Automatically disable the dropdown if it is empty, or has a single item at most.
	 * @default "never"
	 */
	autoDisable?: DropdownDisableMode;

	/**
	 * Triggers when the selected dropdown item changes.
	 */
	onChange?: (index: number) => void;
}


/**
 * Create a dropdown widget with one or more selectable options.
 */
export function dropdown(params: DropdownParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function dropdown(params: DropdownParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function dropdown(params: DropdownParams & Positions): WidgetCreator<Positions>
{
	ensureDefaultLineHeight(params);

	return (parent, output) => new DropdownControl(parent, output, params);
}


/**
 * A controller class for a dropdown widget.
 */
export class DropdownControl extends Control<DropdownDesc> implements DropdownDesc
{
	items: string[] = [];
	selectedIndex: number = 0;
	onChange?: (index: number) => void;

	_selectedIndex?: number;
	_previousItems?: string[];
	_silenceOnChange?: boolean;

	constructor(parent: ParentControl, output: BuildOutput, params: DropdownParams)
	{
		super("dropdown", parent, output, params);

		const { items, disabled, disabledMessage, onChange } = params;
		const disableCount = getDisabledCount(params.autoDisable);
		const selectedIndex = params.selectedIndex;

		const setter = (widget: DropdownDesc): void =>
		{
			this._updateDropdown(widget, read(items), read(disabled), disableCount, disabledMessage);
		};

		const binder = output.binder;
		let itemsSetter: ((widget: DropdownDesc, value: string[]) => void) = setter;
		if (isStore(items))
		{
			// Allow update of selected index if items has changed/reordered, to keep the same item selected.
			itemsSetter = (widget: DropdownDesc, value: string[]): void =>
			{
				setter(widget);
				this._setNewSelectedIndexOfSameSelectedItem(widget, value);
				this._previousItems = value;
			};
		}

		binder.on(this, items, itemsSetter);
		binder.on(this, selectedIndex, (widget, idx) =>
		{
			this._selectedIndex = idx;
			setter(widget);
		});
		binder.on(this, disabled, setter);

		// Ensure index is never negative (= uninitialised state)
		addSilencerToOnChange(this, onChange, (idx, apply) => apply((idx < 0) ? 0 : idx));
	}

	/**
	 * Updates the dropdown properties whenever one of the connected stores has changed.
	 */
	private _updateDropdown(widget: DropdownDesc, items: string[] | undefined, disabled: boolean | undefined, disableCount: number, disabledMessage: string | undefined): void
	{
		this._silenceOnChange = true;
		const setDisabled = (disabled || !items || items.length <= disableCount);
		if (setDisabled && disabledMessage)
		{
			widget.items = [ disabledMessage ];
		}
		else
		{
			widget.items = items;
			widget.selectedIndex = this._selectedIndex || 0;
		}
		widget.isDisabled = setDisabled;
		this._silenceOnChange = false;
	}

	/**
	 * If the dropdown items have changed, try to find the originally selected item index.
	 */
	private _setNewSelectedIndexOfSameSelectedItem(widget: DropdownDesc, newItems: string[]): void
	{
		const oldItems = this._previousItems;
		if (!oldItems)
		{
			return;
		}

		const oldSelectedIndex = (widget.selectedIndex || 0);
		const lastSelected = oldItems[oldSelectedIndex];
		let newSelectIndex = newItems.indexOf(lastSelected);

		if (newSelectIndex < 0)
		{
			newSelectIndex = 0;
			Log.debug("Dropdown items have changed but old item not found, reset selectedIndex", oldSelectedIndex, "-> 0 (old item:", lastSelected, ")");
		}
		else
		{
			Log.debug("Dropdown items have changed, update selectedIndex:", oldSelectedIndex, "->", newSelectIndex, "(", lastSelected, "->", newItems[newSelectIndex], ")");
		}
		if (this._selectedIndex !== newSelectIndex)
		{
			Log.debug("Dropdown items:", oldItems, "->", newItems);
			this._selectedIndex = newSelectIndex;
			widget.selectedIndex = newSelectIndex;
		}
	}
}


/**
 * Determines how many items the dropdown should have to be enabled or disabled.
 */
function getDisabledCount(disableMode: DropdownDisableMode | undefined): number
{
	switch (disableMode)
	{
		case "empty": return 0;
		case "single": return 1;
	}
	return -1;
}