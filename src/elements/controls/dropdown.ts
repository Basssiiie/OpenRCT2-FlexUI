import { Bindable } from "@src/bindings/bindable";
import { isStore } from "@src/bindings/isStore";
import { storify } from "@src/bindings/storify";
import { BuildOutput } from "@src/building/buildOutput";
import { WidgetCreator } from "@src/building/widgetCreator";
import { ensureDefaultLineHeight } from "../constants";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
import { Control } from "./control";


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
	 * Automatically disables the dropdown if it has a single item.
	 * @default false
	 */
	disableSingleItem?: boolean;

	/**
	 * Triggers when the selected dropdown item changes.
	 */
	onChange?: (index: number) => void;
}


/**
 * Create a dropdown widget with one or more selectable options.
 */
export function dropdown(params: DropdownParams & FlexiblePosition): WidgetCreator<DropdownParams & FlexiblePosition>;
export function dropdown(params: DropdownParams & AbsolutePosition): WidgetCreator<DropdownParams & AbsolutePosition>;
export function dropdown(params: DropdownParams & Positions): WidgetCreator<DropdownParams>
{
	ensureDefaultLineHeight(params);

	return {
		params: params,
		create: (output: BuildOutput): DropdownControl => new DropdownControl(output, params)
	};
}


/**
 * A controller class for a dropdown widget.
 */
export class DropdownControl extends Control<DropdownWidget> implements DropdownWidget
{
	items: string[] = [];
	selectedIndex: number = 0;
	onChange?: (index: number) => void;


	constructor(output: BuildOutput, params: DropdownParams)
	{
		super("dropdown", output, params);

		const items = params.items;
		const itemsIsStore = isStore(items);
		let selected = params.selectedIndex;

		if (itemsIsStore)
		{
			// Reset selected index when the updated list is shorted than the current index.
			const reset = selected = storify(selected || 0);
			items.subscribe(i =>
			{
				if (i.length <= reset.get())
					reset.set(0);
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
				if (isDisabled)
					return [ disabledMessage ];

				return (itemsIsStore) ? items.get() : items;
			});
			isDisabledConverter = (itemArray: string[]): this["items"] => (this.isDisabled) ? [ disabledMessage ] : itemArray;
		}
		if (params.disableSingleItem)
		{
			binder.add(this, "isDisabled", items, (value) => (!value || value.length <= 1));
		}

		binder.add(this, "items", items, isDisabledConverter);
		binder.add(this, "selectedIndex", selected);

		const userOnChange = params.onChange;
		if (userOnChange)
		{
			// Ensure index is never negative (= uninitialised state)
			this.onChange = (idx: number): void => userOnChange((idx < 0) ? 0 : idx);
		}
	}
}