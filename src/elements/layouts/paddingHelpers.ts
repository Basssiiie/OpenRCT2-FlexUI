import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { isAbsolute, isWeighted, ParsedScale } from "@src/positional/parsing/parsedScale";
import { convertToPixels } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";


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
 * Applies padding to a specific area as a whole.
 */
export function setSizeWithPadding(area: Rectangle, width: ParsedScale, height: ParsedScale, padding: ParsedPadding): void
{
	setSizeWithPaddingToDirection(area, LayoutDirection.Horizontal, width, padding);
	setSizeWithPaddingToDirection(area, LayoutDirection.Vertical, height, padding);
}


/**
 * Sets the size and padding to a specific area as a whole on the specified direction. Area is
 * interpreted as the available space and updated accordingly. Returns total space used.
 */
export function setSizeWithPaddingToDirection(area: Rectangle, direction: LayoutDirection, size: ParsedScale, padding: ParsedPadding): number
{
	const
		sizeKey = sizeKeys[direction],
		paddingStart = padding[startKeys[direction]],
		paddingEnd = padding[endKeys[direction]],
		leftoverSpace = calculateLeftoverSpace(area[sizeKey], size, paddingStart, paddingEnd),
		weightedTotal = calculateTotalWeight(size, paddingStart, paddingEnd),
		sizePixels = convertToPixels(size, leftoverSpace, weightedTotal);

	area[sizeKey] = sizePixels;

	return applyPaddingToDirection(area, direction, padding, leftoverSpace, weightedTotal);
}


/**
 * Applies padding to a specific area as a whole on the specified direction. Returns total space used.
 */
export function applyPaddingToDirection(area: Rectangle, direction: LayoutDirection, padding: ParsedPadding, leftoverSpace: number, weightedTotal: number): number
{
	return applyPaddingToAxis(area, padding, leftoverSpace, weightedTotal, axisKeys[direction], sizeKeys[direction], startKeys[direction], endKeys[direction]);
}


/**
 * Applies padding to the specified axis. Returns total space used.
 */
export function applyPaddingToAxis(area: Rectangle, padding: ParsedPadding, leftoverSpace: number, weightedTotal: number,
	axisKey: typeof axisKeys[number], sizeKey: typeof sizeKeys[number],
	startKey: typeof startKeys[number], endKey: typeof endKeys[number]): number
{
	const
		startPixels = convertToPixels(padding[startKey], leftoverSpace, weightedTotal),
		endPixels = convertToPixels(padding[endKey], leftoverSpace, weightedTotal);

	area[axisKey] += startPixels;
	return (startPixels + area[sizeKey] + endPixels);
}


/**
 * Leftover space is the current space minus the absolute space for the content,
 * and minus any absolute padding that should be added at the end.
 */
export function calculateLeftoverSpace(availableSpace: number, size: ParsedScale, paddingStart: ParsedScale, paddingEnd: ParsedScale): number
{
	let leftoverSpace = availableSpace;

	if (isAbsolute(size))
		leftoverSpace -= size[0];
	if (isAbsolute(paddingStart))
		leftoverSpace -= paddingStart[0];
	if (isAbsolute(paddingEnd))
		leftoverSpace -= paddingEnd[0];

	return leftoverSpace;
}


/**
 * Inner total weight is the sum of the base weight and both sides of padding.
 */
export function calculateTotalWeight(size: ParsedScale, paddingStart: ParsedScale, paddingEnd: ParsedScale): number
{
	let totalWeight = 0;

	if (isWeighted(size))
		totalWeight += size[0];
	if (isWeighted(paddingStart))
		totalWeight += paddingStart[0];
	if (isWeighted(paddingEnd))
		totalWeight += paddingEnd[0];

	return totalWeight;
}