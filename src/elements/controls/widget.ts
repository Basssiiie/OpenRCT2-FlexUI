import { BuildOutput } from "@src/windows/buildOutput";
import { ParentControl } from "@src/windows/parentControl";
import { toWidgetCreator, WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Control } from "./control";


/**
 * The parameters for configuring a custom widget.
 */
export type WidgetParams<W extends WidgetDesc = WidgetDesc> = ElementParams
	& (W extends WidgetBaseDesc ? Omit<W, "x" | "y" | "width" | "height" | "name" | "tooltip" | "isVisible" | "isDisabled"> : never);


/**
 * Add a custom widget without any bindings.
 */
export function widget(params: WidgetParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function widget(params: WidgetParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function widget<Position>(params: WidgetParams & Position): WidgetCreator<Position>
{
	return toWidgetCreator(params, WidgetControl);
}


// All keys that should be ignored on the params object.
const omittedKeys = ["x", "y", "width", "height", "name", "tooltip", "isVisible", "isDisabled"];


/**
 * A controller class for a custom widget.
 */
class WidgetControl<Position> extends Control<WidgetDesc, Position>
{
	constructor(parent: ParentControl, output: BuildOutput, params: WidgetParams & Position)
	{
		super(params.type, parent, output, params);

		for (const key in params)
		{
			if (omittedKeys.indexOf(key) == -1)
			{
				// @ts-expect-error This mapping defies TS logic.
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				this[key] = params[key];
			}
		}
	}
}
