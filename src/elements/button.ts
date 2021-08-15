import { WidgetFactory } from "../core/widgetFactory";
import { ElementFactory, ElementParams } from "./element";
import { BuildOutput } from "../core/buildOutput";
import { LayoutFunction } from "../layouts/layoutFunction";
import { Id } from "../utilities/identifier";
import { Bindable } from "../observables/bindable";
import { LayoutFactory } from "../layouts/layoutFactory";


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


export const ButtonFactory: WidgetFactory<ButtonParams> =
{
	create(output: BuildOutput, params: ButtonParams): LayoutFunction
	{
		const id = Id.new();
		const button = ElementFactory.base<ButtonWidget>(output, params, id);
		button.type = "button";

		const binder = output.binder;
		binder.read(button, "text", params.text);
		binder.read(button, "image", params.image);
		binder.read(button, "isPressed", params.isPressed);

		return (widgets, area): void => LayoutFactory.defaultLayout(widgets, id, area);
	}
};
