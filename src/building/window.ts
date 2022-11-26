import { FlexibleLayoutParams } from "@src/elements/layouts/flexible/flexible";
import { Colour } from "@src/utilities/colour";
import { Event } from "@src/utilities/event";
import * as Log from "@src/utilities/logger";
import { BaseWindowControl, BaseWindowParams } from "./baseWindowControl";
import { FrameBuilder } from "./frames/frameBuilder";
import { FrameContext } from "./frames/frameContext";
import { TabLayoutable } from "./tabs/tabLayoutable";
import { WindowTemplate } from "./windowTemplate";


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
 * Create a new flexiblely designed window.
 */
export function window(params: WindowParams): WindowTemplate
{
	Log.debug("window() started");
	const startTime = Log.time();

	const template = new WindowControl(params);

	Log.debug(`window() creation time: ${Log.time() - startTime} ms`);
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
		const open: Event<FrameContext> = [];
		const update: Event<FrameContext> = [];
		const close: Event<FrameContext> = [];
		super(params, update);

		const builder = new FrameBuilder(params, params, open, update, close);
		this._description.widgets = builder._widgets;
		this._frame = builder.context;
	}

	protected _invoke(callback: (frame: TabLayoutable) => void): void
	{
		callback(this._frame);
	}

	_layout(): void
	{
		const area = this._getWindowWidgetRectangle();
		this._frame.layout(area);
	}
}