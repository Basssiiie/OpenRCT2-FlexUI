import { WritableStore } from "@src/bindings/stores/writableStore";
import { redrawEvent } from "@src/elements/constants";
import { Axis } from "@src/positional/axis";
import { Rectangle } from "@src/positional/rectangle";
import { SizeParams } from "@src/positional/size";
import { noneKey, visibleKey } from "@src/positional/visibility";
import * as Log from "@src/utilities/logger";
import { isArray, isUndefined } from "@src/utilities/type";
import { BuildOutput } from "@src/windows/buildOutput";
import { Layoutable } from "@src/windows/layoutable";
import { toWidgetCreator, WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { AbsolutePosition } from "../absolute/absolutePosition";
import { Child, container } from "../container";
import { ContainerFlags, getComputableFlags, getDesiredSpaceFromChildForDirection } from "../flexible/desiredSpacing";
import { bindFlexiblePosition, FlexFlags, FlexibleContainer } from "../flexible/flexibleLayout";
import { FlexiblePosition } from "../flexible/flexiblePosition";
import { ParsedFlexiblePosition } from "../flexible/parsedFlexiblePosition";
import { setSizeWithPadding } from "../paddingHelpers";


/**
 * Array of widgets that are layered on top of each other in an overlay.
 */
export type OverlayLayoutContainer = WidgetCreator<FlexiblePosition>[];


/**
 * The parameters for configuring an overlay layout.
 */
export interface OverlayLayoutParams
{
	/**
	 * Specify the child widgets within this overlay. Each child is placed over the
	 * same area, with later children drawn on top of earlier ones.
	 */
	content: OverlayLayoutContainer;
}


/**
 * Add an area where all child widgets are layered on top of each other. Each child
 * is sized and padded relative to the whole area.
 */
export function overlay(params: OverlayLayoutContainer & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function overlay(params: OverlayLayoutContainer & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function overlay(params: OverlayLayoutParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function overlay(params: OverlayLayoutParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function overlay<Position extends SizeParams>(params: (OverlayLayoutParams | OverlayLayoutContainer) & Position): WidgetCreator<Position>
{
	return toWidgetCreator(OverlayLayoutControl, params);
}


export class OverlayLayoutControl<Position extends SizeParams> implements FlexibleContainer, Layoutable
{
	_children: Child<ParsedFlexiblePosition>[];

	_width?: WritableStore<number | undefined>;
	_height?: WritableStore<number | undefined>;
	_flags: number;

	constructor(output: BuildOutput, params: (OverlayLayoutParams | OverlayLayoutContainer) & Position)
	{
		const creators = (isArray(params)) ? params : params.content;
		const context = output.context;
		const binder = output.binder;
		let flags: ContainerFlags;
		let children: Child<ParsedFlexiblePosition>[];

		this._flags = flags = getComputableFlags(params) | FlexFlags.ComputeBoth;
		this._children = children = container(output, creators, pos => bindFlexiblePosition(this, context, binder, params, pos));

		const width = this._width;
		const height = this._height;

		if (width || height)
		{
			// If any axis is computable, bind the redraw callback.
			output.on(redrawEvent, this._redraw.bind(this));
			this._redraw();
		}

		// Handle static inheritance for children (without any stores)
		if (!width && (flags & ContainerFlags.ComputableWidth))
		{
			params.width = getDesiredSpaceFromChildren(children, Axis.Horizontal);
			Log.debug("Overlay: static width is", params.width);
		}
		if (!height && (flags & ContainerFlags.ComputableHeight))
		{
			params.height = getDesiredSpaceFromChildren(children, Axis.Vertical);
			Log.debug("Overlay: static height is", params.height);
		}
	}

	layout(widgets: WidgetMap, area: Rectangle | false): void
	{
		Log.debug("Overlay; layout() for area:", Log.stringify(area));
		for (let children = this._children, idx = 0, length = children.length; idx < length; idx++)
		{
			const child = children[idx];
			const visibility = child._visibility;
			if (!area || (visibility && visibility !== visibleKey))
			{
				// Hidden: the whole subtree still needs to be hidden.
				child._layoutable.layout(widgets, false);
				continue;
			}

			const childArea = child._area;
			childArea.x = area.x;
			childArea.y = area.y;
			childArea.width = area.width;
			childArea.height = area.height;

			setSizeWithPadding(childArea, child._width, child._height, child._padding);
			child._layoutable.layout(widgets, childArea);
		}
	}

	private _redraw(): void
	{
		const flags = this._flags;
		Log.debug("Overlay: recalculate size from children ->", (flags & FlexFlags.ComputeBoth).toString(2));
		if (flags & FlexFlags.ComputeBoth)
		{
			const children = this._children;
			const width = this._width;
			const height = this._height;

			if (width && (flags & (FlexFlags.ComputeHeight | ContainerFlags.ComputableWidth)) == (FlexFlags.ComputeHeight | ContainerFlags.ComputableWidth))
			{
				const newWidth = getDesiredSpaceFromChildren(children, Axis.Horizontal);
				Log.debug("Overlay: recalculated width from", width.get(), "to", newWidth);
				width.set(newWidth);
			}
			if (height && (flags & (FlexFlags.ComputeWidth | ContainerFlags.ComputableHeight)) == (FlexFlags.ComputeWidth | ContainerFlags.ComputableHeight))
			{
				const newHeight = getDesiredSpaceFromChildren(children, Axis.Vertical);
				Log.debug("Overlay: recalculated height from", height.get(), "to", newHeight);
				height.set(newHeight);
			}

			// Clear recalculate flag
			this._flags &= ~FlexFlags.ComputeBoth;
		}
	}
}


/**
 * Gets the desired space for the overlay on the specified axis, which is the biggest
 * of all visible children if they are all absolutely sized.
 */
function getDesiredSpaceFromChildren(children: ParsedFlexiblePosition[], direction: Axis): number | undefined
{
	const length = children.length;
	let child: ParsedFlexiblePosition;
	let biggest = 0;
	let idx = 0;

	for (; idx < length; idx++)
	{
		child = children[idx];
		if (child._visibility === noneKey)
		{
			continue;
		}

		const size = getDesiredSpaceFromChildForDirection(child, direction);
		if (isUndefined(size))
		{
			return undefined;
		}
		if (biggest < size)
		{
			biggest = size;
		}
	}
	return biggest;
}
