import { WidgetContainer } from "../core/widgetContainer";
import { Rectangle } from "../positional/rectangle";


/**
 * Function that can draw out a layout.
 */
export type LayoutFunction = (widgets: WidgetContainer, area: Rectangle) => void;