import { defaultWindowPadding, zeroPadding } from "@src/elements/constants";
import { FlexibleDirectionalLayoutParams } from "@src/elements/layouts/flexible/flexible";
import { Colour } from "@src/utilities/colour";
import * as Log from "@src/utilities/logger";
import { isUndefined } from "@src/utilities/type";
import { BaseWindowControl, BaseWindowParams, defaultTopBarSize } from "./baseWindowControl";
import { FrameBuilder } from "./frames/frameBuilder";
import { FrameControl } from "./frames/frameControl";
import { TabLayoutable } from "./tabs/tabLayoutable";
import { Template } from "./template";
import { WidgetMap, addToWidgetMap } from "./widgets/widgetMap";
import { WindowTemplate } from "./windowTemplate";


/**
 * The parameters for a regular window.
 */
export interface WindowParams extends BaseWindowParams, FlexibleDirectionalLayoutParams
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
 * Create a new flexiblely designed window.
 *
 * @example
 * const template = window({ title: "Hello world!" })
 *
 * template.open()
 */
export function window(params: WindowParams): WindowTemplate;
/**
 * Create a new flexiblely designed window with a viewmodel. An arrow function can be used to create windows to fit a specific viewmodel.
 *
 * @example
 * class MyModel
 * {
 *     header: store("Hello world!")
 * }
 *
 * const template = window<MyModel>(model =>
 * ({
 *     title: model.header
 * }))
 *
 * template.open(new MyModel())
 */
export function window<TModel extends object>(params: (model: TModel) => WindowParams): WindowTemplate<TModel>;
export function window<T>(params: ((model: T) => WindowParams) | WindowParams): WindowTemplate<T>
{
	Log.debug("window() started");
	const startTime = Log.time();

	const template = new Template(WindowControl, params);

	Log.debug("window() creation time:", (Log.time() - startTime), "ms");
	return template;
}


/**
 * A window control for simple windows without tabs.
 */
class WindowControl extends BaseWindowControl
{
	private _frame: FrameControl;
	protected override _descriptionWidgetMap: WidgetMap;


	constructor(params: WindowParams)
	{
		if (isUndefined(params.padding))
		{
			params.padding = defaultWindowPadding;
		}

		super(params);

		const builder = new FrameBuilder(this, params, params);
		const widgets = builder._widgets;
		this._description.widgets = widgets;
		this._descriptionWidgetMap = addToWidgetMap(widgets);
		this._frame =  builder.context;
	}

	protected override _invoke(callback: (frame: TabLayoutable) => void): void
	{
		callback(this._frame);
	}

	override _layout(window: Window | WindowDesc, widgets: WidgetMap): void
	{
		const area = this._createFrameRectangle(this._flags, defaultTopBarSize);
		const size = this._frame.layout(area, widgets);

		this._setAutoWindowSize(window, size, defaultTopBarSize, zeroPadding);
	}
}
