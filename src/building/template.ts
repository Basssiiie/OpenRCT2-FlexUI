import { WindowBinder } from "@src/building/binders/windowBinder";
import * as Log from "@src/utilities/logger";
import { defaultScale } from "../elements/constants";
import { setSizeWithPadding } from "../elements/layouts/paddingHelpers";
import { ParsedPadding } from "../positional/parsing/parsedPadding";
import { Rectangle } from "../positional/rectangle";
import { FrameControl } from "./frames/frameControl";
import { TabLayoutable } from "./tabs/tabLayoutable";
import { createWidgetMap } from "./widgets/widgetMap";
import { BaseWindowParams } from "./window";
import { WindowTemplate } from "./windowTemplate";


type WindowPosition = BaseWindowParams["position"];


/**
 * Internal template that keeps track of the window.
 */
export class Template implements WindowTemplate
{
	_window: Window | null = null;
	_width: number;
	_height: number;
	_padding: ParsedPadding | null = null;
	_topBarSize: number = 15;
	_position?: WindowPosition;

	_rootFrame: FrameControl | null = null;
	_tabLayoutables: TabLayoutable[] = [];
	_selectedTab: number = 0;
	_redrawNextTick: boolean = false;

	_tabChange?: () => void;


	constructor(
		readonly _description: WindowDesc,
		readonly _windowBinder: WindowBinder | null)
	{
		this._width = _description.width;
		this._height = _description.height;
	}

	/**
	 * Recalculate the whole layout.
	 */
	_layout(): void
	{
		const topbar = this._topBarSize, padding = this._padding;
		const area: Rectangle = { x: 0, y: topbar, width: this._width - 1, height: this._height - (topbar + 1) };
		if (padding)
		{
			setSizeWithPadding(area, defaultScale, defaultScale, padding);
		}

		this._forEachActiveFrame(f => f.layout(area));
	}

	/**
	 * Checks if the template has been marked dirty, and redraws if that's the case.
	 */
	_checkRedraw(): void
	{
		if (!this._window || !this._redrawNextTick)
			return;

		const startTime = Log.time();
		Log.debug(`Template.onRedraw() window size: (${this._window?.width} x ${this._window?.height})...`);

		this._layout();
		this._redrawNextTick = false;

		Log.debug(`Template.onRedraw() finished in ${Log.time() - startTime} ms`);
	}

	_tabChanged(): void
	{
		const window = this._window;
		if (!window)
			return;

		this._forActiveTab(f => f.close());

		const newWidgets = createWidgetMap(window.widgets);
		Log.debug(`Template.tabChanged() from ${this._selectedTab} to ${window.tabIndex}`);
		this._selectedTab = window.tabIndex;

		this._forActiveTab(f => f.open(newWidgets));
		this._layout();

		const onTabChange = this._tabChange;
		if (onTabChange)
		{
			onTabChange();
		}
	}

	_forEachActiveFrame(callback: (frame: TabLayoutable) => void): void
	{
		const root = this._rootFrame;
		if (root)
		{
			callback(root);
		}
		this._forActiveTab(callback);
	}

	_forActiveTab(callback: (frame: TabLayoutable) => void): void
	{
		const tabs = this._tabLayoutables;
		if (tabs)
		{
			const selectedTab = tabs[this._selectedTab];
			if (selectedTab)
			{
				callback(selectedTab);
			}
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
		setWindowPosition(this, description, this._position);

		const binder = this._windowBinder;
		if (binder)
		{
			binder._bind(this);
		}

		const window = ui.openWindow(description);
		const activeWidgets = createWidgetMap(window.widgets);

		this._window = window;
		this._forEachActiveFrame(f => f.open(activeWidgets));
		this._layout();
	}

	close(): void
	{
		this._forEachActiveFrame(f => f.close());
		if (this._window)
		{
			this._window.close();
		}
		const binder = this._windowBinder;
		if (binder)
		{
			binder._unbind();
		}
		this._window = null;
	}

	focus(): void
	{
		if (this._window)
		{
			this._window.bringToFront();
		}
	}
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