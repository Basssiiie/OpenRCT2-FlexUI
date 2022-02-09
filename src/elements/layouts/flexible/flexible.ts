import { BuildOutput } from "@src/building/buildOutput";
import { Layoutable } from "@src/building/layoutable";
import { WidgetCreator } from "@src/building/widgetCreator";
import { WidgetMap } from "@src/building/widgetMap";
import { defaultSpacing } from "@src/elements/constants";
import { Direction } from "@src/positional/direction";
import { Parsed } from "@src/positional/parsing/parsed";
import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { parseScale } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { Scale } from "@src/positional/scale";
import { isArray } from "@src/utilities/type";
import { AbsolutePosition } from "../absolute/absolutePosition";
import { Positions } from "../positions";
import { setDesiredSpaceForChildren } from "./desiredSpacing";
import { flexibleLayout } from "./flexibleLayout";
import { FlexiblePosition } from "./flexiblePosition";
import { parseFlexiblePosition } from "./parseFlexiblePosition";



/**
 * Array of widgets for use in a flexible layout container.
 */
export type FlexibleLayoutContainer = WidgetCreator<FlexiblePosition>[];


/**
 * The parameters for configuring a flexible layout.
 */
export interface FlexibleLayoutParams
{
	/**
	 * Specify the child widgets within this flexible box.
	 */
	content: FlexibleLayoutContainer;

	/**
	 * Specify the amount of space between each child widget.
	 * @default "4px"
	 */
	spacing?: Scale;
}


/**
 * Add a horizontal row with one or more child widgets.
 */
export function horizontal(params: FlexibleLayoutContainer & FlexiblePosition): WidgetCreator<FlexibleLayoutContainer & FlexiblePosition>;
export function horizontal(params: FlexibleLayoutContainer & AbsolutePosition): WidgetCreator<FlexibleLayoutContainer & AbsolutePosition>;
export function horizontal(params: FlexibleLayoutParams & FlexiblePosition): WidgetCreator<FlexibleLayoutParams & FlexiblePosition>;
export function horizontal(params: FlexibleLayoutParams & AbsolutePosition): WidgetCreator<FlexibleLayoutParams & AbsolutePosition>;
export function horizontal(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & Positions): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer)>
{
	return flexible(<never>params, Direction.Horizontal);
}


/**
 * Add a vertical row with one or more child widgets.
 */
export function vertical(params: FlexibleLayoutContainer & FlexiblePosition): WidgetCreator<FlexibleLayoutContainer & FlexiblePosition>;
export function vertical(params: FlexibleLayoutContainer & AbsolutePosition): WidgetCreator<FlexibleLayoutContainer & AbsolutePosition>;
export function vertical(params: FlexibleLayoutParams & FlexiblePosition): WidgetCreator<FlexibleLayoutParams & FlexiblePosition>;
export function vertical(params: FlexibleLayoutParams & AbsolutePosition): WidgetCreator<FlexibleLayoutParams & AbsolutePosition>;
export function vertical(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & Positions): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer)>
{
	return flexible(<never>params, Direction.Vertical);
}


/**
 * Add a flexible row with one or more child widgets in the specified direction.
 */
export function flexible(params: FlexibleLayoutContainer & FlexiblePosition, direction: Direction): WidgetCreator<FlexibleLayoutContainer & FlexiblePosition>;
export function flexible(params: FlexibleLayoutContainer & AbsolutePosition, direction: Direction): WidgetCreator<FlexibleLayoutContainer & AbsolutePosition>;
export function flexible(params: FlexibleLayoutParams & FlexiblePosition, direction: Direction): WidgetCreator<FlexibleLayoutParams & FlexiblePosition>;
export function flexible(params: FlexibleLayoutParams & AbsolutePosition, direction: Direction): WidgetCreator<FlexibleLayoutParams & AbsolutePosition>;
export function flexible(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & Positions, direction: Direction): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer)>
{
	return {
		params: params,
		create: (output: BuildOutput): FlexibleLayoutControl => new FlexibleLayoutControl(output, params, direction)
	};
}


type FlexibleLayoutChild = Parsed<FlexiblePosition> & { _layoutable: Layoutable };


class FlexibleLayoutControl implements Layoutable
{
	_children: FlexibleLayoutChild[];
	_direction: Direction;
	_spacing: ParsedScale;

	constructor(output: BuildOutput, params: (FlexibleLayoutParams | FlexibleLayoutContainer) & Positions, direction: Direction)
	{
		this._direction = direction;

		let spacing: ParsedScale | undefined;
		if ("spacing" in params)
		{
			spacing = parseScale(params.spacing);
		}
		this._spacing = (spacing ||= defaultSpacing);

		const items = (isArray(params)) ? params : params.content;
		const count = items.length;
		const children = Array<FlexibleLayoutChild>(count);

		for (let i = 0; i < items.length; i++)
		{
			const child = items[i];
			const layoutable = child.create(output);

			const position = parseFlexiblePosition(child.params) as FlexibleLayoutChild;
			position._layoutable = layoutable;
			children[i] = position;
		}

		setDesiredSpaceForChildren(params, children, <ParsedScale>spacing, direction);
		this._children = children;
	}

	layout(widgets: WidgetMap, area: Rectangle): void
	{
		const renderableChildren = this._children.filter(c => !c._layoutable.skip);

		flexibleLayout(renderableChildren, area, this._direction, this._spacing, (idx, subarea) =>
		{
			renderableChildren[idx]._layoutable.layout(widgets, subarea);
		});
	}
}