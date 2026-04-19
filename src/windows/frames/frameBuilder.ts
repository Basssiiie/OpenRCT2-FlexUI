import { FlexibleLayoutControl } from "@src/elements/layouts/flexible/flexible";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { Event } from "@src/utilities/event";
import { isString } from "@src/utilities/type";
import { WidgetBinder } from "../binders/widgetBinder";
import { BuildOutput } from "../buildOutput";
import { ParentWindow } from "../parentWindow";
import { inheritKey } from "../windowHelpers";
import { WindowScale } from "../windowScale";
import { FrameContext } from "./frameContext";
import { FrameControl } from "./frameControl";
import { FrameEvent } from "./frameEvent";
import { FrameContentParams, FrameEventParams } from "./frameParams";


/**
 * Object that holds components required to build a final frame, such as a tab or a window.
 */
export class FrameBuilder implements BuildOutput // todo: eventually merge this one with FrameControl?
{
	readonly binder: WidgetBinder;
	readonly _widgets: WidgetDesc[] = [];

	readonly open: Event<FrameContext>;
	readonly update: Event<FrameContext>;
	readonly redraw: Event<FrameContext>;
	readonly close: Event<FrameContext>;

	context: FrameControl;

	constructor(
		parent: ParentWindow,
		params: FrameEventParams,
		content: FrameContentParams
	)
	{
		const open: Event<FrameContext> = [];
		const update: Event<FrameContext> = [];
		const redraw: Event<FrameContext> = [];
		const close: Event<FrameContext> = [];
		const frame = new FrameControl(content.width || inheritKey, content.height || inheritKey, parent, open, update, redraw, close);
		const binder = new WidgetBinder();

		this.open = open;
		this.update = update;
		this.redraw = redraw;
		this.close = close;
		this.binder = binder;
		this.context = frame;

		const body = new FlexibleLayoutControl(this, content);
		const { onOpen, onUpdate, onClose } = params;
		const { width, height } = content;

		// If any size is static, assign it to the frame here.
		if (!body._width && width && !isString(width))
		{
			frame._width = (<WindowScale>width).value || <number>width;
		}
		if (!body._height && height && !isString(height))
		{
			frame._height = ((<WindowScale>height).value || <number>height);
		}
		frame._padding = parsePadding(content.padding);
		frame._body = body;
		frame._binder = binder._hasBindings() ? binder : null;

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
