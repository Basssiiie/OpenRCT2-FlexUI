import { BuildOutput } from "@src/building/buildOutput";
import { WidgetCreator } from "@src/building/widgetCreator";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
import { Control } from "./control";


/**
 * The parameters for configuring a custom widget.
 */
export type WidgetParams = Omit<Widget, "x" | "y" | "width" | "height" | "window">;


/**
 * Add a custom widget without any bindings.
 */
export function widget(params: WidgetParams & FlexiblePosition): WidgetCreator<WidgetParams & FlexiblePosition>;
export function widget(params: WidgetParams & AbsolutePosition): WidgetCreator<WidgetParams & AbsolutePosition>;
export function widget(params: WidgetParams & Positions): WidgetCreator<WidgetParams>
{
	return {
		params: params,
		create: (output: BuildOutput): WidgetControl => new WidgetControl(params.type, output, params)
	};
}


/**
 * A controller class for a custom widget.
 */
class WidgetControl extends Control<WidgetBase> implements WidgetParams
{
}