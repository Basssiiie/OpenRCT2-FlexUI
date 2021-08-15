import { BuildOutput } from "../core/buildOutput";
import { WidgetFactory } from "../core/widgetFactory";
import { LayoutFactory } from "../layouts/layoutFactory";
import { LayoutFunction } from "../layouts/layoutFunction";
import { Id } from "../utilities/identifier";



export type WidgetParams = Omit<Widget, "x" | "y" | "width" | "height" | "window">;


export const CustomWidgetFactory: WidgetFactory<WidgetParams> =
{
	create(output: BuildOutput, params: WidgetParams): LayoutFunction
	{
		const id = Id.new();
		const widget = { ...params, name: id } as Widget;
		output.widgets.push(widget);

		return (widgets, area): void => LayoutFactory.defaultLayout(widgets, id, area);
	}
};