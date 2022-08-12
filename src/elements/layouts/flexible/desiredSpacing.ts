import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Parsed } from "@src/positional/parsing/parsed";
import { isAbsolute, ParsedScale } from "@src/positional/parsing/parsedScale";
import { ScaleType } from "@src/positional/parsing/scaleType";
import { isNull, isUndefined } from "@src/utilities/type";
import { endKeys, sizeKeys, startKeys } from "../paddingHelpers";
import { Positions } from "../positions";
import { FlexiblePosition } from "./flexiblePosition";


/**
 * Flags that indicate whether it is possible to inherit certain positional axis.
 */
export const enum InheritFlags
{
	Width = (1 << 0),
	Height = (1 << 1),

	All = (Width | Height),
	Count = (1 << 2)
}


/**
 * Get flags that indicate whether it is possible to inherit certain positional axis.
 */
export function getInheritanceFlags(position: Positions): InheritFlags
{
	return (isUndefined(position.width) ? InheritFlags.Width : 0)
		| (isUndefined(position.height) ? InheritFlags.Height : 0);
}


/**
 * Recalculates `position` based on the size of the specified child, if the required inheritance flags are set.
 */
export function recalculateInheritedSpaceFromChild(position: Parsed<Positions>, flags: InheritFlags, child: Parsed<FlexiblePosition>): boolean
{
	return recalculateInheritedSpace(position, flags, (direction) => getDesiredSpaceFromChildForDirection(child, direction));
}


/**
 * Recalculates `position` based on the size of the specified children, if the required inheritance flags are set.
 */
export function recalculateInheritedSpaceFromChildren(position: Parsed<Positions>, flags: InheritFlags, children: Parsed<FlexiblePosition>[], spacing: ParsedScale, layoutDirection: LayoutDirection): boolean
{
	return recalculateInheritedSpace(position, flags, (direction) => getDesiredSpaceFromChildrenForDirection(children, spacing, layoutDirection, direction));
}


/**
 * Recalculates `position` based on the size of the specified children, if the required inheritance flags are set.
 */
function recalculateInheritedSpace(position: Parsed<Positions>, flags: InheritFlags, getChildrenSpace: (direction: LayoutDirection) => number | null): boolean
{
	if ((flags & InheritFlags.All)
		&& (tryInheritSize(position, flags & InheritFlags.Width, LayoutDirection.Horizontal, getChildrenSpace)
			| tryInheritSize(position, flags & InheritFlags.Height, LayoutDirection.Vertical, getChildrenSpace)))
	{
		return true;
	}
	return false;
}


/**
 * Try to inherit the size from the child, if the inherit flag is set.
 */
function tryInheritSize(position: Parsed<Positions>, inheritFlag: number, direction: LayoutDirection, getChildrenSpace: (direction: LayoutDirection) => number | null): number
{
	let value: number | null;
	if (inheritFlag && !isNull(value = getChildrenSpace(direction)))
	{
		const key = sizeKeys[direction], original = position[key];
		if (original[0] !== value || original[1] !== ScaleType.Pixel)
		{
			position[key] = [value, ScaleType.Pixel];
			return 1;
		}
	}
	return 0;
}


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