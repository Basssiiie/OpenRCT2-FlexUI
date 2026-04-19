import { Bindable } from "@src/bindings/bindable";
import { TwoWayBindable } from "@src/bindings/twoway/twowayBindable";
import { BuildOutput } from "@src/windows/buildOutput";
import { toWidgetCreator, WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { SizeParams } from "../../positional/size";
import { ensureDefaultLineHeight } from "../constants";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Control } from "./control";


/**
 * The parameters for configuring the textbox.
 */
export interface TextBoxParams extends ElementParams
{
	/**
	 * The text on to be displayed inside the textbox.
	 * @default undefined
	 */
	text?: TwoWayBindable<string>;

	/**
	 * The maximum amount of input characters allowed in this textbox.
	 * @default undefined
	 */
	maxLength?: Bindable<number>;

	/**
	 * Triggers when the textbox is changed.
	 * @default undefined
	 */
	onChange?: (text: string) => void;
}


/**
 * Create a textbox where the user can input some text.
 */
export function textbox(params: TextBoxParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function textbox(params: TextBoxParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function textbox<Position extends SizeParams>(params: TextBoxParams & Position): WidgetCreator<Position>
{
	ensureDefaultLineHeight(params);

	return toWidgetCreator(TextBoxControl, params);
}


/**
 * A controller class for a textbox widget.
 */
class TextBoxControl<Position> extends Control<TextBoxDesc, Position> implements TextBoxDesc, TextBoxParams
{
	text?: string;
	maxLength?: number;
	onChange?: (text: string) => void;


	constructor(output: BuildOutput, params: TextBoxParams & Position)
	{
		super("textbox", output, params);

		const binder = output.binder;
		binder.twoway(this, "text", "onChange", params.text, params.onChange);
		binder.add(this, "maxLength", params.maxLength);
	}
}
