import { ElementParams } from "./element";


/**
 * Whether the button is pressed down or released.
 */
export type ToggleDirection = "down" | "up";


/**
 * The parameters for configuring the toggle button.
 */
export interface ToggleParams extends ElementParams
{
	/**
	 * The id of a sprite to use as image.
	 * @default undefined
	 */
	image?: number;

	/**
	 * Whether the button starts off being pressed or not.
	 * @default false
	 */
	isPressed?: boolean;

	/**
	 * Triggers when the button is pressed down.
	 */
	onDown?: () => void;

	/**
	 * Triggers when the button is released.
	 */
	onUp?: () => void;
}


/**
 * A controller class for a toggle button widget.
 */
export default class ToggleControl //extends Control<ToggleParams>
{
}
