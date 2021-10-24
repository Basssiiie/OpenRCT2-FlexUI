import { BuildOutput } from "@src/core/buildOutput";
import { WidgetCreator } from "@src/core/widgetCreator";
import { Bindable } from "@src/observables/bindable";
import { Positions } from "@src/positional/positions";
import { Control } from "./control";
import { ElementParams } from "./element";


/**
 * The parameters for configuring the button.
 */
export interface ButtonParams extends ElementParams
{
	/**
	 * The text on the button.
	 */
	text?: Bindable<string>;

	/**
	 * The id of a sprite to use as image.
	 * @default undefined
	 */
	image?: Bindable<number>;

	/**
	 * Whether the button starts off being pressed or not.
	 * @default false
	 */
	isPressed?: Bindable<boolean>;

	/**
	 * Triggers when the button is pressed.
	 */
	onClick?: () => void;
}


export function button(params: ButtonParams & Positions): WidgetCreator<ButtonParams & Positions>
{
	return {
		params: params,
		create: (output: BuildOutput): ButtonControl => new ButtonControl(output, params)
	};
}


/**
 * A controller class for a button widget.
 */
class ButtonControl extends Control<ButtonWidget> implements ButtonWidget, ButtonParams
{
	text?: string;
	image?: number;
	isPressed?: boolean;


	constructor(output: BuildOutput, params: ButtonParams)
	{
		super("button", output, params);

		const binder = output.binder;
		binder.read(this, "text", params.text);
		binder.read(this, "image", params.image);
		binder.read(this, "isPressed", params.isPressed);
	}
}