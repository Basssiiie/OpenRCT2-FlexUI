import { read } from "@src/bindings/stores/read";
import { Store } from "@src/bindings/stores/store";
import { defaultScale } from "@src/elements/constants";
import { FlexibleLayoutControl } from "@src/elements/layouts/flexible/flexible";
import { setAbsolutePaddingForDirection, setSizeWithPaddingForDirection, sizeKeys } from "@src/elements/layouts/paddingHelpers";
import { Axis } from "@src/positional/axis";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { Rectangle } from "@src/positional/rectangle";
import { Size } from "@src/positional/size";
import { Event, invoke } from "@src/utilities/event";
import * as Log from "@src/utilities/logger";
import { isNullOrUndefined } from "@src/utilities/type";
import { WidgetBinder } from "../binders/widgetBinder";
import { ParentWindow } from "../parentWindow";
import { TabLayoutable } from "../tabs/tabLayoutable";
import { WidgetMap } from "../widgets/widgetMap";
import { autoKey, inheritKey, setAxisSizeIfNumber, TabScaleOptions, WindowScaleOptions } from "../windowHelpers";
import { FrameContext } from "./frameContext";
import { FramePosition } from "./framePosition";
import { FrameRectangle } from "./frameRectangle";


/**
 * An independant window component that can hold one or more widgets and manage their lifecycle.
 */
export class FrameControl implements FrameContext, TabLayoutable
{
	// These are only set if the frame is of static size.
	_width?: number;
	_height?: number; // todo not needed anymore?

	_padding!: ParsedPadding;
	_body!: FlexibleLayoutControl<FramePosition>;
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
	)
	{
	}

	/**
	 * Recalculate the whole layout.
	 */
	layout(area: FrameRectangle, widgets: WidgetMap): Size
	{
		invoke(this._redraw, this);

		const body = this._body;
		const padding = this._padding;

		// Try to auto-scale to container's size, if requested.
		const width = scaleFrame(area, this.width, body._width || this._width, padding, Axis.Horizontal);
		const height = scaleFrame(area, this.height, body._height || this._height, padding, Axis.Vertical);

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

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
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
function scaleFrame(area: FrameRectangle, option: TabScaleOptions, containerSize: Store<number | undefined> | number | undefined, padding: ParsedPadding, direction: Axis): number
{
	const sizeKey = sizeKeys[direction];
	let size: WindowScaleOptions = (!option || option == inheritKey) ? area[sizeKey] : option;

	// If auto or inherit auto from parent, try size to child content.
	if (size == autoKey)
	{
		// Resize area size to child frame's size.
		size = <number><never>read(containerSize);

		if (isNullOrUndefined(size))
		{
			Log.error("Window content body's " + sizeKey + " must resolve to absolute size for \"auto\" window size.");
		}

		return size + setAbsolutePaddingForDirection(area, padding, direction);
	}

	// Apply regular padding to area and return original size.
	return setSizeWithPaddingForDirection(<Rectangle>area, direction, defaultScale, padding);
}
