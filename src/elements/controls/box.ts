import { Bindable } from "@src/bindings/bindable";
import { Padding } from "@src/positional/padding";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { Parsed } from "@src/positional/parsing/parsed";
import { ScaleType } from "@src/positional/parsing/scaleType";
import { Rectangle } from "@src/positional/rectangle";
import * as Log from "@src/utilities/logger";
import { BuildOutput } from "@src/windows/buildOutput";
import { Layoutable } from "@src/windows/layoutable";
import { ParentControl } from "@src/windows/parentControl";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { ParsedSize, SizeParams } from "../../positional/size";
import { redrawEvent } from "../constants";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { InheritFlags, getInheritanceFlags, recalculateInheritedSpaceFromChild } from "../layouts/flexible/desiredSpacing";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { parseFlexiblePosition } from "../layouts/flexible/parseFlexiblePosition";
import { setSizeWithPadding } from "../layouts/paddingHelpers";
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
export function box<I extends SizeParams, P extends ParsedSize>(params: (BoxParams | BoxContainer) & I): WidgetCreator<I, P>
{
	return (parent, output) => new BoxControl<I, P>(parent, output, params);
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
export class BoxControl<I extends SizeParams, P extends ParsedSize> extends Control<GroupBoxDesc, I, P> implements GroupBoxDesc, ParentControl<FlexiblePosition>
{
	text?: string;

	_child: Layoutable<Parsed<FlexiblePosition>>;
	_flags: number;

	constructor(parent: ParentControl<I, P>, output: BuildOutput, params: (BoxParams | BoxContainer) & I)
	{
		const type = "groupbox";
		const content = "content";
		let flags = getInheritanceFlags(params);
		let childCreator: WidgetCreator<FlexiblePosition>;

		if (content in params)
		{
			// Is BoxParams (complex object)
			super(type, parent, output, params);
			childCreator = params[content];

			const binder = output.binder, text = params.text;
			binder.add(this, "text", text);
			flags |= (text) ? BoxFlags.AddTitlePadding : 0;
		}
		else
		{
			// Is BoxContainer (flat params, just a creator)
			super(type, parent, output, <I>{});
			childCreator = params;
		}

		this._flags = (flags | BoxFlags.RecalculateFromChildren);

		const child = childCreator(this, output);
		this._child = child;

		output.on(redrawEvent, () =>
		{
			Log.debug("Box(", this.name, "): recalculate size from children ->", !!(this._flags & BoxFlags.RecalculateFromChildren));
			if (this._flags & BoxFlags.RecalculateFromChildren)
			{
				// Clear recalculate flag
				this._flags &= ~BoxFlags.RecalculateFromChildren;

				if (recalculateInheritedSpaceFromChild(this.position, this._flags, this._child.position))
				{
					Log.debug("Box(", this.name, "): recalculated size to", Log.stringify(this.position));
				}
			}
		});
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

	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		Log.debug("Box(", this.name, ") layout() for area:", Log.stringify(area));
		// Align visual box with layout box, will move label slightly out of bounds.
		const trim = (this._flags & BoxFlags.AddTitlePadding) ? 0 : trimTopWithoutTitle;
		area.y -= trim;
		area.height += trim;
		super.layout(widgets, area);
		area.y += trim;
		area.height -= trim;

		const child = this._child;
		const position = child.position;
		Log.debug("Box(", this.name, ") layout() child size:", position.width, "x", position.height);
		setSizeWithPadding(area, position.width, position.height, position.padding);
		child.layout(widgets, area);
	}
}