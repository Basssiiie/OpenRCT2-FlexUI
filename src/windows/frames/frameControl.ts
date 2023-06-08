import { defaultScale } from "@src/elements/constants";
import { FlexibleLayoutControl } from "@src/elements/layouts/flexible/flexible";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { setAbsolutePaddingForDirection, setSizeWithPaddingForDirection, sizeKeys } from "@src/elements/layouts/paddingHelpers";
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
import { WidgetDescMap, WidgetMap } from "../widgets/widgetMap";
import { TabScaleOptions, autoKey, inheritKey } from "../windowHelpers";
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
		readonly _parent: ParentWindow,
		readonly width: TabScaleOptions,
		readonly height: TabScaleOptions,
		readonly _open: Event<FrameContext>,
		readonly _update: Event<FrameContext>,
		readonly _redraw: Event<FrameContext>,
		readonly _close: Event<FrameContext>
	){}

	/**
	 * Recalculate the whole layout.
	 */
	layout(area: FrameRectangle, widgets: WidgetDescMap): Size
	{
		invoke(this._redraw, this);

		const body = this._body;
		const position = body.position;

		const frameWidth = applyFrameScaleOption(area, this.width, position, LayoutDirection.Horizontal);
		const frameHeight = applyFrameScaleOption(area, this.height, position, LayoutDirection.Vertical);

		body.layout(widgets, <Rectangle>area);

		return { width: frameWidth, height: frameHeight };
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

	open(widgets: WidgetMap): void
	{
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
function applyFrameScaleOption(area: FrameRectangle, option: TabScaleOptions, bodyPosition: ParsedFramePosition, direction: LayoutDirection): number
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