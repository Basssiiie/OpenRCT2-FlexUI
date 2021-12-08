import { BuildOutput } from "@src/building/buildOutput";
import { Layoutable } from "@src/building/layoutable";
import { WidgetCreator } from "@src/building/widgetCreator";
import { WidgetMap } from "@src/building/widgetMap";
import { Rectangle } from "@src/positional/rectangle";
import { isArray } from "@src/utilities/type";
import { FlexiblePosition } from "../flexible/flexiblePosition";
import { Positions } from "../positions";
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
export function absolute(params: AbsoluteLayoutContainer & FlexiblePosition): WidgetCreator<AbsoluteLayoutContainer & FlexiblePosition>;
export function absolute(params: AbsoluteLayoutContainer & AbsolutePosition): WidgetCreator<AbsoluteLayoutContainer & AbsolutePosition>;
export function absolute(params: AbsoluteLayoutParams & FlexiblePosition): WidgetCreator<AbsoluteLayoutParams & FlexiblePosition>;
export function absolute(params: AbsoluteLayoutParams & AbsolutePosition): WidgetCreator<AbsoluteLayoutParams & AbsolutePosition>;
export function absolute(params: (AbsoluteLayoutParams | AbsoluteLayoutContainer) & Positions): WidgetCreator<(AbsoluteLayoutParams | AbsoluteLayoutContainer) & Positions>
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