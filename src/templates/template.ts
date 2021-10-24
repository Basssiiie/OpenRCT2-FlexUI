import { WidgetEditor } from "@src/core/widgetEditor";
import { Binder } from "@src/observables/binder";
import * as ArrayHelper from "@src/utilities/array";
import { WindowTemplate } from "./windowTemplate";


/**
 * Internal template that keeps track of the window.
 */
export class Template implements WindowTemplate
{
	window: Window | null = null;


	/**
	 * Callback that gets called when the window is opened.
	 */
	onOpen?: () => void;


	constructor(private readonly description: WindowDesc, private readonly binder?: Binder)
	{
	}

	open(): void
	{
		if (this.onOpen)
		{
			this.onOpen();
		}
		this.window = ui.openWindow(this.description);
		if (this.binder)
		{
			this.binder.bind(this);
		}
	}

	close(): void
	{
		ui.closeWindows(this.description.classification);
		this.window = null;
	}

	focus(): void
	{
		if (this.window)
		{
			this.window.bringToFront();
		}
	}

	getWidget<T extends Widget>(name: string): WidgetEditor<T> | null
	{
		const widgets = this.description.widgets;
		if (widgets)
		{
			const template = ArrayHelper.find(widgets, w => w.name === name) as T;
			if (template)
			{
				const active = (this.window) ? this.window.findWidget<T>(name) : undefined;
				return new WidgetEditor(template, active);
			}
		}
		return null;
	}
}
