import { Padding } from "./padding";


/**
 * Applies to areas that can have a padding.
 */
export interface Paddable
{
	/**
	 * Specify the size of the padding around this widget. For allowed values, see {@link Scale}.
	 *
	 * **Example usage:**
	 *  * `padding: "5px"` - applies same padding (5 pixels) to all 4 sides.
	 *  * `padding: [ 5, "10%" ]` - applies 5 pixels to vertical sides, 10% to horizontal sides.
	 *  * `padding: [ 2, "3w", 4, "5%" ]` - applies in clockwise order; top, right, bottom, left.
	 *  * `padding: { top: 15 }` - applies only to named sides, the rest is default.
	 *
	 * @default "4px" for window frame, "6px" for box children, "0px" for everything else.
	 */
	padding?: Padding;
}