import { Axis } from "@src/positional/axis";
import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { convertToPixels } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { applyPaddingToDirection, axisKeys, endKeys, setSizeWithPaddingForDirection, sizeKeys, startKeys } from "../paddingHelpers";
import { addScaleToStack, ParsedStack } from "../stack";
import { ParsedFlexiblePosition } from "./parsedFlexiblePosition";


/**
 * Lay out all elements over the specified area and direction, then calls apply for each element.
 */
export function flexibleLayout(stack: ParsedStack, elements: ParsedFlexiblePosition[], parentArea: Rectangle, layoutDirection: Axis, spacing: ParsedScale, apply: (index: number, childArea: Rectangle) => void): void
{
	const elementCount = elements.length;
	const isHorizontal = (layoutDirection == Axis.Horizontal);
	const otherDirection = isHorizontal ? Axis.Vertical : Axis.Horizontal;

	// First pass: calculate available and used space.
	//const stack = parseFlexibleStack(elements, spacing, layoutDirection); // todo: this can probably be cached?
	const leftoverSpace = (parentArea[sizeKeys[layoutDirection]] - stack._requestedPixels);
	const weightedTotal = stack._requestedWeightTotal;
	const percentileTotal = stack._requestedPercentile;
	const spaceInPixels = convertToPixels(spacing, leftoverSpace, weightedTotal, percentileTotal);

	// Second pass: compute locations and update widgets.
	let cursor = 0;
	let i = 0;
	let parsed: ParsedFlexiblePosition;
	for (; i < elementCount; i++)
	{
		parsed = elements[i];
		if (parsed._skip)
		{
			continue;
		}

		const mainAxis = (cursor + parentArea[axisKeys[layoutDirection]]);
		const mainSize = convertToPixels(isHorizontal ? parsed._width : parsed._height, leftoverSpace, weightedTotal, percentileTotal);
		const padding = parsed._padding;

		const childArea = <Rectangle>{};
		childArea[axisKeys[layoutDirection]] = mainAxis;
		childArea[sizeKeys[layoutDirection]] = mainSize;
		childArea[axisKeys[otherDirection]] = parentArea[axisKeys[otherDirection]];
		childArea[sizeKeys[otherDirection]] = parentArea[sizeKeys[otherDirection]];

		cursor += applyPaddingToDirection(childArea, layoutDirection, padding, leftoverSpace, weightedTotal, percentileTotal);
		setSizeWithPaddingForDirection(childArea, otherDirection, isHorizontal ? parsed._height : parsed._width, padding);

		apply(i, childArea);
		cursor += spaceInPixels;
	}
}


export function parseFlexibleStack(stack: ParsedStack, elements: ParsedFlexiblePosition[], spacing: ParsedScale, mainDirection: Axis): number
{
	const elementCount = elements.length;
	//const stack = <ParsedFlexStack>createStack(elementCount, spacing);
	const isHorizontal = mainDirection == Axis.Horizontal;
	let i = 0;
	let visibleCount = 0;
	let element: ParsedFlexiblePosition;

	// First pass: parse all values to numbers.
	for (; i < elementCount; i++)
	{
		element = elements[i];
		if (element._skip)
		{
			continue;
		}

		const padding = element._padding;

		// Add size of current element to totals
		const size = isHorizontal ? element._width : element._height;
		const start = padding[startKeys[mainDirection]];
		const end = padding[endKeys[mainDirection]];

		addScaleToStack(stack, size, 1);
		addScaleToStack(stack, start, 1);
		addScaleToStack(stack, end, 1);
		visibleCount++;
	}

	// Parse spacing in between elements
	addScaleToStack(stack, spacing, (visibleCount - 1));

	return visibleCount;
}


// export type ParsedFlexStack = ParsedStack & { _elements: ParsedStackElement[] };


/**
 * The parsed scales for a specific element.
 */
/* export interface ParsedStackElement
{
	_mainSize: ParsedScale;
	_otherSize: ParsedScale;
	_padding: ParsedPadding;
} */
