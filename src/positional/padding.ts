import { Scale } from "./scale";


/**
 * Specifies the padding to use on each of the four sides of a rectangle area.
 */
export type Padding = Scale
	/* vertical | horizontal */
	| [Scale, Scale]
	/* top | right | bottom | left */
	| [Scale, Scale, Scale, Scale]
	| {
		/** Specifies the padding at the top of the control. */
		top?: Scale;
		/** Specifies the padding at the right side of the control. */
		right?: Scale;
		/** Specifies the padding at the bottom of the control. */
		bottom?: Scale;
		/** Specifies the padding at the left side of the control. */
		left?: Scale;
		/** Specifies the padding for all unspecified sides of the control. */
		rest?: Scale;
	};
