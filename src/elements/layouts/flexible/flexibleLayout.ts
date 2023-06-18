import { FlexiblePosition } from "@src/elements/layouts/flexible/flexiblePosition";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Parsed } from "@src/positional/parsing/parsed";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { isAbsolute, isPercentile, isWeighted, ParsedScale } from "@src/positional/parsing/parsedScale";
import { convertToPixels } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { applyPaddingToDirection, axisKeys, endKeys, setSizeWithPaddingForDirection, sizeKeys, startKeys } from "../paddingHelpers";


/**
 * Lay out all elements over the specified area and direction, then calls apply for each element.
 */
export function flexibleLayout(elements: Parsed<FlexiblePosition>[], parentArea: Rectangle, layoutDirection: LayoutDirection, spacing: ParsedScale, apply: (index: number, childArea: Rectangle) => void): void
{
	const elementCount = elements.length;
	if (!elementCount)
		return;

	const otherDirection = (layoutDirection == LayoutDirection.Horizontal)
		? LayoutDirection.Vertical : LayoutDirection.Horizontal;

	// First pass: calculate available and used space.
	const stack = parseFlexibleElements(elements, spacing, layoutDirection, otherDirection);
	const leftoverSpace = (parentArea[sizeKeys[layoutDirection]] - stack._requestedPixels);
	const weightedTotal = stack._requestedWeightTotal;
	const percentileTotal = stack._requestedPercentile;
	const spaceInPixels = convertToPixels(spacing, leftoverSpace, weightedTotal, percentileTotal);

	// Second pass: compute locations and update widgets.
	let cursor = 0;
	for (let i = 0; i < elementCount; i++)
	{
		const parsed = stack._elements[i];
		const mainAxis = (cursor + parentArea[axisKeys[layoutDirection]]);
		const mainSize = convertToPixels(parsed._mainSize, leftoverSpace, weightedTotal, percentileTotal);
		const padding = parsed._padding;

		const childArea = {} as Rectangle;
		childArea[axisKeys[layoutDirection]] = mainAxis;
		childArea[sizeKeys[layoutDirection]] = mainSize;
		childArea[axisKeys[otherDirection]] = parentArea[axisKeys[otherDirection]];
		childArea[sizeKeys[otherDirection]] = parentArea[sizeKeys[otherDirection]];

		cursor += applyPaddingToDirection(childArea, layoutDirection, padding, leftoverSpace, weightedTotal, percentileTotal);
		setSizeWithPaddingForDirection(childArea, otherDirection, parsed._otherSize, padding);

		apply(i, childArea);
		cursor += spaceInPixels;
	}
}


// A parsed stack of widget elements.
interface ParsedStack
{
	_elements: ParsedStackElement[];
	_requestedPixels: number;
	_requestedPercentile: number;
	_requestedWeightTotal: number;
}

// The parsed scales for a specific element.
interface ParsedStackElement
{
	_mainSize: ParsedScale;
	_otherSize: ParsedScale;
	_padding: ParsedPadding;
}


/**
 * Parses all specified child positions
 */
function parseFlexibleElements(elements: Parsed<FlexiblePosition>[], spacing: ParsedScale, mainDirection: LayoutDirection, otherDirection: LayoutDirection): ParsedStack
{
	const elementCount = elements.length;
	const stack: ParsedStack = {
		_elements: Array<ParsedStackElement>(elementCount),
		_requestedPixels: 0,
		_requestedPercentile: 0,
		_requestedWeightTotal: 0
	};

	// Parse spacing in between elements
	addScaleToStack(spacing, stack, (elementCount - 1));

	// First pass: parse all values to numbers.
	for (let i = 0; i < elementCount; i++)
	{
		const params = elements[i], padding = params.padding;
		const parsed: ParsedStackElement =
		{
			_mainSize: params[sizeKeys[mainDirection]],
			_otherSize: params[sizeKeys[otherDirection]],
			_padding: padding
		};
		stack._elements[i] = parsed;

		// Add size of current element to totals
		const
			size = parsed._mainSize,
			start = parsed._padding[startKeys[mainDirection]],
			end = parsed._padding[endKeys[mainDirection]];

		addScaleToStack(size, stack);
		addScaleToStack(start, stack);
		addScaleToStack(end, stack);
	}
	return stack;
}


/**
 * Adds the specified scale to the stack's weighted total or absolute space,
 * depending on whether it's a weighted or absolute scale.
 */
function addScaleToStack(scale: ParsedScale, stack: ParsedStack, multiplier: number = 1): void
{
	const value = (scale[0] * multiplier);
	if (isWeighted(scale))
	{
		stack._requestedWeightTotal += value;
	}
	else if (isAbsolute(scale))
	{
		stack._requestedPixels += value;
	}
	else if (isPercentile(scale))
	{
		stack._requestedPercentile += value;
	}
}
