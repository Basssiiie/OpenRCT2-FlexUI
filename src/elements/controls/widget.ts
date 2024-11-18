import { BuildOutput } from "@src/windows/buildOutput";
import { ParentControl } from "@src/windows/parentControl";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";
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
export function widget<I, P>(params: WidgetParams & I): WidgetCreator<I, P>
{
	return (parent, output) => new WidgetControl(params.type, parent, output, params);
}


// All keys that should be ignored on the params object.
const omittedKeys =
[
	"x", "y", "width", "height", "name", "tooltip", "isVisible", "isDisabled"
];


/**
 * A controller class for a custom widget.
 */
class WidgetControl<I, P> extends Control<WidgetDesc, I, P>
{
	constructor(type: WidgetType, parent: ParentControl<I, P>, output: BuildOutput, params: WidgetParams & I)
	{
		super(type, parent, output, params);

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
