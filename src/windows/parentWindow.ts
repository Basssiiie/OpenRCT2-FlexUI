import { OpenWindow } from "./openWindow";

/**
 * An interface to interact with the parent window of this tab.
 */
export interface ParentWindow extends OpenWindow
{
	/**
	 * Trigger a redraw check for the whole window to be sized and relayouted in the next tick.
	 */
	redraw(): void;
}
