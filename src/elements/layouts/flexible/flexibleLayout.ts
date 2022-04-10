import { FlexiblePosition } from "@src/elements/layouts/flexible/flexiblePosition";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Parsed } from "@src/positional/parsing/parsed";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { isAbsolute, isWeighted, ParsedScale } from "@src/positional/parsing/parsedScale";
import { convertToPixels } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { applyPaddingToDirection, axisKeys, endKeys, hasPadding, sizeKeys, startKeys } from "../paddingHelpers";


/**
 * Lay out all elements over the specified area and direction, then calls apply for each element.
 */
export function flexibleLayout(elements: Parsed<FlexiblePosition>[], parentArea: Rectangle, layoutDirection: LayoutDirection, spacing: ParsedScale, apply: (index: number, childArea: Rectangle) => void): void
{
	const elementCount = elements.length;
	if (!elementCount)
		return;

	const otherDirection = (layoutDirection === LayoutDirection.Horizontal)
		? LayoutDirection.Vertical : LayoutDirection.Horizontal;

	// First pass: calculate available and used space.
	const
		stack = parseFlexibleElements(elements, spacing, layoutDirection, otherDirection),
		leftoverSpace = (parentArea[sizeKeys[layoutDirection]] - stack._absoluteSpace),
		spaceInPixels = convertToPixels(spacing, leftoverSpace, stack._weightedTotal);

	// Second pass: compute locations and update widgets.
	let cursor = 0;
	for (let i = 0; i < elementCount; i++)
	{
		const
			parsed = stack._elements[i],
			mainAxis = (cursor + parentArea[axisKeys[layoutDirection]]),
			mainSize = convertToPixels(parsed._mainSize, leftoverSpace, stack._weightedTotal),
			otherAxis = parentArea[axisKeys[otherDirection]],
			otherSize = parentArea[sizeKeys[otherDirection]],
			padding = parsed._padding;

		const childArea = {} as Rectangle;
		childArea[axisKeys[layoutDirection]] = mainAxis;
		childArea[sizeKeys[layoutDirection]] = mainSize;
		childArea[axisKeys[otherDirection]] = otherAxis;
		childArea[sizeKeys[otherDirection]] = otherSize; // set to full size first, for padding.

		if (hasPadding(padding))
		{
			cursor += applyPaddingToDirection(childArea, layoutDirection, parsed._mainSize, padding);
			applyPaddingToDirection(childArea, otherDirection, parsed._otherSize, padding);
		}
		else
		{
			cursor += mainSize;
			// If the child requested a smaller size, apply it here.
			childArea[sizeKeys[otherDirection]] = convertToPixels(parsed._otherSize, otherSize);
		}

		apply(i, childArea);
		cursor += spaceInPixels;
	}
}


// A parsed stack of widget elements.
interface ParsedStack
{
	_elements: ParsedStackElement[];
	_absoluteSpace: number;
	_weightedTotal: number;
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
		_absoluteSpace: 0,
		_weightedTotal: 0
	};

	// Parse spacing in between elements
	if (isAbsolute(spacing))
	{
		const pixelSize = (spacing[0] * (elementCount - 1));
		stack._absoluteSpace += pixelSize;
	}
	else if (isWeighted(spacing))
	{
		stack._weightedTotal += (spacing[0] * (elementCount - 1));
	}

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
		const size = parsed._mainSize;
		if (isWeighted(size))
		{
			stack._weightedTotal += parsed._mainSize[0];
		}
		else if (isAbsolute(size))
		{
			stack._absoluteSpace += parsed._mainSize[0];

			// Absolute padding on absolute size expands outwards instead of inwards.
			const
				start = parsed._padding[startKeys[mainDirection]],
				end = parsed._padding[endKeys[mainDirection]];
			if (isAbsolute(start))
			{
				stack._absoluteSpace += start[0];
			}
			if (isAbsolute(end))
			{
				stack._absoluteSpace += end[0];
			}
		}
	}
	return stack;
}