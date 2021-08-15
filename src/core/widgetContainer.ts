/**
 * Defines a container that contains widgets by name.
 */
export interface WidgetContainer
{
	/**
	 * Gets a widget from the container by name. Returns 'undefined' if the widget is not present.
	 */
	get<T = Widget>(name: string): T;
	get(name: string): Widget;
}


export const WidgetContainer =
{
	/**
	 * Creates a widget container from a list of widgets.
	 */
	create(widgets: Widget[]): WidgetContainer
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
		return {
			get(name: string): Widget
			{
				return dictionary[name];
			}
		};
	}
};