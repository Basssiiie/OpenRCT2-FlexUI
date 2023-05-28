
export interface ParentWindow
{
	/**
	 * Trigger a redraw check for the whole window to be sized and relayouted in the next tick.
	 */
	redraw(): void;
}