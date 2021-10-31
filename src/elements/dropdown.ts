import { BuildOutput } from "@src/core/buildOutput";
import { WidgetCreator } from "@src/core/widgetCreator";
import { Bindable } from "@src/observables/bindable";
import { Positions } from "@src/positional/positions";
import { Control } from "./control";
import { ElementParams } from "./element";


/**
 * The parameters for configuring the dropdown.
 */
export interface DropdownParams extends ElementParams
{
	/**
	 * Sets the items that will show up in the dropdown menu.
	 * @default []
	 */
	items?: Bindable<string[]>;

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
	onSelect?: (index: number) => void;
}


/**
 * Create a dropdown widget with one or more selectable options.
 */
export function dropdown(params: DropdownParams & Positions): WidgetCreator<DropdownParams & Positions>
{
	return {
		params: params,
		create: (output: BuildOutput): DropdownControl => new DropdownControl(output, params)
	};
}


/**
 * A controller class for a dropdown widget.
 */
export class DropdownControl extends Control<DropdownWidget> implements DropdownWidget, DropdownParams
{
	items: string[] = [];
	selectedIndex: number = 0;
	disabledMessage: string | undefined;
	disableSingleItem: boolean;
	onSelect?: (index: number) => void;


	constructor(output: BuildOutput, params: DropdownParams)
	{
		super("dropdown", output, params);

		const binder = output.binder;
		binder.add(this, "items", params.items);
		binder.add(this, "selectedIndex", params.selectedIndex);
		this.disabledMessage = params.disabledMessage;
		this.disableSingleItem = !!params.disableSingleItem;
		this.onSelect = params.onSelect;

		if (this.disabledMessage)
		{
			const items = this.items; // get local reference
			binder.on(params.disabled, this, "items", (value) => (value) ? [ this.disabledMessage as string ] : items);
		}
		if (this.disableSingleItem)
		{
			binder.on(params.items, this, "isDisabled", (value) => (!value || value.length <= 1));
		}
	}

	/**
	 * Called when the dropdown item is changed by the user.
	 */
	onChange(index: number): void
	{
		this.selectedIndex = index;

		if (this.onSelect)
		{
			this.onSelect(index);
		}
	}
}