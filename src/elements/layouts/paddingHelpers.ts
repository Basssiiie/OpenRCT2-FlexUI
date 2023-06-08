import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { isAbsolute, isPercentile, isWeighted, ParsedScale } from "@src/positional/parsing/parsedScale";
import { convertToPixels } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import * as Log from "@src/utilities/logger";
import { FrameRectangle } from "@src/windows/frames/frameRectangle";


/**
 * Keys for accessing values directionally
 */
export const
	axisKeys = ["y", "x"] as const,
	sizeKeys = ["height", "width"] as const,
	startKeys = ["top", "left"] as const,
	endKeys = ["bottom", "right"] as const;


/**
 * Returns true if any of the padding sides has a non-zero value.
 */
export function hasPadding(padding: ParsedPadding | undefined): boolean
{
	return (!!padding && (padding.top[0] !== 0 || padding.bottom[0] !== 0 || padding.left[0] !== 0 || padding.right[0] !== 0));
}


/**
 * Returns the total amount of absolute padding for the specified direction. Throws an error
 * if one of the padding values is not absolute.
 */
export function setAbsolutePaddingForDirection(area: FrameRectangle, padding: ParsedPadding, direction: LayoutDirection): number
{
	const startPad = padding[startKeys[direction]];
	const endPad = padding[endKeys[direction]];

	if (!isAbsolute(startPad) || !isAbsolute(endPad))
	{
		Log.thrown("Window padding must be absolute for \"auto\" window size.");
	}

	area[axisKeys[direction]] += startPad[0];
	return (startPad[0] + endPad[0]);
}


/**
 * Applies padding to a specific area as a whole.
 */
export function setSizeWithPadding(area: Rectangle, width: ParsedScale, height: ParsedScale, padding: ParsedPadding): void
{
	setSizeWithPaddingForDirection(area, LayoutDirection.Horizontal, width, padding);
	setSizeWithPaddingForDirection(area, LayoutDirection.Vertical, height, padding);
}


/**
 * Sets the size and padding to a specific area as a whole on the specified direction. Area is
 * interpreted as the available space and updated accordingly. Returns total space used.
 */
export function setSizeWithPaddingForDirection(area: Rectangle, direction: LayoutDirection, size: ParsedScale, padding: ParsedPadding): number
{
	const
		sizeKey = sizeKeys[direction],
		paddingStart = padding[startKeys[direction]],
		paddingEnd = padding[endKeys[direction]],
		leftoverSpace = (area[sizeKey] - calculateTotal(size, paddingStart, paddingEnd, isAbsolute)),
		percentileTotal = calculateTotal(size, paddingStart, paddingEnd, isPercentile),
		weightedTotal = calculateTotal(size, paddingStart, paddingEnd, isWeighted),
		sizePixels = convertToPixels(size, leftoverSpace, weightedTotal, percentileTotal);

	area[sizeKey] = sizePixels;

	return applyPaddingToDirection(area, direction, padding, leftoverSpace, weightedTotal, percentileTotal);
}


/**
 * Applies padding to a specific area as a whole on the specified direction. Returns total space used.
 */
export function applyPaddingToDirection(area: Rectangle, direction: LayoutDirection, padding: ParsedPadding, leftoverSpace: number, weightedTotal: number, percentileTotal: number): number
{
	return applyPaddingToAxis(area, padding, leftoverSpace, weightedTotal, percentileTotal, axisKeys[direction], sizeKeys[direction], startKeys[direction], endKeys[direction]);
}


/**
 * Applies padding to the specified axis. Returns total space used.
 */
function applyPaddingToAxis(area: Rectangle, padding: ParsedPadding, leftoverSpace: number, weightedTotal: number, percentileTotal: number,
	axisKey: typeof axisKeys[number], sizeKey: typeof sizeKeys[number], startKey: typeof startKeys[number], endKey: typeof endKeys[number]): number
{
	const
		startPixels = convertToPixels(padding[startKey], leftoverSpace, weightedTotal, percentileTotal),
		endPixels = convertToPixels(padding[endKey], leftoverSpace, weightedTotal, percentileTotal);

	area[axisKey] += startPixels;
	return (startPixels + area[sizeKey] + endPixels);
}


/**
 * Inner total is the sum of the base weight and both sides of padding, whichever match with the parsed scale type check.
 */
function calculateTotal(size: ParsedScale, paddingStart: ParsedScale, paddingEnd: ParsedScale, check: (scale: ParsedScale) => boolean): number
{
	let total = 0;

	if (check(size))
		total += size[0];
	if (check(paddingStart))
		total += paddingStart[0];
	if (check(paddingEnd))
		total += paddingEnd[0];

	return total;
}