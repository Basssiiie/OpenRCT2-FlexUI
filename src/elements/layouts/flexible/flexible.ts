import { Binder } from "@src/bindings/binder";
import { store } from "@src/bindings/stores/createStore";
import { WritableStore } from "@src/bindings/stores/writableStore";
import { defaultScale, defaultSpacing, redrawEvent } from "@src/elements/constants";
import { ElementVisibility } from "@src/elements/elementParams";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Axis } from "@src/positional/axis";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { parseScale, parseScaleOrFallback } from "@src/positional/parsing/parseScale";
import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { Rectangle } from "@src/positional/rectangle";
import { Scale } from "@src/positional/scale";
import * as Log from "@src/utilities/logger";
import { isArray, isNull, isUndefined } from "@src/utilities/type";
import { BuildOutput } from "@src/windows/buildOutput";
import { Layoutable } from "@src/windows/layoutable";
import { toWidgetCreator, WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { SizeParams } from "../../../positional/size";
import { AbsolutePosition } from "../absolute/absolutePosition";
import { Container } from "../container";
import { ParsedStack } from "../stack";
import { getDesiredSpaceFromChildrenForDirection, getInheritanceFlags, InheritFlags } from "./desiredSpacing";
import { flexibleLayout, parseFlexibleStack } from "./flexibleLayout";
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
	/* const { width, height } = params;
	const autoWidth = isInheritable(width);
	const autoHeight = isInheritable(height);

	if (autoWidth || autoHeight)
	{
		const items = isArray(params) ? params : params.content;
		const length = items.length;
		let item: FlexiblePosition;
		let flags = InheritFlags.None;
		let idx = 0;

		for (; idx < length && flags != InheritFlags.All; idx++)
		{
			item = items[idx].position;
			if (!isStore(item.width) && isAbsolute())
		}

	}

	// TODO: Some store support for bubbling its size up???
	if (isUndefined(width))
	{
		params.width = store(0);
	}
	if (isUndefined(height))
	{
		params.height = store(0);
	} */
	// should probably add some kind of size bubbling to the widget creator??
	return toWidgetCreator(FlexibleLayoutControl, params);
}


const enum FlexFlags
{
	UseStoreForWidth = (InheritFlags.Count << 0),
	UseStoreForHeight = (InheritFlags.Count << 1),
	UseStoreForBoth = UseStoreForWidth | UseStoreForHeight,

	RecalculateWidth = (InheritFlags.Count << 2),
	RecalculateHeight = (InheritFlags.Count << 3),
	RecalculateBoth = RecalculateWidth | RecalculateHeight
}


export class FlexibleLayoutControl<Position extends SizeParams>
	extends Container<FlexiblePosition, ParsedFlexiblePosition>
	implements Layoutable, ParsedStack
{
	/* _parent: ParentControl;
	_renderableChildren!: Layoutable[];
	_renderableChildrenPositions!: ParsedFlexiblePosition[]; */

	_width?: WritableStore<Scale | undefined>;
	_height?: WritableStore<Scale | undefined>;
	_direction: Axis;
	_spacing: ParsedScale;
	_flags!: number; // is assigned in _bindFlexiblePosition();

	// Stack details
	_requestedPixels!: number;
	_requestedPercentile!: number;
	_requestedWeightTotal!: number;
	_visibleElementsCount!: number;

	constructor(output: BuildOutput, params: (FlexibleDirectionalLayoutParams | FlexibleLayoutContainer) & Position)
	{
		const creators = (isArray(params)) ? params : params.content;
		const binder = output.binder;
		super(output, creators, pos => this._bindFlexiblePosition(binder, pos));

		const { width, height } = params;
		const flags = this._flags |= (FlexFlags.RecalculateBoth | getInheritanceFlags(params));
		if (isUndefined(width) && flags & FlexFlags.UseStoreForWidth)
		{
			this._width = params.width = store<number>();
		}
		if (isUndefined(height) && flags & FlexFlags.UseStoreForHeight)
		{
			this._height = params.height = store<number>();
		}

		this._direction = (<{ direction?: Axis }>params).direction || Axis.Vertical;
		this._spacing = (parseScale((<{ spacing?: Scale }>params).spacing) || defaultSpacing);

		output.on(redrawEvent, this._recalculate.bind(this));
	}

	/* override recalculate(): void
	{
		this._flags |= FlexFlags.RecalculateFromChildren;
		if (this._flags & InheritFlags.All)
		{
			this._parent.recalculate();
		}
	} */

	layout(widgets: WidgetMap, area: Rectangle): void
	{
		Log.debug("Flexible; layout() for area:", Log.stringify(area));

		if (!this._visibleElementsCount)
		{
			return;
		}

		flexibleLayout(this, this._positions, area, this._direction, this._spacing, (idx, subarea) =>
		{
			this._children[idx].layout(widgets, subarea);
		});
	}

	private _recalculate()
	{
		const flags = this._flags;
		Log.debug("Flexible: recalculate size from children ->", (flags & FlexFlags.RecalculateBoth).toString(2));
		if (flags & FlexFlags.RecalculateBoth)
		{
			const positions = this._positions;
			const spacing = this._spacing;
			const direction = this._direction;

			this._requestedPixels = 0;
			this._requestedPercentile = 0;
			this._requestedWeightTotal = 0;
			this._visibleElementsCount = parseFlexibleStack(this, positions, spacing, direction); // todo: make part of ParsedStack?

			if ((flags & (FlexFlags.RecalculateWidth | InheritFlags.Width)) == (FlexFlags.RecalculateWidth | InheritFlags.Width))
			{
				// this._width = recalculateInheritedSpaceForAxis(this._width, positions, spacing, direction, Axis.Horizontal);
				const width = getDesiredSpaceFromChildrenForDirection(positions, spacing, direction, Axis.Horizontal);
				Log.debug("Flexible: recalculated width from", this._width!.get(), "to", width);
				this._width!.set(isNull(width) ? undefined : width);
			}
			if ((flags & (FlexFlags.RecalculateHeight | InheritFlags.Height)) == (FlexFlags.RecalculateHeight | InheritFlags.Height))
			{
				// this._height = recalculateInheritedSpaceForAxis(this._height, positions, spacing, direction, Axis.Vertical);
				const height = getDesiredSpaceFromChildrenForDirection(positions, spacing, direction, Axis.Vertical);
				Log.debug("Flexible: recalculated height from", this._height!.get(), "to", height);
				this._height!.set(isNull(height) ? undefined : height);
			}

			// Clear recalculate flag
			this._flags &= ~FlexFlags.RecalculateBoth;

			/* const renderableChildren: number = []; // children.filter(c => !c.skip);
			// todo keep list of all indices that are renderable..
			if (recalculateInheritedSpaceFromChildren(this.position, flags, children, positions, this._spacing, this._direction))
			{
				Log.debug("Flexible: recalculated size to", Log.stringify(this.position));
			}

			this._renderableChildren = renderableChildren;
			this._renderableChildrenPositions = renderableChildren.map(c => c.position);*/
		}
	}

	private _bindFlexiblePosition(binder: Binder<WidgetBaseDesc>, params: FlexiblePosition & { visibility?: ElementVisibility })
	{
		const parsed = <ParsedFlexiblePosition>{
			_padding: parsePadding(params.padding)
		};
		binder.on(params.width, (value, store) =>
		{
			parsed._width = parseScaleOrFallback(value, defaultScale);
			this._flags |= FlexFlags.RecalculateWidth | (store ? FlexFlags.UseStoreForWidth : 0);
		});
		binder.on(params.height, (value, store) =>
		{
			parsed._height = parseScaleOrFallback(value, defaultScale);
			this._flags |= FlexFlags.RecalculateHeight | (store ? FlexFlags.UseStoreForHeight : 0);
			// parsed._height = this._parseScale(parsed._height, value, FlexFlags.RecalculateHeight, InheritFlags.Height, FlexFlags.CheckInheritableHeight);
		});
		binder.on(params.visibility, (value, store) =>
		{
			parsed._skip = value === "none";
			this._flags |= FlexFlags.RecalculateBoth | (store ? FlexFlags.UseStoreForBoth : 0);
		});
		return parsed;
	}
}

/* 	private _parseScale(oldValue:ParsedScale, newValue: Scale, recalculateFlag: FlexFlags, inheritFlag: InheritFlags, recheckFlag: FlexFlags)
	{
		const scale = parseScaleOrFallback(newValue, defaultScale);
		const flags = this._flags | recalculateFlag;
		const absolute = isAbsolute(scale);

		// Check if possible inheritance needs to be recalculated
		this._flags = absolute == !(flags & inheritFlag) && absolute != isAbsolute(oldValue)
			? (flags | recheckFlag)
			: flags;

		return scale;
	}
} */
