import { Bindable } from "@src/bindings/bindable";
import { BuildOutput } from "@src/building/buildOutput";
import { WidgetCreator } from "@src/building/widgetCreator";
import { ElementParams } from "../elementParams";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
import { Control } from "./control";


/**
 * The parameters for configuring the button.
 */
export interface ButtonParams extends ElementParams
{
	/**
	 * The text on the button.
	 * @default undefined
	 */
	text?: Bindable<string>;

	/**
	 * The id of a sprite to use as image.
	 * @default undefined
	 */
	image?: Bindable<number>;

	/**
	 * Whether the button has a rectangle border or not.
	 * @default true for text buttons, false for image buttons.
	 */
	border?: Bindable<boolean>;

	/**
	 * Whether the button starts off being pressed or not.
	 * @default false
	 */
	isPressed?: Bindable<boolean>;

	/**
	 * Triggers when the button is pressed.
	 * @default undefined
	 */
	onClick?: () => void;
}


/**
 * Create a clickable button that can perform an action.
 */
export function button(params: ButtonParams & FlexiblePosition): WidgetCreator<ButtonParams & FlexiblePosition>;
export function button(params: ButtonParams & AbsolutePosition): WidgetCreator<ButtonParams & AbsolutePosition>;
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
export class ButtonControl extends Control<ButtonWidget> implements ButtonWidget, ButtonParams
{
	text?: string;
	image?: number;
	border?: boolean;
	isPressed?: boolean;
	onClick?: () => void;


	constructor(output: BuildOutput, params: ButtonParams)
	{
		super("button", output, params);

		const binder = output.binder;
		binder.add(this, "text", params.text);
		binder.add(this, "image", params.image);
		binder.add(this, "border", params.border);
		binder.add(this, "isPressed", params.isPressed);
		this.onClick = params.onClick;
	}
}