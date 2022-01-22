import { Bindable } from "@src/bindings/bindable";
import { BuildOutput } from "@src/building/buildOutput";
import { WidgetCreator } from "@src/building/widgetCreator";
import { WidgetMap } from "@src/building/widgetMap";
import { Direction } from "@src/positional/direction";
import { Parsed } from "@src/positional/parsing/parsed";
import { parseScaleOrFallback } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { Scale } from "@src/positional/scale";
import { isUndefined } from "@src/utilities/type";
import { defaultScale, zeroPadding, zeroScale } from "../constants";
import { ElementParams } from "../element";
import { AbsolutePosition } from "../layouts/absolute/absolutePosition";
import { flexibleLayout } from "../layouts/flexible/flexibleLayout";
import { FlexiblePosition } from "../layouts/flexible/flexiblePosition";
import { Positions } from "../layouts/positions";
import { Control } from "./control";


/**
 * The parameters for configuring a column in the list.
 */
export interface ListViewColumnParams
{
	header?: string;
	tooltip?: string;
	canSort?: boolean;
	sortOrder?: SortOrder;
	width?: Scale;
}


/**
 * The parameters for configuring the listview.
 */
export interface ListViewParams extends ElementParams
{
	columns?: ListViewColumn[] | WidgetCreator<ListViewColumnParams>[];
	items?: Bindable<string[] | ListViewItem[]>;

	scrollbars?: ScrollbarType;
	canSelect?: boolean;
	isStriped?: boolean;
}


/**
 * Add a listbox for displaying data in rows and columns.
 */
export function listview(params: ListViewParams & FlexiblePosition): WidgetCreator<ListViewParams & FlexiblePosition>;
export function listview(params: ListViewParams & AbsolutePosition): WidgetCreator<ListViewParams & AbsolutePosition>;
export function listview(params: ListViewParams & Positions): WidgetCreator<ListViewParams>
{
	return {
		params: params,
		create: (output: BuildOutput): ListViewControl => new ListViewControl(output, params)
	};
}


/**
 * A controller class for a listview widget.
 */
class ListViewControl extends Control<ListViewWidget> implements ListViewWidget
{
	showColumnHeaders: boolean;
	columns: ListViewColumn[];
	items?: string[] | ListViewItem[];
	scrollbars?: ScrollbarType;
	canSelect?: boolean;
	isStriped?: boolean;

	_columnWidths?: Parsed<FlexiblePosition>[];


	constructor(output: BuildOutput, params: ListViewParams)
	{
		super("listview", output, params);

		const binder = output.binder;
		binder.add(this, "items", params.items);

		this.showColumnHeaders = (!isUndefined(params.columns));
		this.canSelect = params.canSelect;
		this.isStriped = params.isStriped;

		// Figure out if default columns or custom columns were configured..
		const columns = params.columns;
		if (!columns || columns.length === 0 || !("create" in columns[0]))
		{
			this.columns = <ListViewColumn[]>columns;
			return;
		}

		const count = columns.length;
		const columWidths = Array<Parsed<FlexiblePosition>>(count);
		const columWidgets = Array<ListViewColumn>(count);

		for (let i = 0; i < count; i++)
		{
			const column = (<WidgetCreator<ListViewColumnParams>>columns[i]).params;

			columWidths[i] = {
				width: parseScaleOrFallback(column.width, defaultScale),
				height: zeroScale,
				padding: zeroPadding
			};
			columWidgets[i] = {
				header: column.header,
				headerTooltip: column.tooltip,
				canSort: column.canSort,
				sortOrder: column.sortOrder
			};
		}
		this._columnWidths = columWidths;
		this.columns = columWidgets;
	}


	/**
	 * Defines custom layouting for when the listview uses flexible columns.
	 */
	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		const params = this._columnWidths;
		if (!params)
		{
			super.layout(widgets, area);
			return;
		}

		const widget = <ListViewWidget>widgets[this.name];
		if (widget.width !== area.width)
		{
			const columns = this.columns;
			flexibleLayout(params, area, Direction.Horizontal, zeroScale, (idx, subarea) =>
			{
				columns[idx].width = subarea.width;
			});
			widget.columns = columns;
			widget.width = area.width;
		}
		widget.x = area.x;
		widget.y = area.y;
		widget.height = area.height;
	}
}