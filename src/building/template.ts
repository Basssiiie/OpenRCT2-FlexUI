import { WindowBinder } from "@src/building/windowBinder";
import { WidgetEditor } from "./widgetEditor";
import { createWidgetMap, WidgetMap } from "./widgetMap";
import { WindowContext } from "./windowContext";
import { WindowTemplate } from "./windowTemplate";


/**
 * Internal template that keeps track of the window.
 */
export class Template implements WindowTemplate, WindowContext
{
	_window: Window | null = null;

	_templateWidgets: WidgetMap | null = null;
	_openWidgets: WidgetMap | null = null;


	/**
	 * Callback that gets called when the window is opened.
	 */
	onOpen?: () => void;


	constructor(private readonly description: WindowDesc, private readonly binder?: WindowBinder)
	{
	}

	/**
	 * Builds the final template.
	 */
	build(): void
	{
		const widgets = this.description.widgets;
		this._templateWidgets = (widgets) ? createWidgetMap(widgets) : null;
	}

	open(): void
	{
		const description = this.description;
		const binder = this.binder;

		if (binder && binder.hasBindings())
		{
			const widgets = this._templateWidgets;
			if (widgets)
			{
				// Update the template widgets always before the window opens.
				binder.update(widgets);
			}
			binder.bind(this);
		}

		const window = ui.openWindow(description);
		this._window = window;
		this._openWidgets = createWidgetMap(window.widgets);

		if (this.onOpen)
		{
			this.onOpen();
		}
	}

	close(): void
	{
		ui.closeWindows(this.description.classification);
		this._window = null;
		this._openWidgets = null;
	}

	focus(): void
	{
		if (this._window)
		{
			this._window.bringToFront();
		}
	}

	getWidget<T extends Widget>(name: string): WidgetEditor<T> | null
	{
		const widgets = this._templateWidgets;
		if (widgets)
		{
			const template = <T>widgets[name];
			if (template)
			{
				const window = this._window;
				let active: T | undefined;
				if (window)
				{
					// Create map of open widgets lazily if it has not been created yet.
					let openWidgets = this._openWidgets;
					if (!openWidgets)
					{
						this._openWidgets = openWidgets = createWidgetMap(window.widgets);
					}
					active = <T>openWidgets[name];
				}
				return new WidgetEditor(template, active);
			}
		}
		return null;
	}
}