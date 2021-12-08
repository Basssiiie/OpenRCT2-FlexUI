import { Paddable } from "../../../positional/padding";
import { Scale } from "../../../positional/scale";


/**
 * Specifies a flexible position for a widget.
 */
export interface FlexiblePosition extends Paddable
{
	/**
	 * The width of this widget on the horizontal axis.
	 * @see {@link Scale} for examples of allowed values.
	 * @default "1w".
	 */
	width?: Scale;

	/**
	 * The height of this widget on the vertical axis.
	 * @see {@link Scale} for examples of allowed values.
	 * @default "14px" for labels, dropdowns, spinners; "1w" for others.
	 */
	height?: Scale;
}
