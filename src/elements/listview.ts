import { BuildOutput } from "../core/buildOutput";
import { WidgetFactory } from "../core/widgetFactory";
import { LayoutFactory } from "../layouts/layoutFactory";
import { LayoutFunction } from "../layouts/layoutFunction";
import { Bindable } from "../observables/bindable";
import { Direction } from "../positional/direction";
import { FlexiblePosition } from "../positional/flexiblePosition";
import { Rectangle } from "../positional/rectangle";
import { Scale } from "../positional/scale";
import { Id } from "../utilities/identifier";
import { ElementParams } from "./element";


export interface ListViewColumnParams
{
	header?: string;
	tooltip?: string;
	canSort?: boolean;
	sortOrder?: SortOrder;
	width?: Scale;
}


export interface ListViewContentBuilder
{
	column(params: ListViewColumnParams): ListViewContentBuilder;
}


export interface ListViewParams extends ElementParams
{
	content?: (builder: ListViewContentBuilder) => void;
	items?: Bindable<string[] | ListViewItem[]>;

	scrollbars?: ScrollbarType;
	canSelect?: boolean;
	isStriped?: boolean;
}


export const ListViewFactory: WidgetFactory<ListViewParams> =
{
	create(output: BuildOutput, params: ListViewParams): LayoutFunction
	{
		const id = Id.new();
		const listview = <Omit<ListView, keyof Rectangle>>
		{
			name: id,
			type: "listview",
			showColumnHeaders: (params.content !== undefined),
			scrollbars: params.scrollbars,
			canSelect: params.canSelect,
			isStriped: params.isStriped
		} as ListView;

		const binder = output.binder;
		binder.read(listview, "items", params.items);

		output.widgets.push(listview);

		const columnBuilder = params.content;
		if (!columnBuilder)
		{
			return (widgets, area): void => LayoutFactory.defaultLayout(widgets, id, area);
		}

		// Columns present, create layout function to include column scaling...
		const columns: (ListViewColumnParams | ListViewColumn)[] = [];
		columnBuilder(new ContentBuilder(columns));
		const columnSizes = columns.map(c => <FlexiblePosition>{ width: c.width });

		for (let i = 0; i < columns.length; i++)
		{
			// Convert column params to actual column
			const column = <ListViewColumnParams>columns[i];
			columns[i] = <ListViewColumn>{
				header: column.header,
				headerTooltip: column.tooltip,
				canSort: column.canSort,
				sortOrder: column.sortOrder
			};
		}

		return (widgets, area): void =>
		{
			const widget = widgets.get<ListView>(id);
			if (widget.width !== area.width)
			{
				LayoutFactory.flexibleLayout(columnSizes, area, Direction.Horizontal, (idx, subarea) =>
				{
					columns[idx].width = subarea.width;
				});
				widget.columns = <ListViewColumn[]>columns;
				widget.width = area.width;
			}
			widget.x = area.x;
			widget.y = area.y;
			widget.height = area.height;
		};
	}
};

class ContentBuilder implements ListViewContentBuilder
{
	constructor(private readonly container: ListViewColumnParams[])
	{
	}

	column(params: ListViewColumnParams): ListViewContentBuilder
	{
		this.container.push(params);
		return this;
	}
}