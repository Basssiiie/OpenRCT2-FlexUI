import { Bindable } from "@src/bindings/bindable";
import { BuildOutput } from "@src/windows/buildOutput";
import { ParentControl } from "@src/windows/parentControl";
import { WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Parsed } from "@src/positional/parsing/parsed";
import { isAbsolute, isPercentile, ParsedScale } from "@src/positional/parsing/parsedScale";
import { parseScaleOrFallback } from "@src/positional/parsing/parseScale";
import { Rectangle } from "@src/positional/rectangle";
import { Scale } from "@src/positional/scale";
import { isUndefined } from "@src/utilities/type";
import { defaultScale, zeroPadding, zeroScale } from "../constants";
import { ElementParams } from "../elementParams";
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
	columns?: ListViewColumn[] | ListViewColumnParams[];
	items?: Bindable<string[] | ListViewItem[]>;

	scrollbars?: ScrollbarType;
	canSelect?: boolean;
	isStriped?: boolean;
}


/**
 * Add a listbox for displaying data in rows and columns.
 */
export function listview(params: ListViewParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function listview(params: ListViewParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function listview(params: ListViewParams & Positions): WidgetCreator<Positions>
{
	return (parent, output) => new ListViewControl(parent, output, params);
}


/**
 * A controller class for a listview widget.
 */
class ListViewControl extends Control<ListViewDesc> implements ListViewDesc
{
	showColumnHeaders: boolean;
	columns: Partial<ListViewColumn>[];
	items?: string[] | ListViewItem[];
	scrollbars?: ScrollbarType;
	canSelect?: boolean;
	isStriped?: boolean;

	/** @todo: fix this so it doesnt need to be a complex object, and can just be a ParsedScale instead. */
	_columnWidths?: Parsed<FlexiblePosition>[];


	constructor(parent: ParentControl, output: BuildOutput, params: ListViewParams)
	{
		super("listview", parent, output, params);

		const binder = output.binder;
		binder.add(this, "items", params.items);

		this.showColumnHeaders = (!isUndefined(params.columns));
		this.canSelect = params.canSelect;
		this.isStriped = params.isStriped;

		// Figure out if default columns or custom columns were configured..
		const columns = params.columns;
		this.columns = <Partial<ListViewColumn>[]>columns;

		if (!columns)
		{
			return;
		}

		const count = columns.length;
		const columWidths = Array<ParsedScale>(count);
		let hasPercentileWidth = false;

		for (let i = 0; i < count; i++)
		{
			const parsedWidth = parseScaleOrFallback(columns[i].width, defaultScale);
			hasPercentileWidth ||= isPercentile(parsedWidth);
			columWidths[i] = parsedWidth;
		}

		// If there is percentile width, let the plugin handle calculation.
		if (hasPercentileWidth)
		{
			this._columnWidths = columWidths.map(w =>
			({
				width: w,
				height: zeroScale,
				padding: zeroPadding
			}));
			return;
		}

		// If there is none, pass it to OpenRCT2 and forget about it.
		for (let i = 0; i < count; i++)
		{
			const column = <Partial<ListViewColumn>>columns[i], width = columWidths[i];

			if (isAbsolute(width))
			{
				column.width = width[0];
			}
			else // = weighted scale
			{
				column.width = undefined;
				column.ratioWidth = width[0];
			}
		}
	}


	/**
	 * Defines custom layouting for when the listview uses flexible columns.
	 */
	override layout(widgets: WidgetMap, area: Rectangle): void
	{
		const widths = this._columnWidths;
		if (!widths)
		{
			super.layout(widgets, area);
			return;
		}

		const widget = <ListViewDesc>widgets[this.name];
		const columnWidths = this._columnWidths;
		if (columnWidths && widget.width !== area.width)
		{
			flexibleLayout(widths, area, LayoutDirection.Horizontal, zeroScale, (idx, subarea) =>
			{
				this.columns[idx].width = subarea.width;
			});
			widget.columns = this.columns;
			widget.width = area.width;
		}
		widget.x = area.x;
		widget.y = area.y;
		widget.height = area.height;
	}
}
