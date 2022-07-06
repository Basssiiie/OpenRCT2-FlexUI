import { Event } from "@src/utilities/event";
import { BuildOutput } from "./buildOutput";
import { WindowContext } from "./windowContext";
import { WindowEvent } from "./windowEvent";
import { Template } from "./template";
import { WindowBinder } from "./binders/windowBinder";
import { WidgetBinder } from "./binders/widgetBinder";


/**
 * Object that holds components required to build the final window.
 */
export class BuildContainer implements BuildOutput
{
	binder: WidgetBinder;
	context: Template;
	_windowBinder: WindowBinder;
	_widgets: WidgetBase[] = [];

	open: Event<WindowContext> = [];
	update: Event<WindowContext> = [];
	close: Event<WindowContext> = [];

	constructor(window: WindowDesc)
	{
		const binder = new WindowBinder();
		this.binder = binder._widgets;
		this.context = new Template(window, binder);
		this._windowBinder = binder;
	}

	add(widget: WidgetBase): void
	{
		this._widgets.push(widget);
	}

	on(event: WindowEvent, callback: (context: WindowContext) => void): void
	{
		this[event].push(callback);
	}
}