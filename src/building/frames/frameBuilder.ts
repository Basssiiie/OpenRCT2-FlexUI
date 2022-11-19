import { Event } from "@src/utilities/event";
import { WidgetBinder } from "../binders/widgetBinder";
import { BuildOutput } from "../buildOutput";
import { FrameContext } from "./frameContext";
import { FrameEvent } from "./frameEvent";
import { FrameParams } from "./frameParams";
import { FrameControl } from "./frameControl";
import { FlexibleLayoutControl } from "@src/elements/layouts/flexible/flexible";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";


/**
 * Object that holds components required to build a final frame, such as a tab or a window.
 */
export class FrameBuilder implements BuildOutput
{
	readonly binder: WidgetBinder = new WidgetBinder();
	readonly _widgets: WidgetBase[] = [];

	context: FrameControl;

	constructor(
		params: FrameParams,
		readonly open: Event<FrameContext>,
		readonly update: Event<FrameContext>,
		readonly close: Event<FrameContext>
	){
		const context = new FrameControl(open, update, close);
		this.context = context;

		context._body = new FlexibleLayoutControl(context, this, params, LayoutDirection.Vertical);

		const binder = this.binder;
		context._binder = (binder._hasBindings()) ? binder : null;
	}

	add(widget: WidgetBase): void
	{
		this._widgets.push(widget);
	}

	on(event: FrameEvent, callback: (context: FrameContext) => void): void
	{
		this[event].push(callback);
	}
}