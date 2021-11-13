import { Scale } from "./scale";


/**
 * Specifies the padding to use on each of the four sides of a rectangle area.
 */
export type Padding = Scale
	/* vertical | horizontal */
	| [Scale, Scale]
	/* top | right | bottom | left */
	| [Scale, Scale, Scale, Scale]
	| { top?: Scale; right?: Scale; bottom?: Scale; left?: Scale };


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
	 * @default "5px" for boxes and window frame, 0 for everything else.
	 */
	padding?: Padding;
}
