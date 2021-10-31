import { WidgetMap } from "@src/core/widgetMap";
import { Rectangle } from "@src/positional/rectangle";


/**
 * A layout function that retrieves the widget from the container by name
 * and then updates it to fill the rectangle area.
 */
export function fillLayout(widgets: WidgetMap, name: string, area: Rectangle): void
{
	const widget = widgets[name];
	widget.x = area.x;
	widget.y = area.y;
	widget.width = area.width;
	widget.height = area.height;
}
