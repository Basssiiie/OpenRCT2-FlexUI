import { Rectangle } from "@src/positional/rectangle";
import * as Log from "@src/utilities/logger";
import { round } from "@src/utilities/math";
import { WidgetMap } from "@src/windows/widgets/widgetMap";


/**
 * A layout function that retrieves the widget from the container by name
 * and then updates it to fill the rectangle area.
 */
export function fillLayout(widgets: WidgetMap, name: string, area: Rectangle): void
{
	const widget = widgets[name];
	Log.assert(!!widget, "Widget with name", name, "not in widget map.");
	widget.x = round(area.x);
	widget.y = round(area.y);
	widget.width = round(area.width - 0.1); // ensure values ending in .5 round down (round inwards)
	widget.height = round(area.height - 0.1);
}
