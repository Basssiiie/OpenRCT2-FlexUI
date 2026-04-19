import { FlexibleDirectionalLayoutParams, FlexibleLayoutContainer } from "@src/elements/layouts/flexible/flexible";
import { FramePosition } from "./framePosition";


/**
 * Parameters to allow for frame events; these are separate to allow for custom
 * documentation for both tabs and windows.
 */
export interface FrameEventParams
{
	onOpen?: () => void;
	onUpdate?: () => void;
	onClose?: () => void;
}

/**
 * Parameters to allow for frame content to be passed around.
 */
export type FrameContentParams = (FlexibleDirectionalLayoutParams | FlexibleLayoutContainer) & FramePosition;
