import { BuildOutput } from "@src/core/buildOutput";
import { defaultSpacing } from "@src/core/defaults";
import { WidgetCreator } from "@src/core/widgetCreator";
import { WidgetMap } from "@src/core/widgetMap";
import { flexibleLayout } from "@src/layouts/flexibleLayout";
import { Layoutable } from "@src/layouts/layoutable";
import { AbsolutePosition } from "@src/positional/absolutePosition";
import { Direction } from "@src/positional/direction";
import { FlexiblePosition } from "@src/positional/flexiblePosition";
import { Paddable } from "@src/positional/padding";
import { Positions } from "@src/positional/positions";
import { Rectangle } from "@src/positional/rectangle";
import { Scale } from "@src/positional/scale";
import { isArray, isUndefined } from "@src/utilities/type";


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
export function horizontal(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & FlexiblePosition): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer) & FlexiblePosition>;
export function horizontal(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & AbsolutePosition): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer) & AbsolutePosition>;
export function horizontal(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & Positions): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer)>
{
	return flexible(params, Direction.Horizontal);
}


/**
 * Add a vertical row with one or more child widgets.
 */
export function vertical(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & FlexiblePosition): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer) & FlexiblePosition>;
export function vertical(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & AbsolutePosition): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer) & AbsolutePosition>;
export function vertical(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & Positions): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer)>
{
	return flexible(params, Direction.Vertical);
}


/**
 * Add a flexible row with one or more child widgets in the specified direction.
 */
export function flexible(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & FlexiblePosition, direction: Direction): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer) & FlexiblePosition>;
export function flexible(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & AbsolutePosition, direction: Direction): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer) & AbsolutePosition>;
export function flexible(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & Positions, direction: Direction): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer)>
{
	return {
		params: params,
		create: (output: BuildOutput): FlexibleLayoutControl => new FlexibleLayoutControl(output, params, direction)
	};
}


class FlexibleLayoutControl implements Layoutable
{
	_childPositions: FlexiblePosition[];
	_childLayoutFunctions: Layoutable[];
	_direction: Direction;
	_spacing: Scale;

	constructor(output: BuildOutput, params: FlexibleLayoutParams | FlexibleLayoutContainer, direction: Direction)
	{
		this._direction = direction;
		this._spacing = ("spacing" in params && !isUndefined(params.spacing)) ? params.spacing : defaultSpacing;

		const items = (isArray(params)) ? params : params.content;
		const count = items.length;
		this._childPositions = Array<FlexiblePosition>(count);
		this._childLayoutFunctions = Array<Layoutable>(count);

		for (let i = 0; i < items.length; i++)
		{
			const child = items[i];
			this._childPositions[i] = child.params;
			this._childLayoutFunctions[i] = child.create(output);
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