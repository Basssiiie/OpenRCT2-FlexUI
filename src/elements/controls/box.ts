import { Bindable } from "@src/bindings/bindable";
import { BuildOutput } from "@src/building/buildOutput";
import { Layoutable } from "@src/building/layoutable";
import { WidgetCreator } from "@src/building/widgetCreator";
import { ParentControl } from "@src/building/parentControl";
import { WidgetMap } from "@src/building/widgetMap";
import { Padding } from "@src/positional/padding";
import { Parsed } from "@src/positional/parsing/parsed";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { isAbsolute, isWeighted, ParsedScale } from "@src/positional/parsing/parsedScale";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { convertToPixels } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { setDesiredSpaceFromChild } from "../layouts/flexible/desiredSpacing";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { parseFlexiblePosition } from "../layouts/flexible/parseFlexiblePosition";
import { setSizeWithPadding, hasPadding } from "../layouts/paddingHelpers";
import { Positions } from "../layouts/positions";
import { Control } from "./control";
import { isUndefined } from "@src/utilities/type";


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
export function box(params: BoxContainer & FlexiblePosition): WidgetCreator<BoxContainer & FlexiblePosition>;
export function box(params: BoxContainer & AbsolutePosition): WidgetCreator<BoxContainer & AbsolutePosition>;
export function box(params: BoxParams & FlexiblePosition): WidgetCreator<BoxParams & FlexiblePosition>;
export function box(params: BoxParams & AbsolutePosition): WidgetCreator<BoxParams & AbsolutePosition>;
export function box(params: (BoxParams | BoxContainer) & Positions): WidgetCreator<(BoxParams | BoxContainer) & Positions>
{
	return {
		params,
		create: (output: BuildOutput): BoxControl => new BoxControl(output, params)
	};
}


/**
 * Default padding for content in box widgets.
 */
export const defaultBoxPadding: Padding = 6;


const enum BoxFlags
{
	IsWidthSet = (1 << 0),
	IsHeightSet = (1 << 1)
}


const parsedDefaultPadding: ParsedPadding = parsePadding(defaultBoxPadding);
const trimTopWithoutText: number = 4;


/**
 * A controller class for a groupbox widget.
 */
export class BoxControl extends Control<GroupBoxWidget> implements GroupBoxWidget, ParentControl<FlexiblePosition>
{
	text?: string;

	_child: Layoutable<FlexiblePosition>;
	_flags: BoxFlags;
	_topOffset: number;

	constructor(parent: ParentControl, output: BuildOutput, params: (BoxParams | BoxContainer) & Positions)
	{
		const type = "groupbox";
		let content: WidgetCreator<FlexiblePosition>;
		if ("create" in params)
		{
			// Is BoxContainer (flat params, just a creator)
			super(type, parent, output, {});
			content = params;
			this._topOffset = trimTopWithoutText;
		}
		else
		{
			// Is BoxParams (complex object)
			super(type, parent, output, params);
			content = params.content;

			const binder = output.binder, text = params.text;
			binder.add(this, "text", text);
			this._topOffset = (text) ? 0 : trimTopWithoutText;
		}

		this._flags = (isUndefined(params.width) ?
			+ (isUndefined(params.height) << 1))

		const child = content.create(this, output);
		this._child = child;
	}

	override position(): Parsed<object>
	{
		setDesiredSpaceFromChild(this._position, child.position);
		return this._position;
	}

	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		// Align visual box with layout box, will move label slightly out of bounds.
		const trim = this._topOffset;
		area.y -= trim;
		area.height += trim;
		super.layout(widgets, area);
		area.y += trim;
		area.height -= trim;

		const { width, height, padding } = this._child.position;
		if (hasPadding(padding))
		{
			setSizeWithPadding(area, width, height, padding);
		}
		else
		{
			area.width = parseAxis(width, area.width);
			area.height = parseAxis(height, area.height);
		}

		const child = this._child;
		child.layout(widgets, area);
	}

	parse(position: FlexiblePosition): Parsed<FlexiblePosition>
	{
		return parseFlexiblePosition(position, parsedDefaultPadding);
	}
}


/**
 * Sets the size of the axis, using the parent space for calculating leftover space.
 */
function parseAxis(scale: ParsedScale, parentSpace: number): number
{
	const leftoverSpace = (isAbsolute(scale)) ? (parentSpace - scale[0]) : parentSpace;
	const weightedTotal = (isWeighted(scale)) ? scale[0] : undefined;

	return convertToPixels(scale, leftoverSpace, weightedTotal);
}