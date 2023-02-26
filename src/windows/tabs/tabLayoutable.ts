import { Rectangle } from "@src/positional/rectangle";
import { WidgetMap } from "../widgets/widgetMap";


/**
 * A layoutable interface to interact with a tab.
 */
export interface TabLayoutable
{
	/**
	 * Called when the tab is opened.
	 * @param widgets The widget set of the window, which can be used to find the widgets
	 * used within the tab. This map contains all widgets currently active for the window.
	 */
	open(widgets: WidgetMap): void;

	/**
	 * Called when the tab is to be relayouted within the specified area.
	 * @param area The positional area where the tab's widgets are expected to be layed out.
	 */
	layout(area: Rectangle): void;

	/**
	 * Called every game frame the tab is open. Use with caution.
	 */
	update(): void;

	/**
	 * Called when the tab or the window is closed.
	 */
	close(): void;
}