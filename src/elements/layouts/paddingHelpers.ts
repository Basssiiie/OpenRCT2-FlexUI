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
export function applyPadding(area: Rectangle, contentWidth: ParsedScale, contentHeight: ParsedScale, padding: ParsedPadding): void
{
	applyPaddingToDirection(area, LayoutDirection.Horizontal, contentWidth, padding);
	applyPaddingToDirection(area, LayoutDirection.Vertical, contentHeight, padding);
}


/**
 * Applies padding to a specific area as a whole on the specified direction. Returns total space used.
 */
export function applyPaddingToDirection(area: Rectangle, direction: LayoutDirection, contentSpace: ParsedScale, padding: ParsedPadding): number
{
	return applyPaddingToAxis(area, contentSpace, padding, axisKeys[direction], sizeKeys[direction], startKeys[direction], endKeys[direction]);
}


/**
 * Applies padding to the specified axis. Returns total space used.
 */
export function applyPaddingToAxis(area: Rectangle, contentSpace: ParsedScale, padding: ParsedPadding,
	axis: typeof axisKeys[number], size: typeof sizeKeys[number],
	start: typeof startKeys[number], end: typeof endKeys[number]): number
{
	const
		absoluteContentSpace = isAbsolute(contentSpace),
		// If content space is absolute, leftover space is the rest.
		// Otherwise apply inward padding over all the space.
		leftoverSpace = calculateLeftoverSpace(area[size], contentSpace[0], absoluteContentSpace, padding[start], padding[end]),
		totalWeight = calculateTotalWeight(contentSpace, padding[start], padding[end]),
		startPixels = convertToPixels(padding[start], leftoverSpace, totalWeight),
		endPixels = convertToPixels(padding[end], leftoverSpace, totalWeight);

	// fixme; incorrect place with both static and dynamic padding together
	area[axis] += startPixels;

	let totalSpace: number;
	// If parent space is absolute, subtract from original pixel space.
	if (absoluteContentSpace)
	{
		totalSpace = (contentSpace[0] + startPixels + endPixels);
		area[size] = contentSpace[0];
	}
	else
	{
		totalSpace = area[size];
		area[size] -= (startPixels + endPixels);
	}
	return totalSpace;
}


/**
 * Leftover space is the current space minus the absolute space for the content,
 * and minus any absolute padding that should be added at the end.
 */
function calculateLeftoverSpace(currentSpace: number, contentSpace: number, isContentSpaceAbsolute: boolean, paddingStart: ParsedScale, paddingEnd: ParsedScale): number
{
	let leftoverSpace = currentSpace;

	if (isContentSpaceAbsolute)
		leftoverSpace -= contentSpace;
	if (isAbsolute(paddingStart))
		leftoverSpace -= paddingStart[0];
	if (isAbsolute(paddingEnd))
		leftoverSpace -= paddingEnd[0];

	return leftoverSpace;
}


/**
 * Inner total weight is the sum of the base weight and both sides of padding.
 */
function calculateTotalWeight(base: ParsedScale, start: ParsedScale, end: ParsedScale): number
{
	let totalWeight = 0;

	if (isWeighted(base))
		totalWeight += base[0];
	if (isWeighted(start))
		totalWeight += start[0];
	if (isWeighted(end))
		totalWeight += end[0];

	return totalWeight;
}