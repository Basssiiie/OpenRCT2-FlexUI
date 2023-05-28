import { Bindable } from "@src/bindings/bindable";
import { defaultScale } from "@src/elements/constants";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { hasPadding, setSizeWithPadding } from "@src/elements/layouts/paddingHelpers";
import { Paddable } from "@src/positional/paddable";
import { Padding } from "@src/positional/padding";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { Rectangle } from "@src/positional/rectangle";
import { identifier } from "@src/utilities/identifier";
import * as Log from "@src/utilities/logger";
import { isUndefined } from "@src/utilities/type";
import { WindowBinder } from "./binders/windowBinder";
import { ParentWindow } from "./parentWindow";
import { TabLayoutable } from "./tabs/tabLayoutable";
import { createWidgetMap } from "./widgets/widgetMap";
import { setAxisSizeIfNumber } from "./windowHelpers";
import { WindowScale } from "./windowScale";
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


export const defaultTopBarSize: number = 15;
const defaultPadding: Padding = 5;

type ExtendedWindowParams = BaseWindowParams & { colours?: number[] };
type WindowScaleOptions = BaseWindowParams["width" | "height"];
type WindowPosition = BaseWindowParams["position"];


/**
 * A base window control for shared functionality between different window types.
 */
export abstract class BaseWindowControl implements WindowTemplate, ParentWindow
{
	readonly width: WindowScaleOptions;
	readonly height: WindowScaleOptions;

	readonly _description: WindowDesc;
	private readonly _windowBinder: WindowBinder | null;
	private readonly _position?: WindowPosition;
	protected readonly _padding: ParsedPadding;

	_window: Window | null = null;
	private _redrawNextTick: boolean = false;
	private _actualWidth: number | undefined;
	private _actualHeight: number | undefined;

	constructor(params: ExtendedWindowParams)
	{
		const { width, height, padding, position } = params;
		const windowBinder = new WindowBinder();

		const windowDesc = <WindowDesc>{
			classification: ("fui-" + identifier()),
			title: "",
			width: 0,
			height: 0,
			colours: params.colours,
			onUpdate: (): void =>
			{
				this._checkResizeAndRedraw();
				this._invoke(frame => frame.update());
			},
			onClose: (): void =>
			{
				Log.debug("Template.onClose() triggered");
				this._window = null; // to prevent infinite close loop
				this.close();
			}
		};
		setAxisSizeIfNumber(windowDesc, LayoutDirection.Horizontal, width);
		setAxisSizeIfNumber(windowDesc, LayoutDirection.Vertical, height);
		setWindowPosition(windowDesc, position);

		windowBinder.add(windowDesc, "title", params.title);
		this._windowBinder = (windowBinder._hasBindings()) ? windowBinder : null;

		this.width = width;
		this.height = height;
		this._padding = parsePadding(isUndefined(padding) ? defaultPadding : padding);
		this._position = position;
		this._description = windowDesc;
	}

	/**
	 * Checks if the template has been marked dirty, and redraws if that's the case.
	 */
	private _checkResizeAndRedraw(): void
	{
		const window = this._window;
		if (!window)
		{
			return;
		}

		const { width, height } = window;
		if (!this._redrawNextTick)
		{
			if (width === this._actualWidth && height === this._actualHeight)
			{
				return; // nothing has changed, do nothing
			}
			Log.debug("Template.checkResizeAndRedraw() user has resized the window from", this._actualWidth, "x", this._actualHeight, "to", width, "x", height);
		}

		const startTime = Log.time();
		Log.debug("Template.checkResizeAndRedraw() window size: (", width, "x", height, ")...");

		this._layout(window, width, height);
		this._redrawNextTick = false;
		this._actualWidth = width;
		this._actualHeight = height;

		Log.debug("Template.checkResizeAndRedraw() finished in", (Log.time() - startTime), "ms");
	}

	/**
	 * Creates a new rectangle area for use in layouting child widgets.
	 */
	protected _createFrameRectangle(width: number, height: number, extraTopPadding = defaultTopBarSize): Rectangle
	{
		const padding = this._padding;
		const area: Rectangle = {
			x: 0,
			y: extraTopPadding,
			width: (width - 1),
			height: (height - (extraTopPadding + 1))
		};
		if (hasPadding(padding))
		{
			setSizeWithPadding(area, defaultScale, defaultScale, padding);
		}
		return area;
	}

	abstract _layout(window: Window, width: number, height: number): void;

	protected abstract _invoke(callback: (frame: TabLayoutable) => void): void;

	redraw(): void
	{
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
		const binder = this._windowBinder;
		setWindowPosition(description, this._position);
		if (binder)
		{
			binder._bind(this);
		}

		const window = ui.openWindow(description);
		const activeWidgets = createWidgetMap(window.widgets);

		this._window = window;
		this._invoke(frame => frame.open(activeWidgets));
		this._layout(window, description.width, description.height);
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