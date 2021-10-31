import { BuildOutput } from "@src/core/buildOutput";
import { WidgetCreator } from "@src/core/widgetCreator";
import { Bindable } from "@src/observables/bindable";
import { Positions } from "@src/positional/positions";
import { TextColour } from "@src/utilities/colour";
import { Control } from "./control";
import { ElementParams } from "./element";


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
export function label(params: LabelParams & Positions): WidgetCreator<LabelParams & Positions>
{
	return {
		params: params,
		create: (output: BuildOutput): LabelControl => new LabelControl(output, params)
	};
}


/**
 * A controller class for a label widget.
 */
class LabelControl extends Control<LabelWidget> implements LabelWidget, LabelParams
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
