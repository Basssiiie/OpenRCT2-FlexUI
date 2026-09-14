import { Rectangle } from "@src/positional/rectangle";
import { WidgetMap } from "./widgets/widgetMap";


/**
 * Object that can be layout over a specific area.
 */
export interface Layoutable
{
	/**
	 * Function that can update the positions for a specific set of widgets when the
	 * layout is rendered or re-rendered.	 *
	 * @param widgets A dictionary of all the widgets in the window, keyed by id. Implementers can
	 * fetch the widgets they own by their id, and update their position and size.	 *
	 * @param area The area to lay the widgets out over, or `false` when this element or one of its
	 * ancestors is hidden. Implementers must then hide every widget they own.
	 */
	layout(widgets: WidgetMap, area: Rectangle | false): void;
}
