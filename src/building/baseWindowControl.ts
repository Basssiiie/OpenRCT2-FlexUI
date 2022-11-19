import { Bindable } from "@src/bindings/bindable";
import { defaultScale } from "@src/elements/constants";
import { setSizeWithPadding } from "@src/elements/layouts/paddingHelpers";
import { Paddable } from "@src/positional/paddable";
import { Padding } from "@src/positional/padding";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { Rectangle } from "@src/positional/rectangle";
import { Event } from "@src/utilities/event";
import { identifier } from "@src/utilities/identifier";
import * as Log from "@src/utilities/logger";
import { isUndefined } from "@src/utilities/type";
import { WindowBinder } from "./binders/windowBinder";
import { FrameContext } from "./frames/frameContext";
import { TabLayoutable } from "./tabs/tabLayoutable";
import { createWidgetMap } from "./widgets/widgetMap";
import { WindowTemplate } from "./windowTemplate";


/**
 * Parameters that apply to both the regular and tabbed window.
 */
export interface BaseWindowParams extends Paddable
{
	/**
	 * The title at the top of the window.
	 */
	title?: Bindable<string>;

	/**
	 * The initial width of the window in pixels.
	 */
	width: number;

	/**
	 * The initial height of the window in pixels.
	 */
	height: number;

	/**
	 * The initial starting position of the window in pixels.
	 *
	 * **Example usage:**
	 *  * `position: "default"` - the game finds the most suitable location on screen for you.
	 *  * `position: "center"` - the window will always open in the center of the screen.
	 *  * `position: { x, y }` - the window will always open at the specified screen location.
	 * @default "default"
	 */
	position?: "default" | "center" | { x: number; y: number };

	/**
	 * The absolute minimum width the window can be resized to. If set, the
	 * window will be rescalable by the user.
	 * @default this.width
	 */
	minWidth?: number;

	/**
	 * The absolute minimum height the window can be resized to. If set, the
	 * window will be rescalable by the user.
	 * @default this.height
	 */
	minHeight?: number;

	/**
	 * The absolute maximum width the window can be resized to. If set, the
	 * window will be rescalable by the user.
	 * @default this.width
	 */
	maxWidth?: number;

	/**
	 * The absolute maximum height the window can be resized to. If set, the
	 * window will be rescalable by the user.
	 * @default this.height
	 */
	maxHeight?: number;

	/**
	 * Event that gets triggered when the window is opened.
	 */
	onOpen?: () => void;

	/**
	 * Event that gets triggered for every tick the window is open.
	 */
	onUpdate?: () => void;

	/**
	 * Event that gets triggered when the window gets closed by either the
	 * user or a plugin.
	 */
	onClose?: () => void;
}


const defaultTopBarSize: number = 15;
const defaultPadding: Padding = 5;

type ExtendedWindowParams = BaseWindowParams & { colours?: number[] };
type WindowPosition = BaseWindowParams["position"];


/**
 * A base window control for shared functionality between different window types.
 */
export abstract class BaseWindowControl implements WindowTemplate
{
	readonly _description: WindowDesc;
	private readonly _windowBinder: WindowBinder | null;

	_window: Window | null = null;
	_width: number;
	_height: number;
	private _padding?: ParsedPadding;
	private _position?: WindowPosition;
	private _redrawNextTick: boolean = false;

	constructor(
		params: ExtendedWindowParams,
		open: Event<FrameContext>,
		update: Event<FrameContext>,
		close: Event<FrameContext>
	){
		const { width, height, minWidth, maxWidth, minHeight, maxHeight, padding, onOpen, onUpdate, onClose } = params;
		const windowDesc: WindowDesc =
		{
			classification: `fui-${identifier()}`,
			title: "",
			colours: params.colours,
			width: width,
			height: height,
			minWidth: minWidth,
			minHeight: minHeight,
			maxWidth: maxWidth,
			maxHeight: maxHeight,
			onUpdate: (): void =>
			{
				this._checkRedraw();
				this._invoke(frame => frame.update());
			},
			onClose: (): void =>
			{
				Log.debug(`Template.onClose() triggered`);
				this._window = null; // to prevent infinite close loop
				this.close();
			}
		};
		this._description = windowDesc;
		this._width = width;
		this._height = height;
		this._position = params.position;
		this._padding = parsePadding(isUndefined(padding) ? defaultPadding : padding);

		if (minWidth || minHeight || maxWidth || maxHeight)
		{
			setWindowLayoutResizing(this, windowDesc, update, width, height);
		}
		if (onOpen)
		{
			open.push(onOpen);
		}
		if (onUpdate)
		{
			update.push(onUpdate);
		}
		if (onClose)
		{
			close.push(onClose);
		}

		const windowBinder = new WindowBinder();
		windowBinder.add(windowDesc, "title", params.title);
		this._windowBinder = (windowBinder._hasBindings()) ? windowBinder : null;
	}

	/**
	 * Checks if the template has been marked dirty, and redraws if that's the case.
	 */
	private _checkRedraw(): void
	{
		if (!this._window || !this._redrawNextTick)
			return;

		const startTime = Log.time();
		Log.debug(`Template.onRedraw() window size: (${this._window?.width} x ${this._window?.height})...`);

		this._layout();
		this._redrawNextTick = false;

		Log.debug(`Template.onRedraw() finished in ${Log.time() - startTime} ms`);
	}

	/**
	 * Creates a new rectangle area for use in layouting child widgets.
	 * @param topBarSize The size at the top that should be skipped.
	 */
	protected _getWindowWidgetRectangle(topBarSize: number = defaultTopBarSize): Rectangle
	{
		const padding = this._padding;
		const area: Rectangle = { x: 0, y: topBarSize, width: this._width - 1, height: this._height - (topBarSize + 1) };
		if (padding)
		{
			setSizeWithPadding(area, defaultScale, defaultScale, padding);
		}
		return area;
	}

	protected abstract _invoke(callback: (frame: TabLayoutable) => void): void;

	abstract _layout(): void;

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
		this._invoke(frame => frame.open(activeWidgets));
		this._layout();
	}

	close(): void
	{
		this._invoke(frame => frame.close());
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
 * Enables resizing the window by the user.
 */
function setWindowLayoutResizing(control: BaseWindowControl, window: WindowDesc, update: Event, width: number, height: number): void
{
	window.minWidth ||= width;
	window.maxWidth ||= width;
	window.minHeight ||= height;
	window.maxHeight ||= height;

	update.push((): void =>
	{
		const instance = ui.getWindow(control._description.classification);
		const { width, height } = instance;

		if (width === control._width && height === control._height)
			return;

		Log.debug(`User has resized the window from ${control._width}x${control._height} to ${width}x${height}.`);
		control._width = width;
		control._height = height;
		control._layout();
	});
}


/**
 * Updates the x and y of the window description to match the preferred position.
 */
function setWindowPosition(control: BaseWindowControl, window: WindowDesc, position: WindowPosition): void
{
	if (!position || position === "default")
		return;

	if (position === "center")
	{
		window.x = (ui.width / 2) - (control._width / 2);
		window.y = (ui.height / 2) - (control._height / 2);
		return;
	}

	window.x = position.x;
	window.y = position.y;
}