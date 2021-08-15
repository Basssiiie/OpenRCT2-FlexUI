import { BuildOutput } from "../core/buildOutput";
import { WidgetFactory } from "../core/widgetFactory";
import { LayoutFactory } from "../layouts/layoutFactory";
import { LayoutFunction } from "../layouts/layoutFunction";
import { Bindable } from "../observables/bindable";
import { Rectangle } from "../positional/rectangle";
import { Id } from "../utilities/identifier";


/**
 * Whether the element is visible, hidden or gone completely.
 *
 * Note: `hidden` elements still take up space, `none` elements do not.
 */
export type ElementVisibility = "visible" | "hidden" | "none";


/**
 * Configurable settings for a custom element.
 */
export interface ElementParams
{
	/**
	 * An optional tooltip to show by this element, by hovering over it.
	 * @default undefined
	 */
	tooltip?: Bindable<string>;


	/**
	 * Whether or not the element starts active.
	 * @default false
	 */
	disabled?: Bindable<boolean>;


	/**
	 * Whether the element is visible, hidden or gone completely.
	 *
	 * Note: `hidden` elements still take up space, `none` elements do not.
	 * @default "visible"
	 */
	visibility?: Bindable<ElementVisibility>;
}


interface ElementFactory extends WidgetFactory<ElementParams>
{
	/**
	 * Creates a base widget with the id, a tooltip and other properties.
	 * Adds this widget to the output and binds up any base bindings.
	 */
	base<T = WidgetBase>(output: BuildOutput, params: ElementParams, id: string): T;
}


export const ElementFactory: ElementFactory =
{
	create(output: BuildOutput, params: ElementParams): LayoutFunction
	{
		const id = Id.new();
		/* const widget =  */this.base(output, params, id);

		return (widgets, area): void => LayoutFactory.defaultLayout(widgets, id, area);
	},

	base<T = WidgetBase>(output: BuildOutput, params: ElementParams, id: string): T
	{
		const widget = <Omit<WidgetBase, keyof Rectangle>>
		{
			name: id,
		} as WidgetBase;

		const binder = output.binder;
		binder.read(widget, "tooltip", params.tooltip);
		binder.read(widget, "isDisabled", params.disabled);
		binder.read(widget, "isVisible", params.visibility, v => (v === "visible"));
		output.widgets.push(widget);
		return <T><unknown>widget;
	}
};