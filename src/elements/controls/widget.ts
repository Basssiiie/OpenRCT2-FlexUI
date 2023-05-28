import { WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Control } from "./control";


/**
 * The parameters for configuring a custom widget.
 */
export type WidgetParams = Omit<WidgetDesc, "x" | "y" | "width" | "height">;


/**
 * Add a custom widget without any bindings.
 */
export function widget(params: WidgetParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function widget(params: WidgetParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function widget<I, P>(params: WidgetParams & I): WidgetCreator<I, P>
{
	return (parent, output) => new WidgetControl(params.type, parent, output, params);
}


/**
 * A controller class for a custom widget.
 */
class WidgetControl<I, P> extends Control<WidgetDesc, I, P> implements WidgetParams
{
}