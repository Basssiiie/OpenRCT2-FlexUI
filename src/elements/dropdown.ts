import { ElementFactory, ElementParams } from "./element";
import { WidgetFactory } from "../core/widgetFactory";
import { BuildOutput } from "../core/buildOutput";
import { Id } from "../utilities/identifier";
import { LayoutFunction } from "../layouts/layoutFunction";
import { Bindable } from "../observables/bindable";
import { LayoutFactory } from "../layouts/layoutFactory";
import { Observable } from "../observables/observable";
import { Template } from "../templates/template";


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
	 * @todo Implement.
	 */
	disabledMessage?: string;

	/**
	 * Automatically disables the dropdown if it has a single item.
	 * @default false
	 * @todo Implement.
	 */
	disableSingleItem?: boolean;

	/**
	 * Triggers when the selected dropdown item changes.
	 */
	onSelect?: (index: number) => void;
}


export const DropdownFactory: WidgetFactory<DropdownParams> =
{
	create(output: BuildOutput, params: DropdownParams): LayoutFunction
	{
		const id = Id.new();
		const dropdown = ElementFactory.base<DropdownWidget>(output, params, id);
		dropdown.type = "dropdown";
		dropdown.onChange = params.onSelect;

		const binder = output.binder;
		binder.read(dropdown, "items", params.items);
		binder.read(dropdown, "selectedIndex", params.selectedIndex);

		bindDisabledMessage(output.template, id, params);

		return (widgets, area): void => LayoutFactory.defaultLayout(widgets, id, area);
	}
};


/**
 * Binds `disabledMessage` to `isDisabled` if possible.
 */
function bindDisabledMessage(template: Template, id: string, params: DropdownParams): void
{
	const disabledMessage = params.disabledMessage;
	if (!disabledMessage)
		return;

	const onDisabled = params.disabled;
	if (!(onDisabled instanceof Observable))
		return;

	const items = (params.items) ? params.items : [];

	onDisabled.subscribe(v =>
	{
		const dropdown = template.getWidget<DropdownWidget>(id);
		if (!dropdown)
			return;

		const value = (v) ? [ disabledMessage ] : items;
		dropdown.set("items", value as string[]);
	});
}