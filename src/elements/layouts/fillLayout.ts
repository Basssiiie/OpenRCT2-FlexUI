import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { Rectangle } from "@src/positional/rectangle";
import { round } from "@src/utilities/math";
import * as Log from "@src/utilities/logger";


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
	widget.width = round(area.width);
	widget.height = round(area.height);
}
