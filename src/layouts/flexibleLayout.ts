import { Direction } from "@src/positional/direction";
import { FlexiblePosition } from "@src/positional/flexiblePosition";
import { Padding } from "@src/positional/padding";
import { Rectangle } from "@src/positional/rectangle";
import { convertToPixels, ParsedScale, parseScale, Scale, ScaleType } from "@src/positional/scale";
import { isArray, isObject } from "@src/utilities/type";


/**
 * Lay out all elements over the specified area and direction, then calls apply for each element.
 */
export function flexibleLayout(elements: FlexiblePosition[], parentArea: Rectangle, direction: Direction, spacing: Scale, apply: (index: number, childArea: Rectangle) => void): void
{
	const elementCount = elements.length;
	if (!elementCount)
		return;

	const keys = getDirectionKeys(direction);

	// First pass: calculate absolute space use and total weight.
	const stack: ParsedStack = parseFlexibleElements(elements, spacing, keys, parentArea);

	// Second pass: calculate positions and relative sizes with leftover space.
	const leftoverSpace = (parentArea[keys._mainSize] - stack._absoluteSpace);
	const spaceInPixels = convertToPixels(stack._spacing, leftoverSpace, stack._weightedTotal);
	//leftoverSpace -= (spaceInPixels * (elementCount - 1));

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
			const vecStart = convertToPixels(parsed._mainStart, leftoverSpace, stack._weightedTotal);
			const vecEnd = convertToPixels(parsed._mainEnd, leftoverSpace, stack._weightedTotal);
			mainAxis += vecStart;
			mainSize -= (vecStart + vecEnd);
			const otherStart = convertToPixels(parsed._otherStart, otherSpace, otherSpace);
			const otherEnd = convertToPixels(parsed._otherEnd, otherSpace, otherSpace);
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
export function applyPadding(area: Rectangle, padding: Padding): void
{
	const parsed = {} as ParsedStackElement;
	const keys = { _mainDirection: Direction.Horizontal, _otherDirection: Direction.Vertical };

	parsePadding(padding, parsed, keys as DirectionKeys);

	if (!parsed._hasPadding)
		return;

	const width = area.width, height = area.height;
	const left = convertToPixels(parsed._mainStart, width, width);
	const top = convertToPixels(parsed._otherStart, height, height);
	area.x += left;
	area.y += top;
	area.width -= (left + convertToPixels(parsed._mainEnd, width, width));
	area.height -= (top + convertToPixels(parsed._otherEnd, height, height));
}


type AxisKey = "x" | "y";
type SizeKey = "width" | "height";
type StartKey = "top" | "left";
type EndKey = "bottom" | "right";


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


// Contains the keys to use for reading out the padding.
interface PaddingKeys
{
	_mainStart: StartKey;
	_mainEnd: EndKey;
	_otherStart: StartKey;
	_otherEnd: EndKey;
}


// Specifies the starting or ending side of padding on a single axis.
const enum PaddingSide
{
	Start = 0,
	End = 1
}


// A parsed stack of widget elements.
interface ParsedStack
{
	_elements: ParsedStackElement[];
	_absoluteSpace: number;
	_weightedTotal: number;
	_spacing: ParsedScale;
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


/**
 * Parses all specified child positions
 */
function parseFlexibleElements(elements: FlexiblePosition[], spacing: Scale, keys: DirectionKeys, area: Rectangle): ParsedStack
{
	const elementCount = elements.length;
	const stack: ParsedStack = {
		_elements: Array<ParsedStackElement>(elementCount),
		_absoluteSpace: 0,
		_weightedTotal: 0,
		_spacing: parseScale(spacing)
	};

	let layoutMainSize = area[keys._mainSize];
	const layoutOtherSize = area[keys._otherSize];

	// Parse spacing in between elements
	const space = stack._spacing;
	const spaceType = space[1];
	if (spaceType === ScaleType.Weight)
	{
		stack._weightedTotal += (space[0] * (elementCount - 1));
	}
	else if (spaceType === ScaleType.Pixel)
	{
		const pixelSize = (space[0] * (elementCount - 1));
		stack._absoluteSpace += pixelSize;
		layoutMainSize -= pixelSize;
	}

	const childMainSize = (layoutMainSize / elementCount);

	// First pass: parse all values to numbers.
	for (let i = 0; i < elementCount; i++)
	{
		const params = elements[i];
		const parsed =
		{
			_mainSize: parseScale(params[keys._mainSize], childMainSize, ScaleType.Weight),
			_otherSize: parseScale(params[keys._otherSize], layoutOtherSize, ScaleType.Weight),
		} as ParsedStackElement;

		// Parse padding
		parsePadding(params.padding, parsed, keys);

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
 * Gets the property keys which should to lay out get the correct padding values
 * for the widgets in the specified direction.
 */
function getPaddingKeys(direction: Direction): PaddingKeys
{
	if (direction === Direction.Vertical)
	{
		return {
			_mainStart: "top",
			_mainEnd: "bottom",
			_otherStart: "left",
			_otherEnd: "right"
		};
	}
	else
	{
		return {
			_mainStart: "left",
			_mainEnd: "right",
			_otherStart: "top",
			_otherEnd: "bottom"
		};
	}
}


function parsePadding(padding: Padding | undefined, target: ParsedStackElement, keys: DirectionKeys): void
{
	if (padding === undefined)
	{
		// padding not specified, apply no padding.
		target._hasPadding = false;
	}
	else if (isArray(padding))
	{
		// padding specified as 2 or 4 item tuple.
		const length = padding.length;
		if (length === 2)
		{
			const vectorDir = parseScale(padding[keys._mainDirection]);
			const otherDir = parseScale(padding[keys._otherDirection]);
			setPaddingOnParsedElement(target, vectorDir, vectorDir, otherDir, otherDir);
		}
		else if (length === 4)
		{
			setPaddingOnParsedElement(
				target,
				parseScale(padding[(keys._mainDirection << 1) + PaddingSide.Start]),
				parseScale(padding[(keys._mainDirection << 1) + PaddingSide.End]),
				parseScale(padding[(keys._otherDirection << 1) + PaddingSide.Start]),
				parseScale(padding[(keys._otherDirection << 1) + PaddingSide.End])
			);
		}
		else
			throw new Error(`Padding array of unknown length: ${length}. Only lengths of 2 or 4 are supported.`);
	}
	else if (isObject(padding))
	{
		// padding specified as object
		const padKeys = getPaddingKeys(keys._mainDirection);
		setPaddingOnParsedElement(
			target,
			parseScale(padding[padKeys._mainStart]),
			parseScale(padding[padKeys._mainEnd]),
			parseScale(padding[padKeys._otherStart]),
			parseScale(padding[padKeys._otherEnd])
		);
	}
	else
	{
		// padding specified as number or string
		const value = parseScale(padding);
		setPaddingOnParsedElement(target, value, value, value, value);
	}
}


/**
 * Writes the values to the stacked element.
 */
function setPaddingOnParsedElement(target: ParsedStackElement, mainStart: ParsedScale, mainEnd: ParsedScale, otherStart: ParsedScale, otherEnd: ParsedScale): void
{
	target._mainStart = mainStart;
	target._mainEnd = mainEnd;
	target._otherStart = otherStart;
	target._otherEnd = otherEnd;
	target._hasPadding = (mainStart[0] !== 0 || mainEnd[0] !== 0 || otherStart[0] !== 0 || otherEnd[0] !== 0);
}