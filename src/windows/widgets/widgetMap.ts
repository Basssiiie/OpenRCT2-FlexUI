/**
 * Defines a dictionary set that contains active or description widgets by name.
 */
export type WidgetMap = Record<string, Widget | WidgetDesc>;


/**
 * Creates a map of all widgets in the window, for quick access from layout functions
 * and window events.
 */
export function addToWidgetMap<T extends { name?: string }>(widgets: T[], dictionary?: Record<string, T>): Record<string, T>
{
	dictionary ||= {};

	for (const widget of widgets)
	{
		const name = widget.name;
		if (name && !(name in dictionary))
		{
			dictionary[name] = widget;
		}
	}
	return dictionary;
}
