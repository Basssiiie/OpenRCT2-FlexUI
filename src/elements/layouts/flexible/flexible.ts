import { WritableStore } from "@src/bindings/stores/writableStore";
import { defaultSpacing, redrawEvent } from "@src/elements/constants";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Axis } from "@src/positional/axis";
import { parseScale } from "@src/positional/parsing/parseScale";
import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { Rectangle } from "@src/positional/rectangle";
import { Scale } from "@src/positional/scale";
import * as Log from "@src/utilities/logger";
import { isArray } from "@src/utilities/type";
import { BuildOutput } from "@src/windows/buildOutput";
import { Layoutable } from "@src/windows/layoutable";
import { toWidgetCreator, WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { SizeParams } from "../../../positional/size";
import { AbsolutePosition } from "../absolute/absolutePosition";
import { Child, container } from "../container";
import { ParsedStack } from "../stack";
import { ContainerFlags, getDesiredSpaceFromChildrenForDirection, getInheritanceFlags } from "./desiredSpacing";
import { bindFlexiblePosition, FlexFlags, FlexibleContainer, flexibleLayout, parseFlexibleStack } from "./flexibleLayout";
import { FlexiblePosition } from "./flexiblePosition";
import { ParsedFlexiblePosition } from "./parsedFlexiblePosition";


/**
 * Array of widgets for use in a flexible layout container.
 */
export type FlexibleLayoutContainer = WidgetCreator<FlexiblePosition>[];


/**
 * The parameters for configuring a flexible layout.
 */
export interface FlexibleLayoutParams
{
	/**
	 * Specify the child widgets within this flexible box.
	 */
	content: FlexibleLayoutContainer;

	/**
	 * Specify the amount of space between each child widget.
	 * @default "4px"
	 */
	spacing?: Scale;
}


/**
 * The parameters for configuring a flexible layout with an optionally specified direction.
 */
export interface FlexibleDirectionalLayoutParams extends FlexibleLayoutParams
{
	/**
	 * Specify the direction in which the content should be layed out.
	 * @default LayoutDirection.Vertical
	 */
	direction?: LayoutDirection;
}


/**
 * Add a horizontal row with one or more child widgets.
 */
export function horizontal(params: FlexibleLayoutContainer & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function horizontal(params: FlexibleLayoutContainer & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function horizontal(params: FlexibleLayoutParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function horizontal(params: FlexibleLayoutParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function horizontal<Position extends SizeParams>(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & Position): WidgetCreator<Position>
{
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	(<FlexibleDirectionalLayoutParams>params).direction = <number>Axis.Horizontal;
	return <never>flexible(<never>params);
}


/**
 * Add a vertical row with one or more child widgets.
 */
export function vertical(params: FlexibleLayoutContainer & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function vertical(params: FlexibleLayoutContainer & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function vertical(params: FlexibleLayoutParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function vertical(params: FlexibleLayoutParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function vertical<Position extends SizeParams>(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & Position): WidgetCreator<Position>
{
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	(<FlexibleDirectionalLayoutParams>params).direction = <number>Axis.Vertical;
	return <never>flexible(<never>params);
}


/**
 * Add a flexible row with one or more child widgets in the specified direction.
 */
export function flexible(params: FlexibleDirectionalLayoutParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function flexible(params: FlexibleDirectionalLayoutParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function flexible<Position extends SizeParams>(params: FlexibleDirectionalLayoutParams & Position): WidgetCreator<Position>
{
	return toWidgetCreator(FlexibleLayoutControl, params);
}


export class FlexibleLayoutControl<Position extends SizeParams>	implements FlexibleContainer, Layoutable, ParsedStack
{
	_children: Child<ParsedFlexiblePosition>[];

	_width?: WritableStore<number | undefined>;
	_height?: WritableStore<number | undefined>;
	_direction: Axis;
	_spacing: ParsedScale;
	_flags: number;

	// Stack details
	_requestedPixels!: number;
	_requestedPercentile!: number;
	_requestedWeightTotal!: number;
	_visibleElementsCount!: number;

	constructor(output: BuildOutput, params: (FlexibleDirectionalLayoutParams | FlexibleLayoutContainer) & Position)
	{
		const creators = (isArray(params)) ? params : params.content;
		const binder = output.binder;
		let flags: ContainerFlags;
		let direction: Axis;
		let spacing: ParsedScale;
		let children: Child<ParsedFlexiblePosition>[];

		this._flags = flags = getInheritanceFlags(params) | FlexFlags.ComputeBoth;
		this._direction = direction = (<{ direction?: Axis }>params).direction || Axis.Vertical;
		this._spacing = spacing = (parseScale((<{ spacing?: Scale }>params).spacing) || defaultSpacing);
		this._children = children = container(output, creators, pos => bindFlexiblePosition(this, binder, params, pos));

		const width = this._width;
		const height = this._height;

		if (width || height)
		{
			// If any axis is computable, bind the redraw callback.
			output.on(redrawEvent, this._recalculate.bind(this));
		}

		this._recalculate();

		// Handle static inheritance for children (without any stores)
		if (!width && (flags & ContainerFlags.InheritWidth))
		{
			params.width = getDesiredSpaceFromChildrenForDirection(children, spacing, direction, Axis.Horizontal);
			Log.debug("Flexible: static width is", params.width);
		}
		if (!height && (flags & ContainerFlags.InheritHeight))
		{
			params.height = getDesiredSpaceFromChildrenForDirection(children, spacing, direction, Axis.Vertical);
			Log.debug("Flexible: static height is", params.height);
		}
	}

	layout(widgets: WidgetMap, area: Rectangle): void
	{
		Log.debug("Flexible; layout() for area:", Log.stringify(area));

		if (!this._visibleElementsCount)
		{
			return;
		}

		flexibleLayout(this, this._children, area, this._direction, this._spacing, widgets);
	}

	private _recalculate()
	{
		const flags = this._flags;
		Log.debug("Flexible: recalculate size from children ->", (flags & FlexFlags.ComputeBoth).toString(2));
		if (flags & FlexFlags.ComputeBoth)
		{
			const children = this._children;
			const spacing = this._spacing;
			const direction = this._direction;
			const width = this._width;
			const height = this._height;

			parseFlexibleStack(this, children, spacing, direction);

			if (width && (flags & (FlexFlags.ComputeHeight | ContainerFlags.InheritWidth)) == (FlexFlags.ComputeHeight | ContainerFlags.InheritWidth))
			{
				const newWidth = getDesiredSpaceFromChildrenForDirection(children, spacing, direction, Axis.Horizontal);
				Log.debug("Flexible: recalculated width from", width.get(), "to", newWidth);
				width.set(newWidth);
			}
			if (height && (flags & (FlexFlags.ComputeWidth | ContainerFlags.InheritHeight)) == (FlexFlags.ComputeWidth | ContainerFlags.InheritHeight))
			{
				const newHeight = getDesiredSpaceFromChildrenForDirection(children, spacing, direction, Axis.Vertical);
				Log.debug("Flexible: recalculated height from", height.get(), "to", newHeight);
				height.set(newHeight);
			}

			// Clear recalculate flag
			this._flags &= ~FlexFlags.ComputeBoth;
		}
	}
}
