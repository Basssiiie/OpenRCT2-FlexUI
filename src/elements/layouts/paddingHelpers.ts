import { Axis, AxisSide } from "@src/positional/axis";
import { PadKey, ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { isAbsolute, isPercentile, isWeighted, ParsedScale } from "@src/positional/parsing/parsedScale";
import { convertToPixels } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import * as Log from "@src/utilities/logger";
import { FrameRectangle } from "@src/windows/frames/frameRectangle";


/**
 * Keys for accessing values directionally
 */
export const
	axisKeys = <const>["y", "x"],
	sizeKeys = <const>["height", "width"];

/**
 * Returns true if any of the padding sides has a non-zero value.
 */
export function hasPadding(padding: ParsedPadding | undefined): boolean
{
	return !!padding
		&& (padding[PadKey.Top][0] !== 0
			|| padding[PadKey.Bottom][0] !== 0
			|| padding[PadKey.Left][0] !== 0
			|| padding[PadKey.Right][0] !== 0
		);
}

/**
 * Returns the total amount of absolute padding for the specified direction. Throws an error
 * if one of the padding values is not absolute. Returns the total amount of padding applied.
 */
export function setAbsolutePaddingForDirection(area: FrameRectangle, padding: ParsedPadding, direction: Axis): number
{
	const startPad = padding[AxisSide.Start + direction];
	const endPad = padding[AxisSide.End + direction];

	if (!isAbsolute(startPad) || !isAbsolute(endPad))
	{
		Log.error("Window padding must be absolute for \"auto\" window size.");
	}

	area[axisKeys[direction]] += startPad[0];
	return (startPad[0] + endPad[0]);
}

/**
 * Applies padding to a specific area as a whole.
 */
export function setSizeWithPadding(area: Rectangle, width: ParsedScale, height: ParsedScale, padding: ParsedPadding): void
{
	setSizeWithPaddingForDirection(area, Axis.Horizontal, width, padding);
	setSizeWithPaddingForDirection(area, Axis.Vertical, height, padding);
}

/**
 * Sets the size and padding to a specific area as a whole on the specified direction. Area is
 * interpreted as the available space and updated accordingly. Returns total space used.
 */
export function setSizeWithPaddingForDirection(area: Rectangle, direction: Axis, size: ParsedScale, padding: ParsedPadding): number
{
	const
		sizeKey = sizeKeys[direction],
		paddingStart = padding[AxisSide.Start + direction],
		paddingEnd = padding[AxisSide.End + direction],
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
export function applyPaddingToDirection(area: Rectangle, direction: Axis, padding: ParsedPadding, leftoverSpace: number, weightedTotal: number, percentileTotal: number): number
{
	const
		startPixels = convertToPixels(padding[AxisSide.Start + direction], leftoverSpace, weightedTotal, percentileTotal),
		endPixels = convertToPixels(padding[AxisSide.End + direction], leftoverSpace, weightedTotal, percentileTotal);

	area[axisKeys[direction]] += startPixels;
	return (startPixels + area[sizeKeys[direction]] + endPixels);
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
