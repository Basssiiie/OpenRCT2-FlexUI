import { FlexiblePosition } from "@src/elements/layouts/flexible/flexiblePosition";
import { Direction } from "@src/positional/direction";
import { Parsed } from "@src/positional/parsing/parsed";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { isAbsolute, isWeighted, ParsedScale } from "@src/positional/parsing/parsedScale";
import { convertToPixels } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { applyPaddingToDirection, hasPadding } from "../paddingHelpers";


/**
 * Lay out all elements over the specified area and direction, then calls apply for each element.
 */
export function flexibleLayout(elements: Parsed<FlexiblePosition>[], parentArea: Rectangle, direction: Direction, spacing: ParsedScale, apply: (index: number, childArea: Rectangle) => void): void
{
	const elementCount = elements.length;
	if (!elementCount)
		return;

	const keys = getDirectionKeys(direction);

	// First pass: calculate available and used space.
	const
		stack = parseFlexibleElements(elements, spacing, keys),
		leftoverSpace = (parentArea[keys._mainSize] - stack._absoluteSpace),
		spaceInPixels = convertToPixels(spacing, leftoverSpace, stack._weightedTotal);

	// Second pass: compute locations and update widgets.
	let cursor = 0;
	for (let i = 0; i < elementCount; i++)
	{
		const
			parsed = stack._elements[i],
			mainAxis = (cursor + parentArea[keys._mainAxis]),
			mainSize = convertToPixels(parsed._mainSize, leftoverSpace, stack._weightedTotal),
			otherAxis = parentArea[keys._otherAxis],
			otherSize = parentArea[keys._otherSize],
			padding = parsed._padding;

		const childArea = {} as Rectangle;
		childArea[keys._mainAxis] = mainAxis;
		childArea[keys._mainSize] = mainSize;
		childArea[keys._otherAxis] = otherAxis;
		childArea[keys._otherSize] = otherSize; // set to full size first, for padding.

		if (hasPadding(padding))
		{
			applyPaddingToDirection(childArea, keys._mainDirection, parsed._mainSize, padding);
			applyPaddingToDirection(childArea, keys._otherDirection, parsed._otherSize, padding);
		}
		else
		{
			// If the child requested a smaller size, apply it here.
			childArea[keys._otherSize] = convertToPixels(parsed._otherSize, otherSize);
		}

		apply(i, childArea);

		cursor += mainSize;
		cursor += spaceInPixels;
	}
}


type AxisKey = "x" | "y";
type SizeKey = "width" | "height";


// Contains the keys to use for laying out the widgets.
interface DirectionKeys
{
	_mainDirection: Direction;
	_mainAxis: AxisKey;
	_mainSize: SizeKey;
	_otherDirection: Direction;
	_otherAxis: AxisKey;
	_otherSize: SizeKey;
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
function parseFlexibleElements(elements: Parsed<FlexiblePosition>[], spacing: ParsedScale, keys: DirectionKeys): ParsedStack
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
			_mainSize: params[keys._mainSize],
			_otherSize: params[keys._otherSize],
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
		}
	}
	return stack;
}


/**
 * Gets the property keys which should be used to lay out the widgets in the
 * specified direction.
 */
function getDirectionKeys(direction: Direction): DirectionKeys
{
	if (direction === Direction.Vertical)
	{
		return {
			_mainDirection: direction,
			_mainAxis: "y",
			_mainSize: "height",
			_otherDirection: Direction.Horizontal,
			_otherAxis: "x",
			_otherSize: "width"
		};
	}
	else
	{
		return {
			_mainDirection: direction,
			_mainAxis: "x",
			_mainSize: "width",
			_otherDirection: Direction.Vertical,
			_otherAxis: "y",
			_otherSize: "height"
		};
	}
}