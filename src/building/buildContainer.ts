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
	_windowBinder: WindowBinder;
	_widgets: WidgetBase[] = [];
	_template: Template;

	open: Event<WindowContext> = [];
	update: Event<WindowContext> = [];
	close: Event<WindowContext> = [];

	constructor(window: WindowDesc)
	{
		const binder = new WindowBinder();
		this.binder = binder._widgets;
		this._windowBinder = binder;
		this._template = new Template(window, binder);
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