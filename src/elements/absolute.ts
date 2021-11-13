import { BuildOutput } from "@src/core/buildOutput";
import { WidgetCreator } from "@src/core/widgetCreator";
import { WidgetMap } from "@src/core/widgetMap";
import { absoluteLayout } from "@src/layouts/absoluteLayout";
import { Layoutable } from "@src/layouts/layoutable";
import { AbsolutePosition } from "@src/positional/absolutePosition";
import { Positions } from "@src/positional/positions";
import { Rectangle } from "@src/positional/rectangle";
import { isArray } from "@src/utilities/type";


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
export function absolute<TPos extends Positions>(params: (AbsoluteLayoutParams | AbsoluteLayoutContainer) & TPos): WidgetCreator<(AbsoluteLayoutParams | AbsoluteLayoutContainer) & TPos>
{
	return {
		params: params,
		create: (output: BuildOutput): AbsoluteLayoutControl => new AbsoluteLayoutControl(output, params)
	};
}


class AbsoluteLayoutControl implements Layoutable
{
	_childPositions: AbsolutePosition[];
	_childLayoutFunctions: Layoutable[];

	constructor(output: BuildOutput, params: AbsoluteLayoutParams | AbsoluteLayoutContainer)
	{
		// TODO: this code is almost equal to flexlayout, make shared helper function
		const items = (isArray(params)) ? params : params.content;
		const count = items.length;
		this._childPositions = Array<AbsolutePosition>(count);
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
		absoluteLayout(this._childPositions, area, (idx, subarea) =>
		{
			this._childLayoutFunctions[idx].layout(widgets, subarea);
		});
	}
}