import { Rectangle } from "@src/positional/rectangle";
import { WidgetMap } from "./widgetMap";


/**
 * Object that can be layout over a specific area.
 */
export interface Layoutable
{
	/**
	 * Function that can update the positions for a specific set of widgets
	 * when the layout is rendered or re-rendered.
	 */
	layout(widgets: WidgetMap, area: Rectangle): void;
}