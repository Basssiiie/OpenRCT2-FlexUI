import { FlexibleLayoutParams, FlexibleLayoutContainer } from "@src/elements/layouts/flexible/flexible";
import { Positions } from "@src/elements/layouts/positions";


/**
 * Alias for all the parameters that are required for creating the body of a frame.
 */
export type FrameParams = (FlexibleLayoutParams | FlexibleLayoutContainer) & Positions;