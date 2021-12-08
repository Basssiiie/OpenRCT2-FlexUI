import { zeroScale } from "@src/elements/constants";
import { Direction } from "@src/positional/direction";
import { FlexiblePosition } from "@src/elements/layouts/flexible/flexiblePosition";
import { ParsedPadding } from "@src/positional/padding";
import { Parsed } from "@src/positional/parsed";
import { Rectangle } from "@src/positional/rectangle";
import { convertToPixels, ParsedScale, ScaleType } from "@src/positional/scale";
import { isUndefined } from "@src/utilities/type";


/**
 * Lay out all elements over the specified area and direction, then calls apply for each element.
 */
export function flexibleLayout(elements: Parsed<FlexiblePosition>[], parentArea: Rectangle, direction: Direction, spacing: ParsedScale, apply: (index: number, childArea: Rectangle) => void): void
{
	const elementCount = elements.length;
	if (!elementCount)
		return;

	const keys = getDirectionKeys(direction);

	// First pass: calculate absolute space use and total weight.
	const stack: ParsedStack = parseFlexibleElements(elements, spacing, keys);

	// Second pass: calculate positions and relative sizes with leftover space.
	const leftoverSpace = (parentArea[keys._mainSize] - stack._absoluteSpace);
	const spaceInPixels = convertToPixels(spacing, leftoverSpace, stack._weightedTotal);

	let cursor = 0;

	for (let i = 0; i < elementCount; i++)
	{
		const parsed = stack._elements[i];
		const otherSpace = parentArea[keys._otherSize];

		let mainAxis = (cursor + parentArea[keys._mainAxis]),
			mainSize = convertToPixels(parsed._mainSize, leftoverSpace, stack._weightedTotal),
			otherAxis = parentArea[keys._otherAxis],
			otherSize = convertToPixels(parsed._otherSize, otherSpace);

		cursor += mainSize;
		cursor += spaceInPixels;

		if (parsed._hasPadding)
		{
			const mainStart = convertToPixels(parsed._mainStart, leftoverSpace, stack._weightedTotal);
			const mainEnd = convertToPixels(parsed._mainEnd, leftoverSpace, stack._weightedTotal);
			mainAxis += mainStart;
			mainSize -= (mainStart + mainEnd);
			const otherStart = convertToPixels(parsed._otherStart, otherSpace, 1);
			const otherEnd = convertToPixels(parsed._otherEnd, otherSpace, 1);
			otherAxis += otherStart;
			otherSize -= (otherStart + otherEnd);
		}

		const childArea = {} as Rectangle;
		childArea[keys._mainAxis] = Math.round(mainAxis);
		childArea[keys._mainSize] = Math.round(mainSize);
		childArea[keys._otherAxis] = Math.round(otherAxis);
		childArea[keys._otherSize] = Math.round(otherSize);

		apply(i, childArea);
	}
}

/**
 * Applies padding to a specific area as a whole.
 */
export function applyPadding(area: Rectangle, padding: ParsedPadding): void
{
	const parsed = {} as ParsedStackElement;
	setPaddingToDirection(padding, parsed, Direction.Vertical);

	if (!parsed._hasPadding)
		return;

	const width = area.width, height = area.height;
	const left = convertToPixels(parsed._otherStart, height, height);
	const top = convertToPixels(parsed._mainStart, width, width);
	area.x += left;
	area.y += top;
	area.width -= (left + convertToPixels(parsed._otherEnd, width, width));
	area.height -= (top + convertToPixels(parsed._mainEnd, height, height));
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
	_hasPadding: boolean;
	_mainStart: ParsedScale;
	_mainEnd: ParsedScale;
	_otherStart: ParsedScale;
	_otherEnd: ParsedScale;
}


const defaultScale: ParsedScale = [1, ScaleType.Weight];


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
	const spaceType = spacing[1];
	if (spaceType === ScaleType.Weight)
	{
		stack._weightedTotal += (spacing[0] * (elementCount - 1));
	}
	else if (spaceType === ScaleType.Pixel)
	{
		const pixelSize = (spacing[0] * (elementCount - 1));
		stack._absoluteSpace += pixelSize;
	}

	// First pass: parse all values to numbers.
	for (let i = 0; i < elementCount; i++)
	{
		const params = elements[i];
		const parsed =
		{
			_mainSize: params[keys._mainSize] || defaultScale,
			_otherSize: params[keys._otherSize] || defaultScale,
		} as ParsedStackElement;

		// Apply padding
		setPaddingToDirection(params.padding, parsed, keys._mainDirection);

		stack._elements[i] = parsed;

		// Add size of current element to totals
		const type = parsed._mainSize[1];
		if (type === ScaleType.Weight)
		{
			stack._weightedTotal += parsed._mainSize[0];
		}
		else if (type === ScaleType.Pixel)
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


/**
 * Uses the selected direction to apply padding to the target.
 */
function setPaddingToDirection(padding: ParsedPadding | undefined, target: ParsedStackElement, direction: Direction): void
{
	if (isUndefined(padding))
	{
		// padding not specified, apply no padding.
		target._hasPadding = false;
		return;
	}

	if (direction === Direction.Horizontal)
	{
		target._mainStart = padding.left || zeroScale;
		target._mainEnd = padding.right || zeroScale;
		target._otherStart = padding.top || zeroScale;
		target._otherEnd = padding.bottom || zeroScale;
	}
	else
	{
		target._mainStart = padding.top || zeroScale;
		target._mainEnd = padding.bottom || zeroScale;
		target._otherStart = padding.left || zeroScale;
		target._otherEnd = padding.right || zeroScale;
	}
	target._hasPadding = (target._mainStart[0] !== 0 || target._mainEnd[0] !== 0 || target._otherStart[0] !== 0 || target._otherEnd[0] !== 0);
}