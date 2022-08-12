import { WindowBinder } from "@src/building/binders/windowBinder";
import { FlexibleLayoutControl } from "@src/elements/layouts/flexible/flexible";
import { parseFlexiblePosition } from "@src/elements/layouts/flexible/parseFlexiblePosition";
import * as Log from "@src/utilities/logger";
import { FlexiblePosition } from "..";
import { defaultScale } from "../elements/constants";
import { setSizeWithPadding } from "../elements/layouts/paddingHelpers";
import { ParsedPadding } from "../positional/parsing/parsedPadding";
import { Rectangle } from "../positional/rectangle";
import { ParentControl } from "./parentControl";
import { WidgetEditor } from "./widgetEditor";
import { createWidgetMap, WidgetMap } from "./widgetMap";
import { BaseWindowParams } from "./window";
import { WindowContext } from "./windowContext";
import { WindowTemplate } from "./windowTemplate";


type WindowPosition = BaseWindowParams["position"];


const topBarSize: number = 15;


/**
 * Internal template that keeps track of the window.
 */
export class Template implements WindowTemplate, WindowContext, ParentControl<FlexiblePosition>
{
	parse = parseFlexiblePosition;
	recalculate = this.redraw;

	_window: Window | null = null;
	_body: FlexibleLayoutControl | null = null;

	_width: number;
	_height: number;
	_padding: ParsedPadding | null = null;
	_position?: WindowPosition;

	_templateWidgets: WidgetMap | null = null;
	_openWidgets: WidgetMap | null = null;
	_redrawNextTick: boolean = true;


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
		Log.debug("Template: build() started");
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
	{
		const widgets = this._openWidgets;
		if (!widgets || !this._redrawNextTick)
			return;

		Log.debug(`Template.onRedraw() window size: (${this._window?.width} x ${this._window?.height})...`);
		performLayout(this, widgets);
		this._redrawNextTick = false;
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
		if (!this._openWidgets)
			return;

		this._redrawNextTick = true;
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
		setWindowPosition(this, description, this._position);

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
	const body = template._body;
	if (!body || body.skip)
		return;

	// Skip the top bar (15px)
	const area: Rectangle = { x: 0, y: topBarSize, width: template._width - 1, height: template._height - (topBarSize + 1) };
	if (template._padding)
	{
		setSizeWithPadding(area, defaultScale, defaultScale, template._padding);
	}

	body._recalculateSizeFromChildren();
	body.layout(widgets, area);
}


/**
 * Updates the x and y of the window description to match the preferred position.
 */
function setWindowPosition(template: Template, description: WindowDesc, position: WindowPosition): void
{
	if (!position || position === "default")
		return;

	if (position === "center")
	{
		description.x = (ui.width / 2) - (template._width / 2);
		description.y = (ui.height / 2) - (template._height / 2);
		return;
	}

	description.x = position.x;
	description.y = position.y;
}
