import { BuildOutput } from "@src/building/buildOutput";
import { Layoutable } from "@src/building/layoutable";
import { WidgetCreator } from "@src/building/widgetCreator";
import { WidgetMap } from "@src/building/widgetMap";
import { defaultSpacing } from "@src/elements/constants";
import { Direction } from "@src/positional/direction";
import { Paddable, parsePadding } from "@src/positional/padding";
import { Parsed } from "@src/positional/parsed";
import { Rectangle } from "@src/positional/rectangle";
import { ParsedScale, parseScale, Scale, ScaleType } from "@src/positional/scale";
import { isArray } from "@src/utilities/type";
import { AbsolutePosition } from "../absolute/absolutePosition";
import { Positions } from "../positions";
import { flexibleLayout } from "./flexibleLayout";
import { FlexiblePosition } from "./flexiblePosition";



/**
 * Array of widgets created with fluent-ui.
 */
export type FlexibleLayoutContainer = WidgetCreator<FlexiblePosition>[];


/**
 * The parameters for configuring a flexible layout.
 */
export interface FlexibleLayoutParams extends Paddable
{
	/**
	 * Specify the child widgets within this flexible box.
	 */
	content: FlexibleLayoutContainer;

	/**
	 * Specify the amount of space between each child widget.
	 * @default "5px"
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


class FlexibleLayoutControl implements Layoutable
{
	_direction: Direction;
	_childLayoutFunctions: Layoutable[];
	_childPositions: Parsed<FlexiblePosition>[];
	_spacing: ParsedScale;

	constructor(output: BuildOutput, params: (FlexibleLayoutParams | FlexibleLayoutContainer) & Positions, direction: Direction)
	{
		this._direction = direction;

		let spacing: ParsedScale | undefined;
		if ("spacing" in params)
		{
			spacing = parseScale(params.spacing);
		}
		this._spacing = spacing || defaultSpacing;

		const items = (isArray(params)) ? params : params.content;
		const count = items.length;
		this._childLayoutFunctions = Array<Layoutable>(count);
		this._childPositions = Array<Parsed<FlexiblePosition>>(count);

		let absoluteWidth: number = 0, isFullyAbsoluteWidth: boolean = true,
			absoluteHeight: number = 0, isFullyAbsoluteHeight: boolean = true;
		const isHorizontal = (direction === Direction.Horizontal);

		for (let i = 0; i < items.length; i++)
		{
			const child = items[i];
			this._childLayoutFunctions[i] = child.create(output);
			const pos = parseFlexiblePosition(child.params);
			this._childPositions[i] = pos;

			// Determine if all children are absolutely sized,
			// if so, then size itself accordingly.
			const width = pos.width, height = pos.height;
			if (width && width[1] === ScaleType.Pixel)
			{
				absoluteWidth = addOrMax(absoluteWidth, width[0], isHorizontal);
			}
			else
			{
				isFullyAbsoluteWidth = false;
			}
			if (height && height[1] === ScaleType.Pixel)
			{
				absoluteHeight = addOrMax(absoluteHeight, height[0], !isHorizontal);
			}
			else
			{
				isFullyAbsoluteHeight = false;
			}
		}

		if (isFullyAbsoluteWidth)
		{
			params.width = absoluteWidth;
		}
		if (isFullyAbsoluteHeight)
		{
			params.height = absoluteHeight;
		}
	}

	layout(widgets: WidgetMap, area: Rectangle): void
	{
		flexibleLayout(this._childPositions, area, this._direction, this._spacing, (idx, subarea) =>
		{
			this._childLayoutFunctions[idx].layout(widgets, subarea);
		});
	}
}


/**
 * Parses the properties used in a flexible layout.
 */
function parseFlexiblePosition(desired: FlexiblePosition): Parsed<FlexiblePosition>
{
	return {
		width: parseScale(desired.width),
		height: parseScale(desired.height),
		padding: parsePadding(desired.padding),
	};
}


/**
 * Either adds the new value, or returns the highest of the two.
 */
function addOrMax(oldValue: number, newValue: number, add: boolean): number
{
	if (add)
	{
		return (oldValue + newValue);
	}
	return (oldValue < newValue) ? newValue : oldValue;
}