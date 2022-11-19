import { Bindable } from "@src/bindings/bindable";
import { WindowBinder } from "@src/building/binders/windowBinder";
import { FlexibleLayoutParams } from "@src/elements/layouts/flexible/flexible";
import { Paddable } from "@src/positional/paddable";
import { Padding } from "@src/positional/padding";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { Colour } from "@src/utilities/colour";
import { Event } from "@src/utilities/event";
import { identifier } from "@src/utilities/identifier";
import * as Log from "@src/utilities/logger";
import { isUndefined } from "@src/utilities/type";
import { FrameBuilder } from "./frames/frameBuilder";
import { FrameContext } from "./frames/frameContext";
import { TabCreator } from "./tabs/tabCreator";
import { TabLayoutable } from "./tabs/tabLayoutable";
import { Template } from "./template";
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


/**
 * The parameters for a regular window.
 */
export interface WindowParams extends BaseWindowParams, FlexibleLayoutParams
{
	/**
	 * The colours of the window.
	 *
	 * Usage:
	 *  1. Used for the window background.
	 *  2. Used for widget backgrounds.
	 */
	colours?: [Colour, Colour];
}


/**
 * The parameters for a window that uses tabs.
 * @todo
 */
export interface TabbedWindowParams extends BaseWindowParams
{
	/**
	 * The colours of the window.
	 *
	 * Usage:
	 *  1. Used for the window background at the top.
	 *  2. Used for the background of each tab.
	 *  3. Used for widget details and backgrounds.
	 */
	colours?: [Colour, Colour, Colour];

	/**
	 * Specify which tab the window should open on. Starts at 0.
	 * @default 0
	 */
	startingTab?: number;

	/**
	 * Specify the tabs that this window has.
	 */
	tabs: TabCreator[];

	/**
	 * Event that gets triggered when a new tab is selected.
	 */
	onTabChange?: () => void;
}


const defaultPadding: Padding = 5;
const defaultTabIcon = 16;


/**
 * Create a new flexiblely designed window.
 */
export function window(params: WindowParams | TabbedWindowParams): WindowTemplate
{
	Log.debug("window() started");
	const startTime = Log.time();
	const windowDesc: WindowDesc =
	{
		classification: `fui-${identifier()}`,
		title: "",
		colours: params.colours,
		width: params.width,
		height: params.height,
		minWidth: params.minWidth,
		minHeight: params.minHeight,
		maxWidth: params.maxWidth,
		maxHeight: params.maxHeight
	};

	const windowBinder = new WindowBinder();
	windowBinder.add(windowDesc, "title", params.title);

	const open: Event<FrameContext> = [];
	const update: Event<FrameContext> = [];
	const close: Event<FrameContext> = [];
	const output = new Template(windowDesc, (windowBinder._hasBindings()) ? windowBinder : null);

	if ("content" in params)
	{
		const builder = new FrameBuilder(params, open, update, close);
		output._rootFrame = builder.context;
		windowDesc.widgets = builder._widgets;
	}
	if ("tabs" in params)
	{
		const tabCreators = params.tabs;
		const tabCount = tabCreators.length;
		const tabList = Array<TabLayoutable>(tabCount);
		const tabDescs = Array<WindowTabDesc>(tabCount);

		for (let idx = 0; idx < tabCount; idx++)
		{
			const tabParams: WindowTabDesc = { image: defaultTabIcon };
			tabList[idx] = tabCreators[idx](tabParams);
			tabDescs[idx] = tabParams;
		}

		output._tabLayoutables = tabList;
		windowDesc.tabs = tabDescs;
		output._tabChange = params.onTabChange;
		windowDesc.onTabChange = (): void => output._tabChanged();
	}
	setWindowLayoutResizing(output, update, windowDesc);
	output._position = params.position;

	const suppliedPadding = params.padding;
	output._padding = parsePadding(isUndefined(suppliedPadding) ? defaultPadding : suppliedPadding);

	const { onOpen, onUpdate, onClose } = params;
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

	windowDesc.onUpdate = (): void =>
	{
		output._checkRedraw();
		output._forEachActiveFrame(f => f.update());
	};
	windowDesc.onClose = (): void =>
	{
		Log.debug(`Template.onClose() triggered`);
		output._window = null; // to prevent infinite close loop
		output.close();
	};

	Log.debug(`window() creation time: ${Log.time() - startTime} ms`);
	return output;
}


/**
 * Enables resizing the window by the user.
 */
function setWindowLayoutResizing(template: Template, update: Event, window: WindowDesc): void
{
	if (window.minWidth || window.minHeight || window.maxWidth || window.maxHeight)
	{
		const { width, height } = window;
		window.minWidth ||= width;
		window.maxWidth ||= width;
		window.minHeight ||= height;
		window.maxHeight ||= height;

		update.push((): void =>
		{
			const instance = ui.getWindow(template._description.classification);
			const { width, height } = instance;

			if (width === template._width && height === template._height)
				return;

			Log.debug(`User has resized the window from ${template._width}x${template._height} to ${width}x${height}.`);
			template._width = width;
			template._height = height;
			template._layout();
		});
	}
}