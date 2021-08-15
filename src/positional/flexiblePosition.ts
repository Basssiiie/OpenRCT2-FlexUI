import { Scale } from "./scale";
import { Paddable } from "./padding";


/**
 * Specifies a flexible position for a widget.
 */
export interface FlexiblePosition extends Paddable
{
	/**
	 * Specify a width constraint for this area.
	 *
	 * @see {@link Scale} for how to use.
	 */
	width?: Scale;

	/**
	 * Specify a height constraint for this area.
	 *
	 * @see {@link Scale} for how to use.
	 */
	height?: Scale;
}
