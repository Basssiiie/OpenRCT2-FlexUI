import { Axis, AxisSide } from "@src/positional/axis";
import { isAbsolute, ParsedScale } from "@src/positional/parsing/parsedScale";
import { isUndefined } from "@src/utilities/type";
import { autoKey } from "@src/windows/windowHelpers";
import { SizeParams } from "../../../positional/size";
import { ParsedFlexiblePosition } from "./parsedFlexiblePosition";


/**
 * Flags that indicate whether it is possible to inherit certain positional axis.
 */
export const enum ContainerFlags
{
	None = 0,

	InheritWidth = (1 << 0),
	InheritHeight = (1 << 1),
	InheritAll = (InheritWidth | InheritHeight),

	Count = (1 << 2)
}

/**
 * Get flags that indicate whether it is possible to inherit certain positional axis.
 */
export function getInheritanceFlags(position: SizeParams): ContainerFlags
{
	// todo: maybe rename to computable? frames use inheritance for looking at parents, here its used to look at children
	return (isInheritable(position.width) ? ContainerFlags.InheritWidth : 0)
		| (isInheritable(position.height) ? ContainerFlags.InheritHeight : 0);
}

/**
 * Returns true if the value is inheritable, or false if not.
 */
export function isInheritable(value: unknown): boolean
{
	return (isUndefined(value) || value === autoKey);
}

/**
 * Gets the desired space on the parent for a single child if the child asks for
 * absolute positioning, for a single direction.
 */
export function getDesiredSpaceFromChildForDirection(item: ParsedFlexiblePosition, direction: Axis): number | undefined
{
	const
		size = direction == Axis.Horizontal ? item._width : item._height,
		padding = item._padding,
		start = padding[AxisSide.Start + direction],
		end = padding[AxisSide.End + direction];

	if (isAxisAbsolute(size, start, end))
	{
		return (size[0] + start[0] + end[0]);
	}
	return undefined;
}

/**
 * Gets the total desired space for all children, if they are absolutely positioned.
 */
export function getDesiredSpaceFromChildrenForDirection(children: ParsedFlexiblePosition[], spacing: ParsedScale, layoutDirection: Axis, axisDirection: Axis): number | undefined
{
	const axisIsLayoutDirection = (layoutDirection === axisDirection);

	let absoluteSize = 0;
	if (axisIsLayoutDirection && !isAbsolute(spacing))
	{
		return undefined; // Non-absolute spacing is non-absolute total size.
	}

	const startKey = AxisSide.Start + axisDirection;
	const endKey = AxisSide.End + axisDirection;
	const length = children.length;
	let visibleSpacersCount = -1;
	let index = 0;
	let position: ParsedFlexiblePosition;

	for (; index < length; index++)
	{
		position = children[index];
		if (position._skip)
		{
			continue;
		}

		// Determine if all children are absolutely sized, and if so, then size itself accordingly.
		const size = axisDirection == Axis.Horizontal ? position._width : position._height;
		const padding = position._padding;
		const start = padding[startKey];
		const end = padding[endKey];

		if (!isAxisAbsolute(size, start, end))
		{
			return undefined;
		}
		if (!children[index]._skip)
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
