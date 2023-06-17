import { Bindable } from "@src/bindings/bindable";
import { Rectangle } from "@src/positional/rectangle";
import { TextColour } from "@src/utilities/textColour";
import { BuildOutput } from "@src/windows/buildOutput";
import { ParentControl } from "@src/windows/parentControl";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { SizeParams } from "../../positional/size";
import { ensureDefaultLineHeight } from "../constants";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Control } from "./control";


/**
 * The parameters for configuring the label.
 */
export interface LabelParams extends ElementParams
{
	/**
	 * The text to be shown inside the label.
	 */
	text: Bindable<string>;

	/**
	 * The alignment of the label.
	 */
	alignment?: Bindable<TextAlignment>;

	/**
	 * The colour of the text.
	 *
	 * Note: colour can also be inserted mid-text by using `{COLOUR}`.
	 * @todo Not yet implemented.
	 */
	color?: Bindable<TextColour>;
}


/**
 * Create a textual label with the specified parameters.
 */
export function label(params: LabelParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function label(params: LabelParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function label<I extends SizeParams, P>(params: LabelParams & I): WidgetCreator<I, P>
{
	ensureDefaultLineHeight(params);

	return (parent, output) => new LabelControl(parent, output, params);
}


/**
 * A controller class for a label widget.
 */
class LabelControl<I, P> extends Control<LabelDesc, I, P> implements LabelDesc
{
	text: string = "";
	textAlign?: TextAlignment;

	constructor(parent: ParentControl<I, P>, output: BuildOutput, params: LabelParams & I)
	{
		super("label", parent, output, params);

		const binder = output.binder;
		binder.add(this, "text", params.text);
		binder.add(this, "textAlign", params.alignment);
	}

	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		// Align label with checkboxes, spinners, dropdowns etc.
		area.y += 2;
		super.layout(widgets, area);
	}
}
