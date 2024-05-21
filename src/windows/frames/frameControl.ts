import { defaultScale } from "@src/elements/constants";
import { FlexibleLayoutControl } from "@src/elements/layouts/flexible/flexible";
import { setAbsolutePaddingForDirection, setSizeWithPaddingForDirection, sizeKeys } from "@src/elements/layouts/paddingHelpers";
import { Axis } from "@src/positional/axis";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { isAbsolute } from "@src/positional/parsing/parsedScale";
import { Rectangle } from "@src/positional/rectangle";
import { Size } from "@src/positional/size";
import { Event, invoke } from "@src/utilities/event";
import * as Log from "@src/utilities/logger";
import { WidgetBinder } from "../binders/widgetBinder";
import { ParentControl } from "../parentControl";
import { ParentWindow } from "../parentWindow";
import { TabLayoutable } from "../tabs/tabLayoutable";
import { WidgetMap } from "../widgets/widgetMap";
import { TabScaleOptions, autoKey, inheritKey, setAxisSizeIfNumber } from "../windowHelpers";
import { FrameContext } from "./frameContext";
import { FramePosition, ParsedFramePosition } from "./framePosition";
import { FrameRectangle } from "./frameRectangle";


/**
 * An independant window component that can hold one or more widgets and manage their lifecycle.
 */
export class FrameControl implements FrameContext, ParentControl<FramePosition, ParsedFramePosition>, TabLayoutable
{
	recalculate = this.redraw;

	_body!: FlexibleLayoutControl<FramePosition, ParsedFramePosition>;
	_binder!: WidgetBinder | null;

	_activeWidgets?: WidgetMap;

	constructor(
		readonly width: TabScaleOptions,
		readonly height: TabScaleOptions,
		private readonly _parent: ParentWindow,
		private readonly _open: Event<FrameContext>,
		private readonly _update: Event<FrameContext>,
		private readonly _redraw: Event<FrameContext>,
		private readonly _close: Event<FrameContext>
	){}

	/**
	 * Recalculate the whole layout.
	 */
	layout(area: FrameRectangle, widgets: WidgetMap): Size
	{
		invoke(this._redraw, this);

		const body = this._body;
		const position = body.position;

		const width = applyFrameScaleOption(area, this.width, position, Axis.Horizontal);
		const height = applyFrameScaleOption(area, this.height, position, Axis.Vertical);

		body.layout(widgets, <Rectangle>area);

		return { width, height };
	}

	redraw(): void
	{
		if (!this._activeWidgets)
		{
			Log.debug("FrameControl.redraw() not required, frame is not active.");
			return;
		}
		this._parent.redraw();
	}

	/**
	 * Parser for the direct child body of the control.
	 */
	parse(position: FramePosition): ParsedFramePosition
	{
		return {
			width: defaultScale,
			height: defaultScale,
			_padding: parsePadding(position.padding)
		};
	}

	getWidget<T extends Widget>(name: string): T | null
	{
		const activeWidgets = this._activeWidgets;
		let widget: T | undefined;
		if (activeWidgets)
		{
			widget = <T>activeWidgets[name];
		}
		return widget || null;
	}

	isOpen(): boolean
	{
		return !!this._activeWidgets;
	}

	open(window: Window, widgets: WidgetMap): void
	{
		Log.debug("FrameControl.open(", widgets.length, "widgets )");
		setAxisSizeIfNumber(window, Axis.Horizontal, this.width);
		setAxisSizeIfNumber(window, Axis.Vertical, this.height);

		this._activeWidgets = widgets;

		const binder = this._binder;
		if (binder)
		{
			binder._bind(this);
		}
		invoke(this._open, this);
	}

	update(): void
	{
		invoke(this._update, this);
	}

	close(): void
	{
		Log.debug("FrameControl.close()");
		invoke(this._close, this);

		const binder = this._binder;
		if (binder)
		{
			binder._unbind();
		}
		this._activeWidgets = undefined;
	}
}


/**
 * Applies the frame scale option to the specified area and returns the total occupied space by the frame.
 */
function applyFrameScaleOption(area: FrameRectangle, option: TabScaleOptions, bodyPosition: ParsedFramePosition, direction: Axis): number
{
	const sizeKey = sizeKeys[direction];
	const parentSize = area[sizeKey];
	const bodySize = bodyPosition[sizeKey];
	const bodyPadding = bodyPosition._padding;
	const inheritParent = (option == inheritKey);

	if ((inheritParent && parentSize == autoKey) || option == autoKey)
	{
		// Get area size of child frame.
		if (!isAbsolute(bodySize))
		{
			Log.thrown("Window body " + sizeKey + " must resolve to absolute size for \"auto\" window size.");
		}

		return (bodySize[0] + setAbsolutePaddingForDirection(area, bodyPadding, direction));
	}

	// Apply regular padding to area and return original size.
	setSizeWithPaddingForDirection(<Rectangle>area, direction, bodySize, bodyPadding);
	return (inheritParent) ? <number>parentSize : bodySize[0];
}
