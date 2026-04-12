import { Bindable } from "@src/bindings/bindable";
import { Axis } from "@src/positional/axis";
import { Padding } from "@src/positional/padding";
import { Scale } from "@src/positional/scale";
import { isUndefined } from "@src/utilities/type";
import { toWidgetCreator, WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { SizeParams } from "../../positional/size";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexibleDirectionalLayoutParams, FlexibleLayoutControl } from "../layouts/flexible/flexible";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { BoxContainer, BoxControl, BoxParams } from "./box";


/**
 * The parameters for configuring a visual box in the user interface.
 */
export interface GroupBoxParams extends FlexibleDirectionalLayoutParams, ElementParams
{
	/**
	 * The content to show within the box. The content will be padded to `6px`
	 * if `padding` is not set on this content.
	 */
	content: BoxContainer[];

	/**
	 * The space between the group box border and the items within the box.
	 * @default "6px"
	 */
	gap?: Padding;

	/**
	 * An optionel label to show at the top of the box.
	 * @default undefined
	 */
	text?: Bindable<string>;
}


/**
 * Create a visual box for grouping one or widgets with the specified parameters by using
 * a flexible control internally. This widget is essentially a combination between `box()`
 * and `flexible()`.
 */
export function groupbox(params: BoxContainer[] & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function groupbox(params: BoxContainer[] & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function groupbox(params: GroupBoxParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function groupbox(params: GroupBoxParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function groupbox<Position extends SizeParams>(params: (GroupBoxParams | BoxContainer[]) & Position): WidgetCreator<Position>
{
	let content: BoxContainer[],
		gap: Padding | undefined,
		spacing: Scale | undefined,
		direction: number = Axis.Vertical;

	if ("content" in params)
	{
		content = params.content;
		gap = params.gap;
		spacing = params.spacing;

		const selectedDirection = params.direction;
		if (!isUndefined(selectedDirection))
		{
			direction = selectedDirection;
		}
	}
	else
	{
		content = params;
	}

	const boxParams = <BoxParams & Position><never>params;
	const flexParams = { content, direction, spacing, padding: gap };
	boxParams.content = toWidgetCreator(FlexibleLayoutControl, flexParams);

	return toWidgetCreator(BoxControl, boxParams);
}
