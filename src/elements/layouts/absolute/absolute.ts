import { Binder } from "@src/bindings/binder";
import { isWeighted } from "@src/positional/parsing/parsedScale";
import { convertToPixels, parseScale } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { hiddenKey, noneKey } from "@src/positional/visibility";
import { isArray } from "@src/utilities/type";
import { BuildOutput } from "@src/windows/buildOutput";
import { FrameContext } from "@src/windows/frames/frameContext";
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

	constructor(output: BuildOutput, params: (AbsoluteLayoutParams | AbsoluteLayoutContainer) & Position)
	{
		const creators = (isArray(params)) ? params : params.content;
		const frame = output.context;
		const binder = output.binder;

		this._children = container(output, creators, position => bindAbsolutePosition(frame, binder, position));
	}

	layout(widgets: WidgetMap, area: Rectangle | false): void
	{
		const children = this._children;
		const count = children.length;
		let child: Child<ParsedAbsolutePosition>;
		let idx = 0;

		if (!area)
		{
			// Hidden: hide all children, no position calculation is needed.
			for (; idx < count; idx++)
			{
				children[idx]._layoutable.layout(widgets, false);
			}
			return;
		}

		// Bound sizes and visibility can change at runtime, so the weighted totals are recalculated on every layout.
		let weightedTotalWidth = 0;
		let weightedTotalHeight = 0;

		for (; idx < count; idx++)
		{
			child = children[idx];
			if (child._visibility === noneKey)
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

		const leftoverWidth = area.width;
		const leftoverHeight = area.height;
		const rect = <Rectangle>{}; // Reuse the rect for every element to reduce allocation.

		for (idx = 0; idx < count; idx++)
		{
			child = children[idx];
			const visibility = child._visibility;
			if (visibility === noneKey)
			{
				// Takes up no space, but the whole subtree still needs to be hidden.
				child._layoutable.layout(widgets, false);
				continue;
			}

			rect.x = (area.x + convertToPixels(child.x, leftoverWidth, weightedTotalWidth, 0));
			rect.y = (area.y + convertToPixels(child.y, leftoverHeight, weightedTotalHeight, 0));
			rect.width = convertToPixels(child._width, leftoverWidth, weightedTotalWidth, 0);
			rect.height = convertToPixels(child._height, leftoverHeight, weightedTotalHeight, 0);

			child._layoutable.layout(widgets, (visibility === hiddenKey) ? false : rect);
		}
	}
}


/**
 * Performs bindings on a child with absolute positional parameters.
 */
function bindAbsolutePosition(frame: FrameContext, binder: Binder<WidgetBaseDesc>, child: AbsolutePosition): ParsedAbsolutePosition
{
	// All four scales are required, so the binder assigns them synchronously before this returns.
	const parsed = <ParsedAbsolutePosition>{};

	binder.on(child.x, value =>
	{
		parsed.x = parseScale(value);
		frame.redraw();
	});
	binder.on(child.y, value =>
	{
		parsed.y = parseScale(value);
		frame.redraw();
	});
	binder.on(child.width, value =>
	{
		parsed._width = parseScale(value);
		frame.redraw();
	});
	binder.on(child.height, value =>
	{
		parsed._height = parseScale(value);
		frame.redraw();
	});
	binder.on(child.visibility, value =>
	{
		// The guard is required: the binder fires this again when the frame opens.
		if (parsed._visibility !== value)
		{
			parsed._visibility = value;
			frame.redraw();
		}
	});
	return parsed;
}
