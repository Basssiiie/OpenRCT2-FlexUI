import { Bindable } from "@src/bindings/bindable";
import { BuildOutput } from "@src/building/buildOutput";
import { Layoutable } from "@src/building/layoutable";
import { WidgetCreator } from "@src/building/widgetCreator";
import { WidgetMap } from "@src/building/widgetMap";
import { Parsed } from "@src/positional/parsing/parsed";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { isAbsolute, isWeighted, ParsedScale } from "@src/positional/parsing/parsedScale";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { convertToPixels } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { ElementParams } from "../element";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { setDesiredSpaceForChild } from "../layouts/flexible/desiredSpacing";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { parseFlexiblePosition } from "../layouts/flexible/parseFlexiblePosition";
import { applyPadding, hasPadding } from "../layouts/paddingHelpers";
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
	 */
	text?: Bindable<string>;
}


/**
 * Create a visual box for grouping one or widgets with the specified parameters.
 */
export function box(params: BoxContainer & FlexiblePosition): WidgetCreator<BoxContainer & FlexiblePosition>;
export function box(params: BoxContainer & AbsolutePosition): WidgetCreator<BoxContainer & AbsolutePosition>;
export function box(params: BoxParams & FlexiblePosition): WidgetCreator<BoxParams & FlexiblePosition>;
export function box(params: BoxParams & AbsolutePosition): WidgetCreator<BoxParams & AbsolutePosition>;
export function box(params: (BoxParams | BoxContainer) & Positions): WidgetCreator<(BoxParams | BoxContainer) & Positions>
{
	return {
		params: params,
		create: (output: BuildOutput): BoxControl => new BoxControl(output, params)
	};
}


const defaultPadding: ParsedPadding = parsePadding(6);
const trimTop: number = 4;


/**
 * A controller class for a groupbox widget.
 */
class BoxControl extends Control<GroupBoxWidget> implements GroupBoxWidget
{
	text?: string;

	_child: Layoutable;
	_childPos: Parsed<FlexiblePosition>;

	constructor(output: BuildOutput, params: (BoxParams | BoxContainer) & Positions)
	{
		const type = "groupbox";
		let content: WidgetCreator<FlexiblePosition>;
		if ("create" in params)
		{
			// Is BoxContainer (flat params, just a creator)
			super(type, output, {});
			content = params;
		}
		else
		{
			// Is BoxParams (complex object)
			super(type, output, params);
			content = params.content;

			const binder = output.binder;
			binder.add(this, "text", params.text);
		}

		this._child = content.create(output);

		const childPos = parseFlexiblePosition(content.params, defaultPadding);
		this._childPos = childPos;
		setDesiredSpaceForChild(params, childPos);
	}

	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		// Align visual box with layout box, will move label slightly out of bounds.
		area.y -= trimTop;
		area.height += trimTop;
		super.layout(widgets, area);
		area.y += trimTop;
		area.height -= trimTop;

		const { width, height, padding } = this._childPos;
		if (hasPadding(padding))
		{
			applyPadding(area, width, height, padding);
		}
		else
		{
			area.width = parseAxis(width, area.width);
			area.height = parseAxis(height, area.height);
		}

		const child = this._child;
		child.layout(widgets, area);
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