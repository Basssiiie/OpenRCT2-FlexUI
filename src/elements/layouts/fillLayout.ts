import { WidgetMap } from "@src/building/widgetMap";
import { Rectangle } from "@src/positional/rectangle";
import { round } from "@src/utilities/math";


/**
 * A layout function that retrieves the widget from the container by name
 * and then updates it to fill the rectangle area.
 */
export function fillLayout(widgets: WidgetMap, name: string, area: Rectangle): void
{
	const widget = widgets[name];
	widget.x = round(area.x);
	widget.y = round(area.y);
	widget.width = round(area.width);
	widget.height = round(area.height);
}
