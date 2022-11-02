import { BuildOutput } from "@src/building/buildOutput";
import { Layoutable } from "@src/building/layoutable";
import { ParentControl } from "@src/building/parentControl";
import { WidgetCreator } from "@src/building/widgets/widgetCreator";
import { WidgetMap } from "@src/building/widgets/widgetMap";
import { defaultSpacing } from "@src/elements/constants";
import { VisualElement } from "@src/elements/controls/visualElement";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Parsed } from "@src/positional/parsing/parsed";
import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { parseScale } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { Scale } from "@src/positional/scale";
import * as Log from "@src/utilities/logger";
import { isArray } from "@src/utilities/type";
import { AbsolutePosition } from "../absolute/absolutePosition";
import { Positions } from "../positions";
import { getInheritanceFlags, InheritFlags, recalculateInheritedSpaceFromChildren } from "./desiredSpacing";
import { flexibleLayout } from "./flexibleLayout";
import { FlexiblePosition } from "./flexiblePosition";
import { parseFlexiblePosition } from "./parseFlexiblePosition";


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
 * Add a horizontal row with one or more child widgets.
 */
export function horizontal(params: FlexibleLayoutContainer & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function horizontal(params: FlexibleLayoutContainer & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function horizontal(params: FlexibleLayoutParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function horizontal(params: FlexibleLayoutParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function horizontal(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & Positions): WidgetCreator<Positions>
{
	return flexible(<never>params, LayoutDirection.Horizontal);
}


/**
 * Add a vertical row with one or more child widgets.
 */
export function vertical(params: FlexibleLayoutContainer & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function vertical(params: FlexibleLayoutContainer & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function vertical(params: FlexibleLayoutParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function vertical(params: FlexibleLayoutParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function vertical(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & Positions): WidgetCreator<Positions>
{
	return flexible(<never>params, LayoutDirection.Vertical);
}


/**
 * Add a flexible row with one or more child widgets in the specified direction.
 */
export function flexible(params: FlexibleLayoutContainer & FlexiblePosition, direction: LayoutDirection): WidgetCreator<FlexiblePosition>;
export function flexible(params: FlexibleLayoutContainer & AbsolutePosition, direction: LayoutDirection): WidgetCreator<AbsolutePosition>;
export function flexible(params: FlexibleLayoutParams & FlexiblePosition, direction: LayoutDirection): WidgetCreator<FlexiblePosition>;
export function flexible(params: FlexibleLayoutParams & AbsolutePosition, direction: LayoutDirection): WidgetCreator<AbsolutePosition>;
export function flexible(params: (FlexibleLayoutParams | FlexibleLayoutContainer) & Positions, direction: LayoutDirection): WidgetCreator<Positions>
{
	return (parent, output): FlexibleLayoutControl => new FlexibleLayoutControl(parent, output, params, direction);
}


const enum FlexFlags
{
	RecalculateFromChildren = (InheritFlags.Count << 0)
}


export class FlexibleLayoutControl extends VisualElement implements ParentControl<FlexiblePosition>
{
	parse = parseFlexiblePosition;

	_children: Layoutable<FlexiblePosition>[];
	_renderableChildren!: Layoutable<FlexiblePosition>[];
	_renderableChildrenPositions!: Parsed<FlexiblePosition>[];

	_direction: LayoutDirection;
	_spacing: ParsedScale;
	_flags: InheritFlags & FlexFlags;

	constructor(parent: ParentControl, output: BuildOutput, params: (FlexibleLayoutParams | FlexibleLayoutContainer) & Positions, direction: LayoutDirection)
	{
		super(parent, params);
		this._direction = direction;

		let spacing: ParsedScale | undefined;
		if ("spacing" in params)
		{
			spacing = parseScale(params.spacing);
		}
		this._spacing = (spacing ||= defaultSpacing);

		const childCreators = (isArray(params)) ? params : params.content;
		const count = childCreators.length;
		const children = Array<Layoutable<FlexiblePosition>>(count);

		for (let i = 0; i < count; i++)
		{
			const creator = childCreators[i];
			const layoutable = creator(this, output);
			children[i] = layoutable;
		}

		this._flags = (getInheritanceFlags(params) | FlexFlags.RecalculateFromChildren);
		this._children = children;
	}

	recalculate(): void
	{
		this._flags |= FlexFlags.RecalculateFromChildren;
		if (this._flags & InheritFlags.All)
		{
			this._parent.recalculate();
		}
	}

	_recalculateSizeFromChildren(): void
	{
		Log.debug(`Flexible: recalculateSizeFromChildren() -> ${!!(this._flags & FlexFlags.RecalculateFromChildren)}`);
		if (this._flags & FlexFlags.RecalculateFromChildren)
		{
			// Clear recalculate flag
			this._flags &= ~FlexFlags.RecalculateFromChildren;

			const renderableChildren = this._children.filter(c => !c.skip);
			const positions = renderableChildren.map(c => c.position());

			if (recalculateInheritedSpaceFromChildren(this._position, this._flags, positions, this._spacing, this._direction))
			{
				Log.debug(`Flexible: recalculated size to [${this._position.width}x${this._position.height}]`);
			}

			this._renderableChildren = renderableChildren;
			this._renderableChildrenPositions = positions;
		}
	}

	override position(): Parsed<Positions>
	{
		this._recalculateSizeFromChildren();
		return this._position;
	}

	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		Log.debug(`Flexible; layout() for area: [${area.x}, ${area.y}, ${area.width}, ${area.height}]`);
		Log.assert(!!this._renderableChildren, "_recalculateSizeFromChildren() was not called: children are missing");

		flexibleLayout(this._renderableChildrenPositions, area, this._direction, this._spacing, (idx, subarea) =>
		{
			this._renderableChildren[idx].layout(widgets, subarea);
		});
	}
}