import { FlexibleLayoutContainer, FlexibleLayoutParams } from "@src/elements/layouts/flexible/flexible";
import { Positions } from "@src/elements/layouts/positions";

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
export type FrameContentParams = (FlexibleLayoutParams | FlexibleLayoutContainer) & Positions;