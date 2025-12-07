import { parseScale } from "@src/positional/parsing/parseScale";
import { Parsed } from "@src/positional/parsing/parsed";
import { Rectangle } from "@src/positional/rectangle";
import { isArray } from "@src/utilities/type";
import { BuildOutput } from "@src/windows/buildOutput";
import { ParentControl } from "@src/windows/parentControl";
import { toWidgetCreator, WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { Container } from "../container";
import { FlexiblePosition } from "../flexible/flexiblePosition";
import { absoluteLayout } from "./absoluteLayout";
import { AbsolutePosition } from "./absolutePosition";


/**
 * Array of widgets created that are positioned at absolute locations.
 */
export type AbsoluteLayoutContainer = WidgetCreator<AbsolutePosition>[];


/**
 * The parameters for configuring an absolute layout.
 */
export interface AbsoluteLayoutParams
{
	/**
	 * Specify the child widgets within this box.
	 */
	content: AbsoluteLayoutContainer;
}


/**
 * Add an area with widgets positioned at absolute.
 */
export function absolute(params: AbsoluteLayoutContainer & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function absolute(params: AbsoluteLayoutContainer & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function absolute(params: AbsoluteLayoutParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function absolute(params: AbsoluteLayoutParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function absolute<Position>(params: (AbsoluteLayoutParams | AbsoluteLayoutContainer) & Position): WidgetCreator<Position>
{
	return toWidgetCreator(params, AbsoluteLayoutControl);
}


class AbsoluteLayoutControl<Position> extends Container<AbsolutePosition, Parsed<AbsolutePosition>> implements ParentControl
{
	constructor(parent: ParentControl, output: BuildOutput, params: (AbsoluteLayoutParams | AbsoluteLayoutContainer) & Position)
	{
		const creators = (isArray(params)) ? params : params.content;

		super(output, creators, position =>
		({
			x: parseScale(position.x),
			y: parseScale(position.y),
			width: parseScale(position.width),
			height: parseScale(position.height)
		}));
	}

	layout(widgets: WidgetMap, area: Rectangle): void
	{
		absoluteLayout(this._children, area, widgets);
	}
}
