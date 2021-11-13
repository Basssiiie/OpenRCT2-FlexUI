import { BuildOutput } from "@src/core/buildOutput";
import { WidgetCreator } from "@src/core/widgetCreator";
import { WidgetMap } from "@src/core/widgetMap";
import { flexibleLayout } from "@src/layouts/flexibleLayout";
import { Layoutable } from "@src/layouts/layoutable";
import { Direction } from "@src/positional/direction";
import { FlexiblePosition } from "@src/positional/flexiblePosition";
import { Positions } from "@src/positional/positions";
import { Rectangle } from "@src/positional/rectangle";
import { isArray } from "@src/utilities/type";


/**
 * Array of widgets created with fluent-ui.
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
}


/**
 * Add a horizontal row with one or more child widgets.
 */
export function horizontal<TPos extends Positions>(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & TPos): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer) & TPos>
{
	return flexible(params, Direction.Horizontal);
}


/**
 * Add a vertical row with one or more child widgets.
 */
export function vertical<TPos extends Positions>(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & TPos): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer) & TPos>
{
	return flexible(params, Direction.Vertical);
}


/**
 * Add a flexible row with one or more child widgets in the specified direction.
 */
export function flexible<TPos extends Positions>(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & TPos, direction: Direction): WidgetCreator<(FlexibleLayoutParams | FlexibleLayoutContainer) & TPos>
{
	return {
		params: params,
		create: (output: BuildOutput): FlexibleLayoutControl => new FlexibleLayoutControl(output, params, direction)
	};
}


class FlexibleLayoutControl implements Layoutable
{
	params: FlexiblePosition[];
	children: Layoutable[];
	direction: Direction;

	constructor(output: BuildOutput, params: FlexibleLayoutParams | FlexibleLayoutContainer, direction: Direction)
	{
		this.direction = direction;

		const items = (isArray(params)) ? params : params.content;
		const count = items.length;
		this.params = Array<FlexiblePosition>(count);
		this.children = Array<Layoutable>(count);

		for (let i = 0; i < items.length; i++)
		{
			const child = items[i];
			this.params[i] = child.params;
			this.children[i] = child.create(output);
		}
	}

	layout(widgets: WidgetMap, area: Rectangle): void
	{
		flexibleLayout(this.params, area, this.direction, (idx, subarea) =>
		{
			this.children[idx].layout(widgets, subarea);
		});
	}
}