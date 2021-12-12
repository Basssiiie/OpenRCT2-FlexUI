import { BuildOutput } from "@src/building/buildOutput";
import { WidgetCreator } from "@src/building/widgetCreator";
import { Bindable } from "@src/observables/bindable";
import { TextColour } from "@src/utilities/colour";
import { ensureDefaultLineHeight } from "../constants";
import { ElementParams } from "../element";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
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
	 * @todo
	 */
	color?: Bindable<TextColour>;
}


/**
 * Create a textual label with the specified parameters.
 */
export function label(params: LabelParams & FlexiblePosition): WidgetCreator<LabelParams & FlexiblePosition>;
export function label(params: LabelParams & AbsolutePosition): WidgetCreator<LabelParams & AbsolutePosition>;
export function label(params: LabelParams & Positions): WidgetCreator<LabelParams>
{
	ensureDefaultLineHeight(params);

	return {
		params: params,
		create: (output: BuildOutput): LabelControl => new LabelControl(output, params)
	};
}


/**
 * A controller class for a label widget.
 */
class LabelControl extends Control<LabelWidget> implements LabelWidget
{
	text: string = "";
	textAlign?: TextAlignment;

	constructor(output: BuildOutput, params: LabelParams)
	{
		super("label", output, params);

		const binder = output.binder;
		binder.add(this, "text", params.text);
		binder.add(this, "textAlign", params.alignment);
	}
}
