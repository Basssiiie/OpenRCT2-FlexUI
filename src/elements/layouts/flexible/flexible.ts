import { defaultSpacing, redrawEvent } from "@src/elements/constants";
import { VisualElement } from "@src/elements/controls/visualElement";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Axis } from "@src/positional/axis";
import { parseScale } from "@src/positional/parsing/parseScale";
import { Parsed } from "@src/positional/parsing/parsed";
import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { Rectangle } from "@src/positional/rectangle";
import { Scale } from "@src/positional/scale";
import * as Log from "@src/utilities/logger";
import { isArray } from "@src/utilities/type";
import { BuildOutput } from "@src/windows/buildOutput";
import { Layoutable } from "@src/windows/layoutable";
import { ParentControl } from "@src/windows/parentControl";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { ParsedSize, SizeParams } from "../../../positional/size";
import { AbsolutePosition } from "../absolute/absolutePosition";
import { InheritFlags, getInheritanceFlags, recalculateInheritedSpaceFromChildren } from "./desiredSpacing";
import { flexibleLayout } from "./flexibleLayout";
import { FlexiblePosition } from "./flexiblePosition";
import { parseFlexiblePosition } from "./parseFlexiblePosition";


/**
 * Array of widgets for use in a flexible layout container.
 */
export type FlexibleLayoutContainer = WidgetCreator<FlexiblePosition, Parsed<FlexiblePosition>>[];


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
export function horizontal<I extends SizeParams, P extends ParsedSize>(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & I): WidgetCreator<I, P>
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
export function vertical<I extends SizeParams, P extends ParsedSize>(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & I): WidgetCreator<I, P>
{
	(<FlexibleDirectionalLayoutParams>params).direction = <number>Axis.Vertical;
	return <never>flexible(<never>params);
}


/**
 * Add a flexible row with one or more child widgets in the specified direction.
 */
export function flexible(params: FlexibleDirectionalLayoutParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function flexible(params: FlexibleDirectionalLayoutParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function flexible<I extends SizeParams, P extends ParsedSize>(params: FlexibleDirectionalLayoutParams & I): WidgetCreator<I, P>
{
	return (parent, output) => new FlexibleLayoutControl<I, P>(parent, output, params);
}


const enum FlexFlags
{
	RecalculateFromChildren = (InheritFlags.Count << 0)
}

type FlexChild = Layoutable<Parsed<FlexiblePosition>>;


export class FlexibleLayoutControl<I extends SizeParams, P extends ParsedSize> extends VisualElement<I, P> implements Layoutable<P>, ParentControl<FlexiblePosition>
{
	parse = parseFlexiblePosition;

	_children: FlexChild[];
	_renderableChildren!: FlexChild[];
	_renderableChildrenPositions!: Parsed<FlexiblePosition>[];

	_direction: Axis;
	_spacing: ParsedScale;
	_flags: number;

	constructor(parent: ParentControl<I, P>, output: BuildOutput, params: (FlexibleDirectionalLayoutParams | FlexibleLayoutContainer) & I)
	{
		super(parent, params);
		this._direction = (<{ direction?: Axis }>params).direction || Axis.Vertical;
		this._spacing = (parseScale((<{ spacing?: Scale }>params).spacing) || defaultSpacing);

		const inheritFlags = getInheritanceFlags(params);
		const childCreators = (isArray(params)) ? params : params.content;
		const count = childCreators.length;
		const children = Array<FlexChild>(count);

		for (let i = 0; i < count; i++)
		{
			const creator = childCreators[i];
			children[i] = creator(this, output);
		}

		this._flags = (inheritFlags | FlexFlags.RecalculateFromChildren);
		this._children = children;

		output.on(redrawEvent, () =>
		{
			const flags = this._flags;
			Log.debug("Flexible: recalculate size from children ->", !!(flags & FlexFlags.RecalculateFromChildren));
			if (flags & FlexFlags.RecalculateFromChildren)
			{
				// Clear recalculate flag
				this._flags &= ~FlexFlags.RecalculateFromChildren;

				const children = this._children;
				const renderableChildren = children.filter(c => !c.skip);

				if (recalculateInheritedSpaceFromChildren(this.position, flags, children, this._spacing, this._direction))
				{
					Log.debug("Flexible: recalculated size to", Log.stringify(this.position));
				}

				this._renderableChildren = renderableChildren;
				this._renderableChildrenPositions = renderableChildren.map(c => c.position);
			}
		});
	}

	recalculate(): void
	{
		this._flags |= FlexFlags.RecalculateFromChildren;
		if (this._flags & InheritFlags.All)
		{
			this._parent.recalculate();
		}
	}

	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		Log.debug("Flexible; layout() for area:", Log.stringify(area));
		Log.assert(!!this._renderableChildren, "redraw event was not called: children are missing");

		flexibleLayout(this._renderableChildrenPositions, area, this._direction, this._spacing, (idx, subarea) =>
		{
			this._renderableChildren[idx].layout(widgets, subarea);
		});
	}
}
