import { AbsolutePosition } from "./absolutePosition";
import { FlexiblePosition } from "./flexiblePosition";


/**
 * Union of all possible positions.
 */
export type Positions = FlexiblePosition | AbsolutePosition;