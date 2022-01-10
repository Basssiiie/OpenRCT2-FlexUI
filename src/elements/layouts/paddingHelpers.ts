import { Direction } from "@src/positional/direction";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { isAbsolute, isWeighted, ParsedScale } from "@src/positional/parsing/parsedScale";
import { convertToPixels } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";


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
	applyHorizontalPadding(area, contentWidth, padding);
	applyVerticalPadding(area, contentHeight, padding);
}


/**
 * Applies padding to a specific area as a whole on the specified direction.
 */
export function applyPaddingToDirection(area: Rectangle, direction: Direction, contentSpace: ParsedScale, padding: ParsedPadding): void
{
	if (direction === Direction.Horizontal)
	{
		applyHorizontalPadding(area, contentSpace, padding);
	}
	else
	{
		applyVerticalPadding(area, contentSpace, padding);
	}
}


/**
 * Applies padding to a specific area as a whole on the horizontal axis.
 */
export function applyHorizontalPadding(area: Rectangle, contentSpace: ParsedScale, padding: ParsedPadding): void
{
	applyPaddingToAxis(area, contentSpace, padding, "x", "width", "left", "right");
}


/**
 * Applies padding to a specific area as a whole on the vertical axis.
 */
export function applyVerticalPadding(area: Rectangle, parentSpace: ParsedScale, padding: ParsedPadding): void
{
	applyPaddingToAxis(area, parentSpace, padding, "y", "height", "top", "bottom");
}


/**
 * Applies padding to the specified axis.
 */
export function applyPaddingToAxis(area: Rectangle, contentSpace: ParsedScale, padding: ParsedPadding,
	axis: "x" | "y", size: "width" | "height", start: "left" | "top", end: "right" | "bottom"): void
{
	const
		absoluteContentSpace = isAbsolute(contentSpace),
		// If content space is absolute, leftover space is the rest.
		// Otherwise apply inward padding over all the space.
		leftoverSpace = (absoluteContentSpace) ? (area[size] - contentSpace[0]) : area[size],
		totalWeight = calculateTotalWeight(contentSpace, padding[start], padding[end]),
		startPixels = convertToPixels(padding[start], leftoverSpace, totalWeight),
		endPixels = convertToPixels(padding[end], leftoverSpace, totalWeight);

	area[axis] += startPixels;

	// If parent space is absolute, subtract from original pixel space.
	if (absoluteContentSpace)
	{
		area[size] = contentSpace[0];
	}
	else
	{
		area[size] -= (startPixels + endPixels);
	}
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