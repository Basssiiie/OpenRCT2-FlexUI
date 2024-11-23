import { Bindable } from "@src/bindings/bindable";
import { Axis } from "@src/positional/axis";
import { Paddable } from "@src/positional/paddable";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { Size } from "@src/positional/size";
import { identifier } from "@src/utilities/identifier";
import * as Log from "@src/utilities/logger";
import { WindowBinder } from "./binders/windowBinder";
import { FrameRectangle } from "./frames/frameRectangle";
import { OpenWindow } from "./openWindow";
import { ParentWindow } from "./parentWindow";
import { TabLayoutable } from "./tabs/tabLayoutable";
import { WidgetMap, addToWidgetMap } from "./widgets/widgetMap";
import { autoKey, setAxisSizeIfAuto, setAxisSizeIfNumber } from "./windowHelpers";
import { WindowScale } from "./windowScale";


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
	 * The initial width of the window in pixels, or `"auto"` to fit it to the child's
	 * frame if all children are absolute sized.
	 */
	width: number | WindowScale | "auto";

	/**
	 * The initial height of the window in pixels, or `"auto"` to fit it to the child's
	 * frame if all children are absolute sized.
	 */
	height: number | WindowScale | "auto";

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
	 * Event that gets triggered when the window is opened.
	 */
	onOpen?: () => void;

	/**
	 * Event that gets triggered for every tick the window is open.
	 */
	onUpdate?: () => void;

	/**
	 * Event that gets triggered when the window gets closed by either the user or a plugin.
	 */
	onClose?: () => void;
}


export const defaultTopBarSize = 15;
export const enum WindowFlags
{
	None = 0,
	// Order of axis matches LayoutDirection's order.
	AutoHeight = (1 << 0),
	AutoWidth = (1 << 1),
	RedrawNextTick = (1 << 2),

	Count = (1 << 3)
}

type ExtendedWindowParams = BaseWindowParams & { colours?: number[] };
type WindowPosition = BaseWindowParams["position"];


/**
 * A base window control for shared functionality between different window types.
 */
export abstract class BaseWindowControl implements OpenWindow, ParentWindow
{
	readonly _description: WindowDesc;
	protected abstract _descriptionWidgetMap: WidgetMap;

	_window?: Window | null;
	private readonly _position?: WindowPosition;
	private readonly _windowBinder: WindowBinder | null;

	protected _activeWidgetMap?: WidgetMap | null;
	protected _width!: number;
	protected _height!: number;
	protected _flags!: WindowFlags;

	constructor(params: ExtendedWindowParams)
	{
		const { width, height, position } = params;
		const windowBinder = new WindowBinder();

		const windowDesc = <WindowDesc>{
			classification: ("fui-" + identifier()),
			title: "",
			colours: params.colours,
			onUpdate: (): void =>
			{
				this._checkResizeAndRedraw();
				this._invoke(frame => frame.update());
			},
			onClose: (): void =>
			{
				Log.debug("BaseWindow.onClose() triggered");
				this._close();
			}
		};
		const windowWidth = setAxisSizeIfNumber(windowDesc, Axis.Horizontal, width);
		const windowHeight = setAxisSizeIfNumber(windowDesc, Axis.Vertical, height);
		this._setWindowSizeAndFlags(windowWidth, windowHeight);

		windowBinder.add(windowDesc, "title", params.title);
		this._windowBinder = (windowBinder._hasBindings()) ? windowBinder : null;
		this._position = position;
		this._description = windowDesc;
	}

	abstract _layout(window: Window | WindowDesc, widgets: WidgetMap): void;

	protected abstract _invoke(callback: (frame: TabLayoutable) => void): void;

	/**
	 * Checks if the template has been marked dirty, and redraws if that's the case.
	 */
	private _checkResizeAndRedraw(): void
	{
		const window = this._window;
		const activeWidgets = this._activeWidgetMap;
		const flags = this._flags;

		if (!window || !activeWidgets)
		{
			return;
		}
		if (!(flags & WindowFlags.RedrawNextTick))
		{
			const newWidth = window.width;
			const newHeight = window.height;
			const widthSame = (flags & WindowFlags.AutoWidth || this._width == newWidth);
			const heightSame =  (flags & WindowFlags.AutoHeight || this._height == newHeight);
			if (widthSame && heightSame)
			{
				return; // nothing has changed, do nothing
			}

			Log.debug("BaseWindow.checkResizeAndRedraw() user has resized the window from", this._width, "x", this._height, "to", newWidth, "x", newHeight);
			this._width = newWidth;
			this._height = newHeight;
		}

		const startTime = Log.time();
		this._layout(window, activeWidgets);
		this._flags &= ~WindowFlags.RedrawNextTick;

		Log.debug("BaseWindow.checkResizeAndRedraw() finished in", (Log.time() - startTime), "ms");
	}

	/**
	 * Creates a new rectangle area for use in layouting child widgets.
	 */
	protected _createFrameRectangle(flags: WindowFlags, extraTopPadding: number): FrameRectangle
	{
		return {
			x: 0,
			y: extraTopPadding,
			width: (flags & WindowFlags.AutoWidth) ? autoKey : this._width,
			height: (flags & WindowFlags.AutoHeight) ? autoKey : (this._height - extraTopPadding)
		};
	}

	/**
	 * Sets the window to the correct width and height when the size is auto-calculated from the frame size.
	 */
	protected _setAutoWindowSize(window: Window | WindowDesc, frameSize: Size, topBarSize: number, padding: ParsedPadding): void
	{
		const flags = this._flags;
		if (flags & WindowFlags.AutoWidth)
		{
			this._width = setAxisSizeIfAuto(window, Axis.Horizontal, frameSize, padding, 0);
		}
		if (flags & WindowFlags.AutoHeight)
		{
			this._height = setAxisSizeIfAuto(window, Axis.Vertical, frameSize, padding, topBarSize);
		}
		Log.debug("BaseWindow.setAutoWindowSize() to", this._width, "x", this._height, ", from size:", Log.stringify(frameSize), ", padding:", Log.stringify(padding), ", flags:", flags);
	}

	protected _setWindowSizeAndFlags(width: number | "auto", height: number | "auto"): void
	{
		let flags = this._flags;
		if (width == autoKey)
		{
			flags |= WindowFlags.AutoWidth;
		}
		else
		{
			flags &= ~WindowFlags.AutoWidth;
			this._width = width;
		}
		if (height == autoKey)
		{
			flags |= WindowFlags.AutoHeight;
		}
		else
		{
			flags &= ~WindowFlags.AutoHeight;
			this._height = height;
		}
		this._flags = flags;
	}

	_open(): void
	{
		Log.debug("BaseWindowControl.open()");
		const description = this._description;
		const binder = this._windowBinder;

		this._layout(description, this._descriptionWidgetMap);
		setWindowPosition(description, this._position);

		if (binder)
		{
			binder._bind(this);
		}

		const window = ui.openWindow(description);
		const activeWidgets = addToWidgetMap(window.widgets);

		this._window = window;
		this._activeWidgetMap = activeWidgets;
		this._invoke(frame => frame.open(window, activeWidgets));
	}

	protected _close(): void
	{
		Log.debug("BaseWindowControl.close()");
		this._invoke(frame => frame.close());

		const binder = this._windowBinder;
		if (binder)
		{
			binder._unbind();
		}
		this._window = null;
		this._activeWidgetMap = null;
	}

	isOpen(): boolean
	{
		return !!this._window;
	}

	close(): void
	{
		if (this._window)
		{
			// This triggers the onClose event, which will then close and clean up everything.
			this._window.close();
		}
	}

	focus(): void
	{
		if (this._window)
		{
			this._window.bringToFront();
		}
	}

	redraw(): void
	{
		this._flags |= WindowFlags.RedrawNextTick;
	}
}


/**
 * Updates the x and y of the window description to match the preferred position.
 */
function setWindowPosition(window: WindowDesc, position: WindowPosition): void
{
	if (!position || position === "default")
		return;

	if (position === "center")
	{
		window.x = (ui.width / 2) - (window.width / 2);
		window.y = (ui.height / 2) - (window.height / 2);
		return;
	}

	window.x = position.x;
	window.y = position.y;
}
