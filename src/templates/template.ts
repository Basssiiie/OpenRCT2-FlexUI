import { WidgetEditor } from "../core/widgetEditor";
import { Binder } from "../observables/binder";
import * as ArrayHelper from "../utilities/array";
import { WindowTemplate } from "./windowTemplate";


/**
 * Internal template that keeps track of the window.
 */
export class Template implements WindowTemplate
{
	/**
	 * Callback that gets called when the window is opened.
	 */
	onOpen?: () => void;

	private _instance?: Window;

	constructor(private readonly window: WindowDesc, private readonly binder?: Binder)
	{
	}

	open(): void
	{
		if (this.onOpen)
		{
			this.onOpen();
		}
		this._instance = ui.openWindow(this.window);
		if (this.binder)
		{
			this.binder.bind(this._instance);
		}
	}

	close(): void
	{
		ui.closeWindows(this.window.classification);
		this._instance = undefined;
	}

	focus(): void
	{
		if (this._instance)
		{
			this._instance.bringToFront();
		}
	}

	getWidget<T extends Widget>(name: string): WidgetEditor<T> | null
	{
		const widgets = this.window.widgets;
		if (widgets)
		{
			const template = ArrayHelper.find(widgets, w => w.name === name) as T;
			if (template)
			{
				const active = (this._instance) ? this._instance.findWidget<T>(name) : undefined;
				return new WidgetEditor(template, active);
			}
		}
		return null;
	}
}
