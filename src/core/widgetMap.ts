/**
 * Defines a dictionary set that contains widgets by name.
 */
export type WidgetMap = Record<string, Widget>;


/**
 * Creates a map of all widgets in the window, for quick access from layout functions
 * and window events.
 */
export function createWidgetMap(widgets: Widget[]): WidgetMap
{
	const dictionary: Record<string, Widget> = {};
	for (let i = 0; i < widgets.length; i++)
	{
		const widget = widgets[i];
		const name = widget.name;
		if (name)
		{
			dictionary[name] = widget;
		}
	}
	return dictionary;
}