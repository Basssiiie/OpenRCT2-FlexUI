import { Bindable } from "@src/bindings/bindable";
import { store } from "@src/bindings/stores/createStore";
import { isStore } from "@src/bindings/stores/isStore";
import { ElementVisibility } from "@src/elements/elementParams";
import { Axis } from "@src/positional/axis";
import { isAbsolute, ParsedScale } from "@src/positional/parsing/parsedScale";
import { ScaleType } from "@src/positional/parsing/scaleType";
import { isNull, isUndefined } from "@src/utilities/type";
import { autoKey } from "@src/windows/windowHelpers";
import { SizeParams } from "../../../positional/size";
import { endKeys, startKeys } from "../paddingHelpers";
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

	DynamicWidth = (1 << 2),
	DynamicHeight = (1 << 3),
	DynamicAll = (DynamicWidth | DynamicHeight),

	Count = (1 << 4)
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


export interface InheritableContainer // todo: still used?
{
	_width?: Bindable<number | undefined>;
	_height?: Bindable<number | undefined>;
	_skip?: Bindable<boolean>;
	_flags: ContainerFlags;
}

// todo: still used?
export function setInheritance(container: InheritableContainer, parameters: SizeParams, child: SizeParams & { visibility?: ElementVisibility }): void
{
	const { width, height, visibility } = child;
	const visibilityStore = isStore(visibility);

	if ((visibilityStore || isStore(width)) && isInheritable(parameters.width))
	{
		container._width = parameters.width = store<number | undefined>();
		container._flags |= ContainerFlags.DynamicWidth;
	}
	if ((visibilityStore || isStore(height)) && isInheritable(parameters.height))
	{
		container._height = parameters.height = store<number | undefined>();
		container._flags |= ContainerFlags.DynamicHeight;
	}
}


/**
 * Returns true if the value is inheritable, or false if not.
 */
export function isInheritable(value: unknown): boolean
{
	return (isUndefined(value) || value === autoKey);
}


/* const enum FlexFlags
{
	UseStoreForWidth = (InheritFlags.Count << 0),
	UseStoreForHeight = (InheritFlags.Count << 1),
	UseStoreForBoth = UseStoreForWidth | UseStoreForHeight,

	RecalculateWidth = (InheritFlags.Count << 2),
	RecalculateHeight = (InheritFlags.Count << 3),
	RecalculateBoth = RecalculateWidth | RecalculateHeight
}

export function inheritAxis(binder: Binder<unknown>, bindable: Bindable<unknown> | undefined, control: { _flags: FlexFlags }): void
{
	binder.on(bindable, (value, store) =>
	{
		parsed._width = parseScaleOrFallback(value, defaultScale);
		control._flags |= FlexFlags.RecalculateWidth | (store ? FlexFlags.UseStoreForWidth : 0);
	});
} */


/**
 * Recalculates `position` based on the size of the specified child, if the required inheritance flags are set.
 */
export function recalculateInheritedSpaceFromChild(position: ParsedSize, flags: ContainerFlags, child: Parsed<FlexiblePosition>): boolean
{
	return recalculateInheritedSpace(position, flags, direction => getDesiredSpaceFromChildForDirection(child, direction));
}


/**
 * Recalculates `position` based on the size of the specified children, if the required inheritance flags are set.
 */
/* export function recalculateInheritedSpaceFromChildren(position: ParsedSize, flags: InheritFlags, children: Layoutable[], positions: Parsed<FlexiblePosition>[], spacing: ParsedScale, layoutDirection: Axis): boolean
{
	return recalculateInheritedSpace(position, flags, direction => getDesiredSpaceFromChildrenForDirection(children, positions, spacing, layoutDirection, direction));
} */

export function recalculateInheritedSpaceForAxis(original: ParsedScale, children: ParsedFlexiblePosition[], spacing: ParsedScale, layoutDirection: Axis, axisDirection: Axis): ParsedScale
{
	let value: number | null;
	// todo: maybe inline this method call
	if (!isNull(value = getDesiredSpaceFromChildrenForDirection(children, spacing, layoutDirection, axisDirection))
		&& (original[0] !== value || !isAbsolute(original)))
	{
		return [value, ScaleType.Pixel];
	}
	return original;
}


/**
 * Recalculates `position` based on the size of the specified children, if the required inheritance flags are set.
 */
/* function recalculateInheritedSpace(position: ParsedSize, flags: InheritFlags, getChildrenSpace: (direction: Axis) => number | null): boolean
{
	if ((flags & InheritFlags.All)
		&& (tryInheritSize(position, flags & InheritFlags.Width, Axis.Horizontal, getChildrenSpace)
			| tryInheritSize(position, flags & InheritFlags.Height, Axis.Vertical, getChildrenSpace)))
	{
		return true;
	}
	return false;
} */


/**
 * Try to inherit the size from the child, if the inherit flag is set.
 */
/* function tryInheritSize(position: ParsedSize, inheritFlag: number, direction: Axis, getChildrenSpace: (direction: Axis) => number | null): number // todo: boolean?
{
	let value: number | null;
	if (inheritFlag && !isNull(value = getChildrenSpace(direction)))
	{
		const key = sizeKeys[direction];
		const original = position[key];

		if (original[0] !== value || !isAbsolute(original))
		{
			position[key] = [value, ScaleType.Pixel];
			return 1;
		}
	}
	return 0;
} */


/**
 * Gets the desired space on the parent for a single child if the child asks for
 * absolute positioning, for a single direction.
 */
export function getDesiredSpaceFromChildForDirection(item: ParsedFlexiblePosition, direction: Axis): number | undefined
{
	const
		size = direction == Axis.Horizontal ? item._width : item._height,
		padding = item._padding,
		start = padding[startKeys[direction]],
		end = padding[endKeys[direction]];

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

	const
		startKey = startKeys[axisDirection],
		endKey = endKeys[axisDirection],
		length = children.length;
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
