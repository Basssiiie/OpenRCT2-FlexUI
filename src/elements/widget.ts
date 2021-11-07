import { BuildOutput } from "@src/core/buildOutput";
import { WidgetCreator } from "@src/core/widgetCreator";
import { Positions } from "@src/positional/positions";
import { Control } from "./control";


/**
 * The parameters for configuring a custom widget.
 */
export type WidgetParams = Omit<Widget, "x" | "y" | "width" | "height" | "window">;


/**
 * Add a custom widget without any bindings.
 */
export function widget<TPos extends Positions>(params: WidgetParams & TPos): WidgetCreator<WidgetParams & TPos>
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