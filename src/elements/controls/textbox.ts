import { Bindable } from "@src/bindings/bindable";
import { TwoWayBindable } from "@src/bindings/twoway/twowayBindable";
import { BuildOutput } from "@src/windows/buildOutput";
import { ParentControl } from "@src/windows/parentControl";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";
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
export function textbox<I extends SizeParams, P>(params: TextBoxParams & I): WidgetCreator<I, P>
{
	ensureDefaultLineHeight(params);

	return (parent, output) => new TextBoxControl(parent, output, params);
}


/**
 * A controller class for a textbox widget.
 */
class TextBoxControl<I, P> extends Control<TextBoxDesc, I, P> implements TextBoxDesc, TextBoxParams
{
	text?: string;
	maxLength?: number;
	onChange?: (text: string) => void;


	constructor(parent: ParentControl<I, P>, output: BuildOutput, params: TextBoxParams & I)
	{
		super("textbox", parent, output, params);

		const binder = output.binder;
		binder.twoway(this, "text", "onChange", params.text, params.onChange);
		binder.add(this, "maxLength", params.maxLength);
	}
}