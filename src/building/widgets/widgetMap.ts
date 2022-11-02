/**
 * Defines a dictionary set that contains widgets by name.
 */
export type WidgetMap = Record<string, WidgetBase>;


/**
 * Creates a map of all widgets in the window, for quick access from layout functions
 * and window events.
 */
export function createWidgetMap(widgets: WidgetBase[]): WidgetMap
{
	const dictionary: Record<string, WidgetBase> = {};

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