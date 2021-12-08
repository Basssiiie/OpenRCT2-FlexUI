import { AbsolutePosition } from "./absolute/absolutePosition";
import { FlexiblePosition } from "./flexible/flexiblePosition";


/**
 * Union of all possible positions.
 */
export type Positions = FlexiblePosition | AbsolutePosition;