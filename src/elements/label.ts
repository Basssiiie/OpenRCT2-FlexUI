import { BuildOutput } from "@src/core/buildOutput";
import { defaultLineHeight } from "@src/core/defaults";
import { WidgetCreator } from "@src/core/widgetCreator";
import { Bindable } from "@src/observables/bindable";
import { AbsolutePosition } from "@src/positional/absolutePosition";
import { FlexiblePosition } from "@src/positional/flexiblePosition";
import { Positions } from "@src/positional/positions";
import { TextColour } from "@src/utilities/colour";
import { isUndefined } from "@src/utilities/type";
import { Control } from "./control";
import { ElementParams } from "./element";


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
	if (isUndefined(params.height))
		params.height = defaultLineHeight;

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
