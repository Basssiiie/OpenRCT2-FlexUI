import { WidgetCreator } from "@src/building/widgets/widgetCreator";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
import { Control } from "./control";


/**
 * The parameters for configuring a custom widget.
 */
export type WidgetParams = Omit<WidgetDesc, "x" | "y" | "width" | "height" | "window">;


/**
 * Add a custom widget without any bindings.
 */
export function widget(params: WidgetParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function widget(params: WidgetParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function widget(params: WidgetParams & Positions): WidgetCreator<Positions>
{
	return (parent, output) => new WidgetControl(params.type, parent, output, params);
}


/**
 * A controller class for a custom widget.
 */
class WidgetControl extends Control<WidgetDesc> implements WidgetParams
{
}