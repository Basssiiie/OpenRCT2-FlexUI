import { Bindable } from "@src/bindings/bindable";
import { isStore } from "@src/bindings/stores/isStore";
import { storify } from "@src/bindings/stores/storify";
import { BuildOutput } from "@src/building/buildOutput";
import { ParentControl } from "@src/building/parentControl";
import { WidgetCreator } from "@src/building/widgetCreator";
import { findIndex } from "@src/utilities/array";
import * as Log from "@src/utilities/logger";
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
export class DropdownControl extends Control<DropdownWidget> implements DropdownWidget
{
	items: string[] = [];
	selectedIndex: number = 0;
	onChange?: (index: number) => void;

	_previousItems?: string[];


	constructor(parent: ParentControl, output: BuildOutput, params: DropdownParams)
	{
		super("dropdown", parent, output, params);

		const items = params.items;
		const itemsIsStore = isStore(items);
		let selected = params.selectedIndex;

		if (itemsIsStore)
		{
			this._previousItems = items.get();
			const selectStore = selected = storify(selected || 0);
			items.subscribe(newItems =>
			{
				// Update selected index to same item as in old list, if it is still present.
				if (this._previousItems)
				{
					const
						lastSelectIdx = selectStore.get(),
						lastSelected = this._previousItems[lastSelectIdx],
						newSelectIdx = findIndex(newItems, s => s === lastSelected);

					Log.debug(`Dropdown '${this.name}' items have changed, update selectedIndex: ${lastSelectIdx} -> ${newSelectIdx} (${lastSelected} -> ${newSelectIdx !== null ? newItems[newSelectIdx] : null})`);
					selectStore.set(newSelectIdx || 0);
				}
				this._previousItems = newItems;
			});
		}

		const binder = output.binder;
		const disabledMessage = params.disabledMessage;
		let isDisabledConverter;

		if (disabledMessage)
		{
			// If disabled, it should show a special message, if not show the (binded) items.
			binder.add(this, "items", params.disabled, (isDisabled) =>
			{
				Log.debug(`Dropdown '${this.name}' isDisabled has changed, set disabled message: ${isDisabled}`);
				if (isDisabled)
					return [ disabledMessage ];

				return (itemsIsStore) ? items.get() : items;
			});
			isDisabledConverter = (itemArray: string[]): this["items"] => (this.isDisabled) ? [ disabledMessage ] : itemArray;
		}
		const disableMode = params.autoDisable;
		if (disableMode)
		{
			let disableCount: number;
			switch (disableMode)
			{
				case "empty": disableCount = 0; break;
				case "single": disableCount = 1; break;
				default: disableCount = -1; break;
			}
			if (disableCount >= 0)
			{
				binder.add(this, "isDisabled", items, (value) => (!value || value.length <= disableCount));
			}
		}

		binder.add(this, "items", items, isDisabledConverter);
		binder.add(this, "selectedIndex", selected);

		const userOnChange = params.onChange;
		if (userOnChange)
		{
			// Ensure index is never negative (= uninitialised state)
			this.onChange = (idx: number): void =>
			{
				Log.debug(`Dropdown '${this.name}' selectedIndex changed by user: ${this.selectedIndex} -> ${idx} (${this.items[this.selectedIndex]} -> ${this.items[idx]})`);
				return userOnChange((idx < 0) ? 0 : idx);
			};
		}
	}
}