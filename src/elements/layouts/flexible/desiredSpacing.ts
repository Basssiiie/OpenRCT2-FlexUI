import { Axis } from "@src/positional/axis";
import { Parsed } from "@src/positional/parsing/parsed";
import { isAbsolute, ParsedScale } from "@src/positional/parsing/parsedScale";
import { ScaleType } from "@src/positional/parsing/scaleType";
import { isNull, isUndefined } from "@src/utilities/type";
import { Layoutable } from "@src/windows/layoutable";
import { autoKey } from "@src/windows/windowHelpers";
import { ParsedSize, SizeParams } from "../../../positional/size";
import { endKeys, sizeKeys, startKeys } from "../paddingHelpers";
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
export function getInheritanceFlags(position: SizeParams): InheritFlags
{
	return (isInheritable(position.width) ? InheritFlags.Width : 0)
		| (isInheritable(position.height) ? InheritFlags.Height : 0);
}


/**
 * Returns true if the value is inheritable, or false if not.
 */
function isInheritable(value: unknown): boolean
{
	return (isUndefined(value) || value === autoKey);
}


/**
 * Recalculates `position` based on the size of the specified child, if the required inheritance flags are set.
 */
export function recalculateInheritedSpaceFromChild(position: ParsedSize, flags: InheritFlags, child: Parsed<FlexiblePosition>): boolean
{
	return recalculateInheritedSpace(position, flags, (direction) => getDesiredSpaceFromChildForDirection(child, direction));
}


/**
 * Recalculates `position` based on the size of the specified children, if the required inheritance flags are set.
 */
export function recalculateInheritedSpaceFromChildren(position: ParsedSize, flags: InheritFlags, children: Layoutable<Parsed<FlexiblePosition>>[], spacing: ParsedScale, layoutDirection: Axis): boolean
{
	return recalculateInheritedSpace(position, flags, (direction) => getDesiredSpaceFromChildrenForDirection(children, spacing, layoutDirection, direction));
}


/**
 * Recalculates `position` based on the size of the specified children, if the required inheritance flags are set.
 */
function recalculateInheritedSpace(position: ParsedSize, flags: InheritFlags, getChildrenSpace: (direction: Axis) => number | null): boolean
{
	if ((flags & InheritFlags.All)
		&& (tryInheritSize(position, flags & InheritFlags.Width, Axis.Horizontal, getChildrenSpace)
			| tryInheritSize(position, flags & InheritFlags.Height, Axis.Vertical, getChildrenSpace)))
	{
		return true;
	}
	return false;
}


/**
 * Try to inherit the size from the child, if the inherit flag is set.
 */
function tryInheritSize(position: ParsedSize, inheritFlag: number, direction: Axis, getChildrenSpace: (direction: Axis) => number | null): number
{
	let value: number | null;
	if (inheritFlag && !isNull(value = getChildrenSpace(direction)))
	{
		const key = sizeKeys[direction], original = position[key];
		if (original[0] !== value || !isAbsolute(original))
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
function getDesiredSpaceFromChildForDirection(item: Parsed<FlexiblePosition>, direction: Axis): number | null
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
function getDesiredSpaceFromChildrenForDirection(items: Layoutable<Parsed<FlexiblePosition>>[], spacing: ParsedScale, layoutDirection: Axis, axisDirection: Axis): number | null
{
	const axisIsLayoutDirection = (layoutDirection === axisDirection);

	let absoluteSize = 0;
	if (axisIsLayoutDirection && !isAbsolute(spacing))
	{
		return null; // Non-absolute spacing is non-absolute total size.
	}

	const
		sizeKey = sizeKeys[axisDirection],
		startKey = startKeys[axisDirection],
		endKey = endKeys[axisDirection];
	let visibleSpacersCount = -1;

	for (const item of items)
	{
		// Determine if all children are absolutely sized, and if so,
		// then size itself accordingly.
		const
			position = item.position,
			size = position[sizeKey],
			padding = position.padding,
			start = padding[startKey],
			end = padding[endKey];

		if (!isAxisAbsolute(size, start, end))
		{
			return null;
		}
		if (!item.skip)
		{
			absoluteSize = addOrMax(absoluteSize, size[0] + start[0] + end[0], axisIsLayoutDirection);
			visibleSpacersCount++;
		}
	}
	if (axisIsLayoutDirection)
	{
		absoluteSize += (spacing[0] * visibleSpacersCount);
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
