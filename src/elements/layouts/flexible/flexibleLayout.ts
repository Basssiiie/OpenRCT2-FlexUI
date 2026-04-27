import { Binder } from "@src/bindings/binder";
import { store } from "@src/bindings/stores/createStore";
import { WritableStore } from "@src/bindings/stores/writableStore";
import { defaultScale } from "@src/elements/constants";
import { ElementVisibility } from "@src/elements/elementParams";
import { Axis, AxisSide } from "@src/positional/axis";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { convertToPixels, parseScaleOrFallback } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { SizeParams } from "@src/positional/size";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { Child } from "../container";
import { applyPaddingToDirection, axisKeys, setSizeWithPaddingForDirection, sizeKeys } from "../paddingHelpers";
import { addScaleToStack, ParsedStack } from "../stack";
import { ContainerFlags } from "./desiredSpacing";
import { FlexiblePosition } from "./flexiblePosition";
import { ParsedFlexiblePosition } from "./parsedFlexiblePosition";


export const enum FlexFlags
{
	// Marks whether the axis size needs to be recalculated.
	ComputeHeight = (ContainerFlags.Count << 2),
	ComputeWidth = (ContainerFlags.Count << 3),
	ComputeBoth = ComputeHeight | ComputeWidth
}

export interface FlexibleContainer
{
	_width?: WritableStore<number | undefined>;
	_height?: WritableStore<number | undefined>;
	_flags: FlexFlags;
}


/**
 * Lay out all elements over the specified area and direction, then calls apply for each element.
 */
export function flexibleLayout(stack: ParsedStack, elements: Child<ParsedFlexiblePosition>[], parentArea: Rectangle, layoutDirection: Axis, spacing: ParsedScale, widgets: WidgetMap): void
{
	const elementCount = elements.length;
	const isHorizontal = (layoutDirection == Axis.Horizontal);
	const otherDirection = isHorizontal ? Axis.Vertical : Axis.Horizontal;

	// Calculate available and used space.
	const leftoverSpace = (parentArea[sizeKeys[layoutDirection]] - stack._requestedPixels);
	const weightedTotal = stack._requestedWeightTotal;
	const percentileTotal = stack._requestedPercentile;
	const spaceInPixels = convertToPixels(spacing, leftoverSpace, weightedTotal, percentileTotal);

	// Compute locations and update widgets.
	let cursor = 0;
	let i = 0;
	let element: Child<ParsedFlexiblePosition>;
	for (; i < elementCount; i++)
	{
		element = elements[i];
		if (element._skip)
		{
			continue;
		}

		const mainAxis = (cursor + parentArea[axisKeys[layoutDirection]]);
		const mainSize = convertToPixels(isHorizontal ? element._width : element._height, leftoverSpace, weightedTotal, percentileTotal);
		const padding = element._padding;

		const childArea = element._area; // todo: benchmark whether caching area has benefits
		childArea[axisKeys[layoutDirection]] = mainAxis;
		childArea[sizeKeys[layoutDirection]] = mainSize;
		childArea[axisKeys[otherDirection]] = parentArea[axisKeys[otherDirection]];
		childArea[sizeKeys[otherDirection]] = parentArea[sizeKeys[otherDirection]];

		cursor += applyPaddingToDirection(childArea, layoutDirection, padding, leftoverSpace, weightedTotal, percentileTotal);
		setSizeWithPaddingForDirection(childArea, otherDirection, isHorizontal ? element._height : element._width, padding);

		element._layoutable.layout(widgets, childArea);
		cursor += spaceInPixels;
	}
}

/**
 * Collects details about the widget stack, e.g. how many pixels, percentiles, and weights are requested.
 */
export function parseFlexibleStack(stack: ParsedStack, elements: ParsedFlexiblePosition[], spacing: ParsedScale, mainDirection: Axis): void
{
	stack._requestedPixels = 0;
	stack._requestedPercentile = 0;
	stack._requestedWeightTotal = 0;

	const elementCount = elements.length;
	const isHorizontal = mainDirection == Axis.Horizontal;
	let i = 0;
	let visibleCount = 0;
	let element: ParsedFlexiblePosition;

	// First pass: parse all values to numbers.
	for (; i < elementCount; i++)
	{
		element = elements[i];
		if (element._skip)
		{
			continue;
		}

		const padding = element._padding;

		// Add size of current element to totals
		const size = isHorizontal ? element._width : element._height;
		const start = padding[AxisSide.Start + mainDirection];
		const end = padding[AxisSide.End + mainDirection];

		addScaleToStack(stack, size, 1);
		addScaleToStack(stack, start, 1);
		addScaleToStack(stack, end, 1);
		visibleCount++;
	}

	// Parse spacing in between elements
	addScaleToStack(stack, spacing, (visibleCount - 1));

	stack._visibleElementsCount = visibleCount;
}

/**
 * Performs bindings on a child with flexible positional parameters.
 */
export function bindFlexiblePosition(container: FlexibleContainer, binder: Binder<WidgetBaseDesc>, parameters: SizeParams, child: FlexiblePosition & { visibility?: ElementVisibility }, fallbackPadding?: ParsedPadding): ParsedFlexiblePosition
{
	const { width, height, visibility } = child;
	const parsed: ParsedFlexiblePosition = {
		_width: defaultScale,
		_height: defaultScale,
		_padding: parsePadding(child.padding, fallbackPadding)
	};

	// Attempt binding the child element's position and visibility.
	const widthStore = binder.on(width, value =>
	{
		parsed._width = parseScaleOrFallback(value, defaultScale);
		container._flags |= FlexFlags.ComputeHeight;
	});
	const heightStore = binder.on(height, value =>
	{
		parsed._height = parseScaleOrFallback(value, defaultScale);
		container._flags |= FlexFlags.ComputeWidth;
	});
	const visibilityStore = binder.on(visibility, value =>
	{
		parsed._skip = value === "none";
		container._flags |= FlexFlags.ComputeBoth;
	});

	// Create dynamic stores for container
	if (!container._width && (widthStore || visibilityStore) && (container._flags & ContainerFlags.InheritWidth))
	{
		container._width = parameters.width = store<number | undefined>();
	}
	if (!container._height && (heightStore || visibilityStore) && (container._flags & ContainerFlags.InheritHeight))
	{
		container._height = parameters.height = store<number | undefined>();
	}

	return parsed;
}
