import { Direction } from "@src/positional/direction";
import { Parsed } from "@src/positional/parsing/parsed";
import { isAbsolute, ParsedScale } from "@src/positional/parsing/parsedScale";
import { isUndefined } from "@src/utilities/type";
import { Positions } from "../positions";
import { FlexiblePosition } from "./flexiblePosition";


/**
 * Sets the desired space on the parent for a single child if the child asks for
 * absolute positioning.
 */
export function setDesiredSpaceForChild(target: Positions, item: Parsed<FlexiblePosition>): void
{
	const width = item.width, height = item.height, padding = item.padding;

	if (isUndefined(target.width) && isAxisAbsolute(width, padding.left, padding.right))
	{
		target.width = (width[0] + padding.left[0] + padding.right[0]);
	}
	if (isUndefined(target.height) && isAxisAbsolute(height, padding.top, padding.bottom))
	{
		target.height = (height[0] + padding.top[0] + padding.bottom[0]);
	}
}


/**
 * Sets the desired space on the parent if all children ask for absolute positioning.
 */
export function setDesiredSpaceForChildren(target: Positions, items: Parsed<FlexiblePosition>[], spacing: ParsedScale, direction: Direction): void
{
	const hasAbsoluteSpacing = isAbsolute(spacing);
	let widthCanBeAbsolute: boolean = isUndefined(target.width),
		heightCanBeAbsolute: boolean = isUndefined(target.height);

	// Skip if spacing is not absolute, or both width and height are already set.
	if (!hasAbsoluteSpacing || (!widthCanBeAbsolute && !widthCanBeAbsolute))
		return;

	const count = items.length, isHorizontal = (direction === Direction.Horizontal);
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

	for (let i = 0; i < items.length; i++)
	{
		// Determine if all children are absolutely sized,
		// if so, then size itself accordingly.
		const pos = items[i], width = pos.width, height = pos.height, padding = pos.padding;

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