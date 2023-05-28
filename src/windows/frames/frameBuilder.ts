import { FlexibleLayoutControl } from "@src/elements/layouts/flexible/flexible";
import { Padding } from "@src/positional/padding";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { Event } from "@src/utilities/event";
import { WidgetBinder } from "../binders/widgetBinder";
import { BuildOutput } from "../buildOutput";
import { FrameContext } from "./frameContext";
import { FrameControl } from "./frameControl";
import { FrameEvent } from "./frameEvent";
import { FrameContentParams, FrameEventParams } from "./frameParams";
import { inheritKey } from "../windowHelpers";
import { ParentWindow } from "../parentWindow";


/**
 * Object that holds components required to build a final frame, such as a tab or a window.
 */
export class FrameBuilder implements BuildOutput
{
	readonly binder: WidgetBinder;
	readonly _widgets: WidgetDesc[] = [];

	context: FrameControl;

	constructor(
		parent: ParentWindow,
		params: FrameEventParams,
		content: FrameContentParams,
		padding: Padding | undefined,
		readonly open: Event<FrameContext> = [],
		readonly update: Event<FrameContext> = [],
		readonly redraw: Event<FrameContext> = [],
		readonly close: Event<FrameContext> = []
	){
		const parsedPadding = parsePadding(padding);
		const context = new FrameControl(parent, content.width || inheritKey, content.height || inheritKey, parsedPadding, open, update, redraw, close);
		const binder = new WidgetBinder();
		const { onOpen, onUpdate, onClose } = params;

		this.binder = binder;
		this.context = context;
		context._body = new FlexibleLayoutControl(context, this, content);
		context._binder = (binder._hasBindings()) ? binder : null;

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
	}

	add(widget: WidgetDesc): void
	{
		this._widgets.push(widget);
	}

	on(event: FrameEvent, callback: (context: FrameContext) => void): void
	{
		this[event].push(callback);
	}
}