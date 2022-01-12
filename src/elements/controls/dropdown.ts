import { BuildOutput } from "@src/building/buildOutput";
import { WidgetCreator } from "@src/building/widgetCreator";
import { Bindable } from "@src/observables/bindable";
import { ensureDefaultLineHeight } from "../constants";
import { ElementParams } from "../element";
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

	_disabledMessage: string | undefined;
	_disableSingleItem: boolean;


	constructor(output: BuildOutput, params: DropdownParams)
	{
		super("dropdown", output, params);

		const binder = output.binder;
		binder.add(this, "items", params.items);
		binder.add(this, "selectedIndex", params.selectedIndex);

		const userOnChange = params.onChange;
		if (userOnChange)
		{
			this.onChange = userOnChange;
		}

		this._disabledMessage = params.disabledMessage;
		this._disableSingleItem = !!params.disableSingleItem;

		if (this._disabledMessage)
		{
			const items = this.items; // get local reference
			binder.on(params.disabled, this, "items", (value) => (value) ? [ this._disabledMessage || "" ] : items);
		}
		if (this._disableSingleItem)
		{
			binder.on(params.items, this, "isDisabled", (value) => (!value || value.length <= 1));
		}
	}
}