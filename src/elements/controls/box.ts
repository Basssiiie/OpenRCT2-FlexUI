import { Bindable } from "@src/bindings/bindable";
import { BuildOutput } from "@src/building/buildOutput";
import { Layoutable } from "@src/building/layoutable";
import { ParentControl } from "@src/building/parentControl";
import { WidgetCreator } from "@src/building/widgets/widgetCreator";
import { WidgetMap } from "@src/building/widgets/widgetMap";
import { Padding } from "@src/positional/padding";
import { Parsed } from "@src/positional/parsing/parsed";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { ScaleType } from "@src/positional/parsing/scaleType";
import { Rectangle } from "@src/positional/rectangle";
import * as Log from "@src/utilities/logger";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { getInheritanceFlags, InheritFlags, recalculateInheritedSpaceFromChild } from "../layouts/flexible/desiredSpacing";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { parseFlexiblePosition } from "../layouts/flexible/parseFlexiblePosition";
import { setSizeWithPadding } from "../layouts/paddingHelpers";
import { Positions } from "../layouts/positions";
import { Control } from "./control";


/**
 * The content to show within the box.
 */
export type BoxContainer = WidgetCreator<FlexiblePosition>;


/**
 * The parameters for configuring a visual box in the user interface.
 */
export interface BoxParams extends ElementParams
{
	/**
	 * The content to show within the box. The content will be padded to `6px`
	 * if `padding` is not set on this content.
	 */
	content: BoxContainer;

	/**
	 * An optionel label to show at the top of the box.
	 * @default undefined
	 */
	text?: Bindable<string>;
}


/**
 * Create a visually drawn box for bringing focus to an inner widget.
 */
export function box(params: BoxContainer & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function box(params: BoxContainer & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function box(params: BoxParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function box(params: BoxParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function box(params: (BoxParams | BoxContainer) & Positions): WidgetCreator<Positions>
{
	return (parent, output): BoxControl => new BoxControl(parent, output, params);
}


const enum BoxFlags
{
	RecalculateFromChildren = (InheritFlags.Count << 0),
	AddTitlePadding = (InheritFlags.Count << 1)
}

const defaultBoxPadding: Padding = 6;
const paddingWithTitle: number = 15;
const trimTopWithoutTitle: number = 4;


/**
 * A controller class for a groupbox widget.
 */
export class BoxControl extends Control<GroupBoxWidget> implements GroupBoxWidget, ParentControl<FlexiblePosition>
{
	text?: string;

	_child: Layoutable<FlexiblePosition>;
	_flags: InheritFlags & BoxFlags;

	constructor(parent: ParentControl, output: BuildOutput, params: (BoxParams | BoxContainer) & Positions)
	{
		const type = "groupbox";
		let flags = <InheritFlags & BoxFlags>getInheritanceFlags(params);
		let childCreator: WidgetCreator<FlexiblePosition>;

		if ("content" in params)
		{
			// Is BoxParams (complex object)
			super(type, parent, output, params);
			childCreator = params.content;

			const binder = output.binder, text = params.text;
			binder.add(this, "text", text);
			flags |= (text) ? BoxFlags.AddTitlePadding : 0;
		}
		else
		{
			// Is BoxContainer (flat params, just a creator)
			super(type, parent, output, {});
			childCreator = params;
		}

		this._flags = (flags | BoxFlags.RecalculateFromChildren);

		const child = childCreator(this, output);
		this._child = child;
	}

	parse(position: FlexiblePosition): Parsed<FlexiblePosition>
	{
		const defaultPadding = parsePadding(defaultBoxPadding);
		if (this._flags & BoxFlags.AddTitlePadding)
		{
			defaultPadding.top = [paddingWithTitle, ScaleType.Pixel];
		}
		return parseFlexiblePosition(position, defaultPadding);
	}

	recalculate(): void
	{
		this._flags |= BoxFlags.RecalculateFromChildren;
		if (this._flags & InheritFlags.All)
		{
			this._parent.recalculate();
		}
	}

	_recalculateSizeFromChildren(): void
	{
		Log.debug(`Box(${this.name}): recalculateSizeFromChild() -> ${!!(this._flags & BoxFlags.RecalculateFromChildren)}`);
		if (this._flags & BoxFlags.RecalculateFromChildren)
		{
			// Clear recalculate flag
			this._flags &= ~BoxFlags.RecalculateFromChildren;

			if (recalculateInheritedSpaceFromChild(this._position, this._flags, this._child.position()))
			{
				Log.debug(`Box(${this.name}): recalculated size to [${this._position.width}x${this._position.height}]`);
			}
		}
	}

	override position(): Parsed<Positions>
	{
		this._recalculateSizeFromChildren();
		return this._position;
	}

	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		Log.debug(`Box(${this.name}) layout() for area: [${area.x}, ${area.y}, ${area.width}, ${area.height}]`);
		// Align visual box with layout box, will move label slightly out of bounds.
		const trim = (this._flags & BoxFlags.AddTitlePadding) ? 0 : trimTopWithoutTitle;
		area.y -= trim;
		area.height += trim;
		super.layout(widgets, area);
		area.y += trim;
		area.height -= trim;

		const { width, height, padding } = this._child.position();
		Log.debug(`Box(${this.name}) layout() child size: [${width}]x[${height}]`);
		setSizeWithPadding(area, width, height, padding);
		const child = this._child;
		child.layout(widgets, area);
	}
}