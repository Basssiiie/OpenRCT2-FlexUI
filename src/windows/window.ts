import { FlexibleDirectionalLayoutParams } from "@src/elements/layouts/flexible/flexible";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Colour } from "@src/utilities/colour";
import * as Log from "@src/utilities/logger";
import { BaseWindowControl, BaseWindowParams } from "./baseWindowControl";
import { FrameBuilder } from "./frames/frameBuilder";
import { TabLayoutable } from "./tabs/tabLayoutable";
import { setAxisSizeIfAuto } from "./windowHelpers";
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
 */
export function window(params: WindowParams): WindowTemplate
{
	Log.debug("window() started");
	const startTime = Log.time();

	const template = new WindowControl(params);

	Log.debug("window() creation time:", (Log.time() - startTime), "ms");
	return template;
}


/**
 * A window control for simple windows without tabs.
 */
class WindowControl extends BaseWindowControl
{
	private _frame: TabLayoutable;

	constructor(params: WindowParams)
	{
		super(params);

		const builder = new FrameBuilder(this, params, params, undefined);
		this._description.widgets = builder._widgets;
		this._frame =  builder.context;
	}

	protected override _invoke(callback: (frame: TabLayoutable) => void): void
	{
		callback(this._frame);
	}

	override _layout(window: Window, width: number, height: number): void
	{
		const area = this._createFrameRectangle(width, height);
		const size = this._frame.layout(area);

		setAxisSizeIfAuto(window, LayoutDirection.Horizontal, this.width, size);
		setAxisSizeIfAuto(window, LayoutDirection.Vertical, this.height, size);
	}
}