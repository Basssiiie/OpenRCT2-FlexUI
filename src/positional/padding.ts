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
