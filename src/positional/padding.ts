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
	 * Specify the size of the padding around this widget.
	 *
	 * **Example usage:**
	 *  * `padding: "5px"` - applies same padding to all 4 sides.
	 *  * `padding: [ 5, 10 ]` - applies 5 to vertical sides, 10 to horizontal sides.
	 *  * `padding: [ 2, 3, 4, 5 ]` - applies in clockwise order; top, right, bottom, left.
	 *  * `padding: { top: 5 }` - applies only to named sides.
	 */
	padding?: Padding;
}
