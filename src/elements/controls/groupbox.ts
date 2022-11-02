import { Bindable } from "@src/bindings/bindable";
import { WidgetCreator } from "@src/building/widgets/widgetCreator";
import { Padding } from "@src/positional/padding";
import { Scale } from "@src/positional/scale";
import { isUndefined } from "@src/utilities/type";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexibleLayoutControl, FlexibleLayoutParams } from "../layouts/flexible/flexible";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { LayoutDirection } from "../layouts/flexible/layoutDirection";
import { Positions } from "../layouts/positions";
import { BoxContainer, BoxControl, BoxParams } from "./box";


/**
 * The parameters for configuring a visual box in the user interface.
 */
export interface GroupBoxParams extends FlexibleLayoutParams, ElementParams
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
	 * The direction in which to layout the contents of the box.
	 * @default LayoutDirection.Vertical
	 */
	direction?: LayoutDirection;

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
export function groupbox(params: (GroupBoxParams | BoxContainer[]) & Positions): WidgetCreator<Positions>
{
	let content: BoxContainer[],
		gap: Padding | undefined,
		spacing: Scale | undefined,
		direction: LayoutDirection = LayoutDirection.Vertical;

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

	const boxParams = <BoxParams & FlexiblePosition><never>params;
	const flexParams = { content, spacing, padding: gap };
	boxParams.content = <WidgetCreator<FlexiblePosition>>((parent, output) => new FlexibleLayoutControl(parent, output, flexParams, direction));

	return (parent, output) => new BoxControl(parent, output, boxParams);
}