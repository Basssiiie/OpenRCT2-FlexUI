import { defaultScale } from "@src/elements/constants";
import { FlexibleLayoutControl } from "@src/elements/layouts/flexible/flexible";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { hasPadding, setSizeWithPadding, sizeKeys } from "@src/elements/layouts/paddingHelpers";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { isAbsolute } from "@src/positional/parsing/parsedScale";
import { ScaleType } from "@src/positional/parsing/scaleType";
import { Rectangle } from "@src/positional/rectangle";
import { Size } from "@src/positional/size";
import { Event, invoke } from "@src/utilities/event";
import * as Log from "@src/utilities/logger";
import { isNumber } from "@src/utilities/type";
import { WidgetBinder } from "../binders/widgetBinder";
import { ParentControl } from "../parentControl";
import { TabLayoutable } from "../tabs/tabLayoutable";
import { WidgetMap } from "../widgets/widgetMap";
import { TabScaleOptions, autoKey } from "../windowHelpers";
import { FrameContext } from "./frameContext";
import { FramePosition, FrameScaleType, ParsedFramePosition } from "./framePosition";
import { ParentWindow } from "../parentWindow";


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
		readonly _padding: ParsedPadding,
		readonly _open: Event<FrameContext>,
		readonly _update: Event<FrameContext>,
		readonly _redraw: Event<FrameContext>,
		readonly _close: Event<FrameContext>
	){}

	/**
	 * Recalculate the whole layout.
	 */
	layout(area: Rectangle): Size
	{
		const widgets = this._activeWidgets;
		if (!widgets)
		{
			return area;
		}
		const padding = this._padding;
		if (hasPadding(padding))
		{
			setSizeWithPadding(area,  defaultScale, defaultScale, padding);
		}

		invoke(this._redraw, this);

		const body = this._body;
		const position = body.position;
		const scales = position._scales;
		const { width, height } = position;

		// Auto shrink area if it is absolute
		if (scales[LayoutDirection.Horizontal] === FrameScaleType.Auto && isAbsolute(width))
		{
			area.width = width[0];
		}
		if (scales[LayoutDirection.Vertical] === FrameScaleType.Auto && isAbsolute(height))
		{
			area.height = height[0];
		}
		body.layout(widgets, area);
		return area;
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
		const parsed = <ParsedFramePosition>{
			width: defaultScale,
			height: defaultScale,
			_scales: [ FrameScaleType.Inherit, FrameScaleType.Inherit ]
		};
		setParsedFrameScale(parsed, position, LayoutDirection.Horizontal);
		setParsedFrameScale(parsed, position, LayoutDirection.Vertical);
		return parsed;
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
 * Parses the input frame position for the specified direction and sets it for that
 * direction in the output. If the input is to inherit, then nothing is done.
 */
function setParsedFrameScale(output: ParsedFramePosition, input: FramePosition, direction: LayoutDirection): void
{
	const key = sizeKeys[direction];
	const scale = input[key];
	if (scale === autoKey)
	{
		output._scales[direction] = FrameScaleType.Auto;
	}
	else if (isNumber(scale))
	{
		output._scales[direction] = FrameScaleType.Specified;
		output[key] = [scale, ScaleType.Pixel];
	}
}