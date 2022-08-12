import { WidgetEditor } from "./widgetEditor";

/**
 * Defines a context for window events so they can get their widgets by name.
 */
export interface WindowContext
{
	/**
	 * Gets a widget editor from the window by name. Returns 'null' if the widget is not present.
	 */
	getWidget<T extends Widget>(name: string): WidgetEditor<T> | null;
	getWidget(name: string): WidgetEditor<Widget> | null;

	/**
	 * Trigger a redraw check for the window to be relayouted in the next tick.
	 */
	redraw(): void;
}