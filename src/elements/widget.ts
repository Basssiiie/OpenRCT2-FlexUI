import { BuildOutput } from "@src/core/buildOutput";
import { WidgetCreator } from "@src/core/widgetCreator";
import { FlexiblePosition } from "@src/positional/flexiblePosition";
import { Control } from "./control";



export type WidgetParams = Omit<Widget, "x" | "y" | "width" | "height" | "window">;


/**
 * Add a custom widget without any bindings.
 */
export function widget<P = FlexiblePosition>(params: WidgetParams & P): WidgetCreator<WidgetParams & P>
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