/**
 * Defines a context for window or tab events so they can get their widgets by name.
 */
export interface FrameContext
{
	/**
	 * Gets a widget editor from the window or tab by name. Returns 'null' if the widget is not present.
	 */
	getWidget<T extends Widget>(name: string): T | null;
	getWidget(name: string): Widget | null;

	/**
	 * Trigger a redraw check for the window or tab to be relayouted in the next tick.
	 */
	redraw(): void;
}