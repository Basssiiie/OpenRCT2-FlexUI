import { isWeighted } from "@src/positional/parsing/parsedScale";
import { convertToPixels, parseScale } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { isArray } from "@src/utilities/type";
import { BuildOutput } from "@src/windows/buildOutput";
import { Layoutable } from "@src/windows/layoutable";
import { toWidgetCreator, WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { Child, container } from "../container";
import { FlexiblePosition } from "../flexible/flexiblePosition";
import { AbsolutePosition } from "./absolutePosition";
import { ParsedAbsolutePosition } from "./parsedAbsolutePosition";


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
	return toWidgetCreator(AbsoluteLayoutControl, params);
}


class AbsoluteLayoutControl<Position> implements Layoutable
{
	_children: Child<ParsedAbsolutePosition>[];

	_weightedTotalWidth: number;
	_weightedTotalHeight: number;

	constructor(output: BuildOutput, params: (AbsoluteLayoutParams | AbsoluteLayoutContainer) & Position)
	{
		const creators = (isArray(params)) ? params : params.content;
		const children = container(output, creators, position =>
		({
			x: parseScale(position.x),
			y: parseScale(position.y),
			_width: parseScale(position.width),
			_height: parseScale(position.height)
		}));
		const count = children.length;
		let weightedTotalWidth = 0;
		let weightedTotalHeight = 0;
		let child: Child<ParsedAbsolutePosition>;
		let idx = 0;

		for (; idx < count; idx++)
		{
			child = children[idx];
			if (child._skip)
			{
				continue;
			}

			const width = child._width;
			const height = child._height;

			if (isWeighted(width))
			{
				weightedTotalWidth += width[0];
			}
			if (isWeighted(height))
			{
				weightedTotalHeight += height[0];
			}
		}

		this._children = children;
		this._weightedTotalWidth = weightedTotalWidth;
		this._weightedTotalHeight = weightedTotalHeight;
	}

	layout(widgets: WidgetMap, area: Rectangle): void
	{
		const children = this._children;
		const count = children.length;
		const weightedTotalWidth = this._weightedTotalWidth;
		const weightedTotalHeight = this._weightedTotalHeight;
		const leftoverWidth = area.width;
		const leftoverHeight = area.height;
		const rect = <Rectangle>{}; // Reuse the rect for every element to reduce allocation.
		let child: Child<ParsedAbsolutePosition>;

		for (let i = 0; i < count; i++)
		{
			child = children[i];
			if (child._skip)
			{
				continue;
			}

			rect.x = (area.x + convertToPixels(child.x, leftoverWidth, weightedTotalWidth, 0));
			rect.y = (area.y + convertToPixels(child.y, leftoverHeight, weightedTotalHeight, 0));
			rect.width = convertToPixels(child._width, leftoverWidth, weightedTotalWidth, 0);
			rect.height = convertToPixels(child._height, leftoverHeight, weightedTotalHeight, 0);

			child._layoutable.layout(widgets, rect);
		}
	}
}
