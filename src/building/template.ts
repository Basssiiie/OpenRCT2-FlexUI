import { WindowBinder } from "@src/building/binders/windowBinder";
import * as Log from "@src/utilities/logger";
import { defaultScale } from "../elements/constants";
import { setSizeWithPadding } from "../elements/layouts/paddingHelpers";
import { ParsedPadding } from "../positional/parsing/parsedPadding";
import { Rectangle } from "../positional/rectangle";
import { Layoutable } from "./layoutable";
import { WidgetEditor } from "./widgetEditor";
import { createWidgetMap, WidgetMap } from "./widgetMap";
import { WindowContext } from "./windowContext";
import { WindowTemplate } from "./windowTemplate";


const topBarSize: number = 15;


/**
 * Internal template that keeps track of the window.
 */
export class Template implements WindowTemplate, WindowContext
{
	_window: Window | null = null;
	_body: Layoutable | null = null;

	_width: number;
	_height: number;
	_padding: ParsedPadding | null = null;

	_templateWidgets: WidgetMap | null = null;
	_openWidgets: WidgetMap | null = null;
	_redrawNextTick: boolean = false;


	/**
	 * Callback that gets called when the window is opened.
	 */
	_onOpen?: () => void;


	constructor(
		readonly _description: WindowDesc,
		private _binder: WindowBinder | null)
	{
		this._width = _description.width;
		this._height = _description.height;
	}

	/**
	 * Builds the final template.
	 */
	_build(): void
	{
		const widgets = this._description.widgets;
		if (widgets)
		{
			const map = createWidgetMap(widgets);
			this._templateWidgets = map;
			performLayout(this, map);
		}
		const binder = this._binder;
		if (binder && !binder._hasBindings())
		{
			// Clean up binder if it is not used.
			this._binder = null;
		}
	}

	/**
	 * Checks if the template has been marked dirty, and redraws if that's the case.
	 */
	_onRedraw(): void
	{	const widgets = this._openWidgets;
		if (this._redrawNextTick && widgets)
		{
			Log.debug(`Redrawing window layout (${this._window?.width} x ${this._window?.height})...`);
			performLayout(this, widgets);
			this._redrawNextTick = false;
		}
	}

	/**
	 * Unbinds all bindings from the currently open window.
	 */
	_onClose(): void
	{
		const binder = this._binder;
		if (binder)
		{
			binder._unbind();
		}
		this._window = null;
		this._openWidgets = null;
	}

	redraw(): void
	{
		if (this._openWidgets)
		{
			this._redrawNextTick = true;
		}
	}

	open(): void
	{
		if (this._window)
		{
			// Multiple windows currently not supported, just refocus current window.
			this.focus();
			return;
		}

		const description = this._description;
		const binder = this._binder;

		if (binder && binder._hasBindings())
		{
			binder._bind(this);
		}

		const window = ui.openWindow(description);
		this._window = window;
		this._openWidgets = createWidgetMap(window.widgets);

		if (this._onOpen)
		{
			this._onOpen();
		}
	}

	close(): void
	{
		if (this._window)
		{
			this._window.close();
		}
		this._onClose();
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


/**
 * Recalculate the whole layout.
 */
function performLayout(template: Template, widgets: WidgetMap): void
{
	// Skip the top bar (15px)
	const area: Rectangle = { x: 0, y: topBarSize, width: template._width, height: template._height - topBarSize };
	if (template._padding)
	{
		setSizeWithPadding(area, defaultScale, defaultScale, template._padding);
	}
	if (template._body)
	{
		template._body.layout(widgets, area);
	}
}
