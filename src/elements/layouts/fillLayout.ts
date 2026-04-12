import { Rectangle } from "@src/positional/rectangle";
import * as Log from "@src/utilities/logger";
import { round } from "@src/utilities/math";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { axisKeys, sizeKeys } from "./paddingHelpers";


/**
 * A layout function that retrieves the widget from the container by name
 * and then updates it to fill the rectangle area.
 */
export function fillLayout(area: Rectangle, widget: Widget | WidgetDesc): void;
export function fillLayout(area: Rectangle, widgets: WidgetMap, name: string): void;
export function fillLayout(area: Rectangle, widgets: WidgetMap | Widget | WidgetDesc, name?: string): void
{
	const widget = name ? (<WidgetMap>widgets)[name] : <Widget>widgets;
	Log.assert(!!widget, "Widget with name", widget.name, "not in widget map.");
	updateIfNotEqual(widget, axisKeys[1], area.x);
	updateIfNotEqual(widget, axisKeys[0], area.y);
	updateIfNotEqual(widget, sizeKeys[1], area.width - 0.01); // ensure values ending in .5 round down (round inwards)
	updateIfNotEqual(widget, sizeKeys[0], area.height - 0.01);
}

/**
 * Updates the value if it is not equal. This check is done to minimize invalidation
 * calls executed by the various setters.
 */
function updateIfNotEqual(widget: Rectangle, key: keyof Rectangle, value: number): void // todo: benchmark
{
	if (widget[key] !== value)
	{
		widget[key] = round(value);
	}
}
