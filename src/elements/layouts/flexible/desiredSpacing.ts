import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Parsed } from "@src/positional/parsing/parsed";
import { isAbsolute, ParsedScale } from "@src/positional/parsing/parsedScale";
import { isUndefined } from "@src/utilities/type";
import { endKeys, sizeKeys, startKeys } from "../paddingHelpers";
import { Positions } from "../positions";
import { FlexiblePosition } from "./flexiblePosition";


/**
 * Gets the desired space on the parent for a single child if the child asks for
 * absolute positioning, for a single direction.
 */
export function getDesiredSpaceFromChildForDirection(item: Parsed<FlexiblePosition>, direction: LayoutDirection): number | null
{
	const
		sizeKey = sizeKeys[direction],
		size = item[sizeKey],
		padding = item.padding,
		start = padding[startKeys[direction]],
		end = padding[endKeys[direction]];

	if (isAxisAbsolute(size, start, end))
	{
		return (size[0] + start[0] + end[0]);
	}
	return null;
}


/**
 * Sets the desired space on the parent if all children ask for absolute positioning.
 */
export function setDesiredSpaceFromChildren(target: Positions, items: Parsed<FlexiblePosition>[], spacing: ParsedScale, layoutDirection: LayoutDirection): void
{
	const hasAbsoluteSpacing = isAbsolute(spacing);
	let widthCanBeAbsolute: boolean = isUndefined(target.width),
		heightCanBeAbsolute: boolean = isUndefined(target.height);

	// Skip if spacing is not absolute, or both width and height are already set.
	if (!hasAbsoluteSpacing || (!widthCanBeAbsolute && !heightCanBeAbsolute))
		return;

	const count = items.length, isHorizontal = (layoutDirection === LayoutDirection.Horizontal);
	let absoluteWidth: number = 0, absoluteHeight: number = 0;

	const totalSpacing = (spacing[0] * (count - 1));
	if (isHorizontal)
	{
		absoluteWidth += totalSpacing;
	}
	else
	{
		absoluteHeight += totalSpacing;
	}

	for (let i = 0; i < items.length && (widthCanBeAbsolute || heightCanBeAbsolute); i++)
	{
		// Determine if all children are absolutely sized,
		// if so, then size itself accordingly.
		const pos = items[i], { width, height, padding } = pos;

		if (widthCanBeAbsolute && isAxisAbsolute(width, padding.left, padding.right))
		{
			absoluteWidth = addOrMax(absoluteWidth, width[0] + padding.left[0] + padding.right[0], isHorizontal);
		}
		else
		{
			widthCanBeAbsolute = false;
		}

		if (heightCanBeAbsolute && isAxisAbsolute(height, padding.top, padding.bottom))
		{
			absoluteHeight = addOrMax(absoluteHeight, height[0] + padding.top[0] + padding.bottom[0], !isHorizontal);
		}
		else
		{
			heightCanBeAbsolute = false;
		}
	}

	if (widthCanBeAbsolute)
	{
		target.width = absoluteWidth;
	}
	if (heightCanBeAbsolute)
	{
		target.height = absoluteHeight;
	}
}


/**
 * Gets the total desired space for all children, if they are absolutely positioned.
 */
export function getDesiredSpaceFromChildrenForDirection(items: Parsed<FlexiblePosition>[], spacing: ParsedScale, layoutDirection: LayoutDirection, axisDirection: LayoutDirection): number | null
{
	const axisIsLayoutDirection = (layoutDirection === axisDirection);

	let absoluteSize = 0;
	if (axisIsLayoutDirection)
	{
		if (!isAbsolute(spacing))
		{
			return null;
		}
		absoluteSize += (spacing[0] * (items.length - 1));
	}

	const
		sizeKey = sizeKeys[axisDirection],
		startKey = startKeys[axisDirection],
		endKey = endKeys[axisDirection];

	for (const item of items)
	{
		// Determine if all children are absolutely sized,
		// if so, then size itself accordingly.
		const
			size = item[sizeKey],
			padding = item.padding,
			start = padding[startKey],
			end = padding[endKey];

		if (isAxisAbsolute(size, start, end))
		{
			absoluteSize = addOrMax(absoluteSize, size[0] + start[0] + end[0], axisIsLayoutDirection);
		}
		else return null;
	}
	return absoluteSize;
}


/**
 * Returns true if both the scale and either side of the padding is absolutely scaled.
 */
function isAxisAbsolute(scale: ParsedScale, startPad: ParsedScale, endPad: ParsedScale): boolean
{
	return isAbsolute(scale)
		&& isAbsolute(startPad)
		&& isAbsolute(endPad);
}


/**
 * Either adds the new value, or returns the highest of the two.
 */
function addOrMax(oldValue: number, newValue: number, add: boolean): number
{
	if (add)
	{
		return (oldValue + newValue);
	}
	return (oldValue < newValue) ? newValue : oldValue;
}