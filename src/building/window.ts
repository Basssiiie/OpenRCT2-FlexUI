import { Bindable } from "@src/bindings/bindable";
import { FlexibleLayoutControl, FlexibleLayoutParams } from "@src/elements/layouts/flexible/flexible";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Paddable } from "@src/positional/paddable";
import { Padding } from "@src/positional/padding";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { Colour } from "@src/utilities/colour";
import { invoke } from "@src/utilities/event";
import { identifier } from "@src/utilities/identifier";
import { isUndefined } from "@src/utilities/type";
import { BuildContainer } from "./buildContainer";
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
	 */
	startingTab?: number;

	/**
	 * Specify the tabs that this window has.
	 * @todo
	 */
	tabs: FlexibleLayoutParams;
}


const defaultPadding: Padding = 5;


/**
 * Create a new flexiblely designed window.
 */
export function window(params: WindowParams | TabbedWindowParams): WindowTemplate
{
	const window: WindowDesc =
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

	const output = new BuildContainer(window);
	output._windowBinder.add(window, "title", params.title);

	if ("content" in params)
	{
		createWindowLayout(output, window, params);
	}
	/*else if ("tabs" in params)
	{

	}*/

	const { open, update, close } = output;

	if (params.onOpen)
	{
		open.push(params.onOpen);
	}
	if (params.onUpdate)
	{
		update.push(params.onUpdate);
	}
	if (params.onClose)
	{
		close.push(params.onClose);
	}

	const template = output._template;
	template._position = params.position;

	update.push(() => template._onRedraw());
	close.push(() => template._onClose());
	template._build();

	if (open.length > 0)
	{
		template._onOpen = (): void => invoke(open, template);
	}
	window.onUpdate = (): void => invoke(update, template);
	window.onClose = (): void => invoke(close, template);

	return template;
}


/**
 * Create a regular window layout.
 */
function createWindowLayout(output: BuildContainer, window: WindowDesc, params: WindowParams): void
{
	const template = output._template;
	template._body = new FlexibleLayoutControl(output, params, LayoutDirection.Vertical);

	// Check if padding was specified..
	const suppliedPadding = params.padding;
	template._padding = parsePadding((!isUndefined(suppliedPadding)) ? suppliedPadding : defaultPadding);

	window.widgets = output._widgets;

	if (window.minWidth || window.minHeight || window.maxWidth || window.maxHeight)
	{
		const { width, height } = window;
		window.minWidth ||= width;
		window.maxWidth ||= width;
		window.minHeight ||= height;
		window.maxHeight ||= height;

		setWindowLayoutResizing(output);
	}
}


/**
 * Enables resizing the window by the user.
 */
function setWindowLayoutResizing(output: BuildContainer): void
{
	const template = output._template;
	output.update.push((): void =>
	{
		const instance = ui.getWindow(template._description.classification);
		const { width, height } = instance;

		if (width === template._width && height === template._height)
			return;

		template._width = width;
		template._height = height;
		template.redraw();
	});
}