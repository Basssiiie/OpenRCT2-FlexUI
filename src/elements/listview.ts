import { BuildOutput } from "@src/core/buildOutput";
import { WidgetCreator } from "@src/core/widgetCreator";
import { WidgetMap } from "@src/core/widgetMap";
import { flexibleLayout } from "@src/layouts/flexibleLayout";
import { Bindable } from "@src/observables/bindable";
import { Direction } from "@src/positional/direction";
import { FlexiblePosition } from "@src/positional/flexiblePosition";
import { Positions } from "@src/positional/positions";
import { Rectangle } from "@src/positional/rectangle";
import { Scale } from "@src/positional/scale";
import { Control } from "./control";
import { ElementParams } from "./element";


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
export function listview<TPos extends Positions>(params: ListViewParams & TPos): WidgetCreator<ListViewParams & TPos>
{
	return {
		params: params,
		create: (output: BuildOutput): ListViewControl => new ListViewControl(output, params)
	};
}


/**
 * A controller class for a listview widget.
 */
class ListViewControl extends Control<ListViewWidget> implements ListViewParams, ListViewWidget
{
	showColumnHeaders: boolean;
	columns: ListViewColumn[];
	columnParams?: (ListViewColumnParams & FlexiblePosition)[];
	items?: string[] | ListViewItem[];
	scrollbars?: ScrollbarType;
	canSelect?: boolean;
	isStriped?: boolean;

	constructor(output: BuildOutput, params: ListViewParams)
	{
		super("listview", output, params);

		const binder = output.binder;
		binder.add(this, "items", params.items);

		this.showColumnHeaders = (params.columns !== undefined);
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
		const columParams = Array<ListViewColumnParams & FlexiblePosition>(count);
		const columWidgets = Array<ListViewColumn>(count);

		for (let i = 0; i < count; i++)
		{
			const column = (<WidgetCreator<ListViewColumnParams>>columns[i]).params;

			columParams[i] = column;
			columWidgets[i] = {
				header: column.header,
				headerTooltip: column.tooltip,
				canSort: column.canSort,
				sortOrder: column.sortOrder
			};
		}
		this.columnParams = columParams;
		this.columns = columWidgets;
	}


	/**
	 * Defines custom layouting for when the listview uses flexible columns.
	 */
	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		const params = this.columnParams;
		if (!params)
		{
			super.layout(widgets, area);
			return;
		}

		const widget = <ListViewWidget>widgets[this.name];
		if (widget.width !== area.width)
		{
			const columns = this.columns;
			flexibleLayout(columns, area, Direction.Horizontal, (idx, subarea) =>
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