import { defaultScale } from "@src/elements/constants";
import { FlexibleLayoutControl } from "@src/elements/layouts/flexible/flexible";
import { FlexiblePosition } from "@src/elements/layouts/flexible/flexiblePosition";
import { parseFlexiblePosition } from "@src/elements/layouts/flexible/parseFlexiblePosition";
import { hasPadding, setSizeWithPadding } from "@src/elements/layouts/paddingHelpers";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { Rectangle } from "@src/positional/rectangle";
import { Event, invoke } from "@src/utilities/event";
import * as Log from "@src/utilities/logger";
import { WidgetBinder } from "../binders/widgetBinder";
import { ParentControl } from "../parentControl";
import { TabLayoutable } from "../tabs/tabLayoutable";
import { WidgetMap } from "../widgets/widgetMap";
import { FrameContext } from "./frameContext";


export class FrameControl implements FrameContext, ParentControl<FlexiblePosition>, TabLayoutable
{
	parse = parseFlexiblePosition;
	recalculate = this.redraw;

	_body!: FlexibleLayoutControl;
	_binder!: WidgetBinder | null;

	_activeWidgets?: WidgetMap;
	_redrawNextTick: boolean = true;

	_area?: Rectangle;

	constructor(
		readonly _padding: ParsedPadding,
		readonly _open: Event<FrameContext>,
		readonly _update: Event<FrameContext>,
		readonly _close: Event<FrameContext>
	){}

	/**
	 * Recalculate the whole layout.
	 */
	layout(area: Rectangle): void
	{
		const widgets = this._activeWidgets;
		if (!widgets)
		{
			return;
		}
		const padding = this._padding;
		if (hasPadding(padding))
		{
			setSizeWithPadding(area,  defaultScale, defaultScale, padding);
		}

		this._redrawNextTick = false;
		this._area = area;

		const body = this._body;
		body._recalculateSizeFromChildren();
		body.layout(widgets, area);
	}

	redraw(): void
	{
		if (!this._activeWidgets)
		{
			Log.debug("FrameControl.redraw() not required, frame is not active.");
			return;
		}

		this._redrawNextTick = true;
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
		if (this._redrawNextTick && this._area)
		{
			this.layout(this._area);
		}
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