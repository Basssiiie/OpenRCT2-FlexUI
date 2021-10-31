import { Direction } from "@src/positional/direction";
import { FlexiblePosition } from "@src/positional/flexiblePosition";
import { Padding } from "@src/positional/padding";
import { Rectangle } from "@src/positional/rectangle";
import { Scale } from "@src/positional/scale";
import { isArray, isNumber, isObject } from "@src/utilities/type";


/**
 * Lay out all elements over the specified area and direction, then calls apply for each element.
 */
export function flexibleLayout(elements: FlexiblePosition[], parentArea: Rectangle, direction: Direction, apply: (index: number, childArea: Rectangle) => void): void
{
	const keys = getDirectionKeys(direction);

	// First pass: calculate absolute space use and total weight.
	const stack: ParsedStack = parseFlexibleElements(elements, keys, parentArea);

	// Second pass: calculate positions and relative sizes with leftover space.
	const leftoverSpace = (parentArea[keys.mainSize] - stack.absoluteSpace);
	let cursor = 0;

	for (let i = 0; i < elements.length; i++)
	{
		const parsed = stack.elements[i];
		const otherSpace = parentArea[keys.otherSize];

		let mainAxis = (cursor + parentArea[keys.mainAxis]),
			mainSize = applyScale(parsed.mainSize, leftoverSpace, stack.weightedTotal),
			otherAxis = parentArea[keys.otherAxis],
			otherSize = applyScale(parsed.otherSize, otherSpace);

		cursor += mainSize;

		if (parsed.hasPadding)
		{
			const vecStart = applyScale(parsed.mainStart, leftoverSpace, stack.weightedTotal);
			const vecEnd = applyScale(parsed.mainEnd, leftoverSpace, stack.weightedTotal);
			mainAxis += vecStart;
			mainSize -= (vecStart + vecEnd);
			const otherStart = applyScale(parsed.otherStart, otherSpace, otherSpace);
			const otherEnd = applyScale(parsed.otherEnd, otherSpace, otherSpace);
			otherAxis += otherStart;
			otherSize -= (otherStart + otherEnd);
		}

		const childArea = {} as Rectangle;
		childArea[keys.mainAxis] = mainAxis;
		childArea[keys.mainSize] = mainSize;
		childArea[keys.otherAxis] = otherAxis;
		childArea[keys.otherSize] = otherSize;

		apply(i, childArea);
	}
}

/**
 * Applies padding to a specific area as a whole.
 */
export function applyPadding(area: Rectangle, padding: Padding): void
{
	const parsed = {} as ParsedStackElement;
	const keys = { mainDirection: Direction.Horizontal, otherDirection: Direction.Vertical };

	parsePadding(padding, parsed, keys as DirectionKeys);

	if (!parsed.hasPadding)
		return;

	const width = area.width, height = area.height;
	const left = applyScale(parsed.mainStart, width, width);
	const top = applyScale(parsed.otherStart, height, height);
	area.x += left;
	area.y += top;
	area.width -= (left + applyScale(parsed.mainEnd, width, width));
	area.height -= (top + applyScale(parsed.otherEnd, height, height));
}


type AxisKey = "x" | "y";
type SizeKey = "width" | "height";
type StartKey = "top" | "left";
type EndKey = "bottom" | "right";


// Contains the keys to use for laying out the widgets.
interface DirectionKeys
{
	mainDirection: Direction;
	mainAxis: AxisKey;
	mainSize: SizeKey;
	otherDirection: Direction;
	otherAxis: AxisKey;
	otherSize: SizeKey;
}


// Contains the keys to use for reading out the padding.
interface PaddingKeys
{
	mainStart: StartKey;
	mainEnd: EndKey;
	otherStart: StartKey;
	otherEnd: EndKey;
}


// Specifies the starting or ending side of padding on a single axis.
const enum PaddingSide
{
	Start = 0,
	End = 1
}


// Specifies the type of scaling used in a specified scale.
const enum ScaleType
{
	Pixel = 0,
	Percentage = 1,
	Weight = 2
}


// A scale value split into the hard number and its type.
type ParsedScale = [number, ScaleType];


// A parsed stack of widget elements.
interface ParsedStack
{
	elements: ParsedStackElement[];
	absoluteSpace: number;
	weightedTotal: number;
}

// The parsed scales for a specific element.
interface ParsedStackElement
{
	mainSize: ParsedScale;
	otherSize: ParsedScale;
	hasPadding: boolean;
	mainStart: ParsedScale;
	mainEnd: ParsedScale;
	otherStart: ParsedScale;
	otherEnd: ParsedScale;
}


/**
 * Parses all specified child positions
 */
function parseFlexibleElements(elements: FlexiblePosition[], keys: DirectionKeys, area: Rectangle): ParsedStack
{
	const elementCount = elements.length;
	const stack: ParsedStack = {
		elements: Array<ParsedStackElement>(elementCount),
		absoluteSpace: 0,
		weightedTotal: 0
	};

	// First pass: parse all values to numbers.
	for (let i = 0; i < elementCount; i++)
	{
		const params = elements[i];
		const parsed =
		{
			mainSize: parseScale(params[keys.mainSize], area[keys.mainSize] / elementCount, ScaleType.Weight),
			otherSize: parseScale(params[keys.otherSize], area[keys.otherSize], ScaleType.Weight),
		} as ParsedStackElement;

		// Parse padding
		parsePadding(params.padding, parsed, keys);

		stack.elements[i] = parsed;

		// Add size of current element to totals
		const type = parsed.mainSize[1];
		if (type === ScaleType.Weight)
		{
			stack.weightedTotal += parsed.mainSize[0];
		}
		else if (type === ScaleType.Pixel)
		{
			stack.absoluteSpace += parsed.mainSize[0];
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
			mainDirection: direction,
			mainAxis: "y",
			mainSize: "height",
			otherDirection: Direction.Horizontal,
			otherAxis: "x",
			otherSize: "width"
		};
	}
	else
	{
		return {
			mainDirection: direction,
			mainAxis: "x",
			mainSize: "width",
			otherDirection: Direction.Vertical,
			otherAxis: "y",
			otherSize: "height"
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
			mainStart: "top",
			mainEnd: "bottom",
			otherStart: "left",
			otherEnd: "right"
		};
	}
	else
	{
		return {
			mainStart: "left",
			mainEnd: "right",
			otherStart: "top",
			otherEnd: "bottom"
		};
	}
}



function parseScale(value: Scale | undefined, fallback: number = 0, fallbackType: ScaleType = ScaleType.Pixel): ParsedScale
{
	if (value === undefined)
	{
		return [fallback, fallbackType];
	}

	// Number = weighted value.
	if (isNumber(value))
	{
		return [value, ScaleType.Weight];
	}

	const trimmed = value.trim();
	const length = trimmed.length;

	if (length > 1)
	{
		let endIdx: number = (length - 1);
		let type: ScaleType | undefined;
		const last = trimmed[endIdx];

		if (last === "w")
		{
			type = ScaleType.Weight;
		}
		else if (last === "%")
		{
			type = ScaleType.Percentage;
		}
		else if (length > 2)
		{
			endIdx = (length - 2);
			if (last === "x" && trimmed[endIdx] === "p")
			{
				type = ScaleType.Pixel;
			}
		}

		if (type !== undefined)
		{
			const num = Number.parseInt(trimmed.substring(0, endIdx));
			return [num, type];
		}
	}

	throw new Error(`Value '${value}' is not a valid scale.`);
}



function parsePadding(padding: Padding | undefined, target: ParsedStackElement, keys: DirectionKeys): void
{
	if (padding === undefined)
	{
		// padding not specified, apply no padding.
		target.hasPadding = false;
		return;
	}

	target.hasPadding = true;
	if (isArray(padding))
	{
		// padding specified as 2 or 4 item tuple.
		const length = padding.length;
		if (length === 2)
		{
			const vectorDir = parseScale(padding[keys.mainDirection]);
			target.mainStart = vectorDir;
			target.mainEnd = vectorDir;
			const otherDir = parseScale(padding[keys.otherDirection]);
			target.otherStart = otherDir;
			target.otherEnd = otherDir;
		}
		else if (length === 4)
		{
			target.mainStart = parseScale(padding[(keys.mainDirection << 1) + PaddingSide.Start]);
			target.mainEnd = parseScale(padding[(keys.mainDirection << 1) + PaddingSide.End]);
			target.otherStart = parseScale(padding[(keys.otherDirection << 1) + PaddingSide.Start]);
			target.otherEnd = parseScale(padding[(keys.otherDirection << 1) + PaddingSide.End]);
		}
		else
			throw new Error(`Padding array of unknown length: ${length}. Only lengths of 2 or 4 are supported.`);
	}
	else if (isObject(padding))
	{
		// padding specified as object
		const padKeys = getPaddingKeys(keys.mainDirection);
		target.mainStart = parseScale(padding[padKeys.mainStart]);
		target.mainEnd = parseScale(padding[padKeys.mainEnd]);
		target.otherStart = parseScale(padding[padKeys.otherStart]);
		target.otherEnd = parseScale(padding[padKeys.otherEnd]);
	}
	else
	{
		// padding specified as number or string
		const value = parseScale(padding);
		target.mainStart = value;
		target.mainEnd = value;
		target.otherStart = value;
		target.otherEnd = value;
	}
}



function applyScale(scale: ParsedScale, leftoverSpace: number, weightedTotal?: number): number
{
	switch (scale[1])
	{
		case ScaleType.Pixel:
			return scale[0];

		case ScaleType.Weight:
			return (weightedTotal === undefined)
				? leftoverSpace
				: Math.round((scale[0] / weightedTotal) * leftoverSpace);

		case ScaleType.Percentage:
			return Math.round((scale[0] * 0.01) * leftoverSpace);
	}
}