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
	/**
	 * The text to display at the top of the column.
	 * @default undefined
	 */
	header?: string;

	/**
	 * An optional tooltip to show by this column, when hovering over it.
	 * @default undefined
	 */
	tooltip?: string;

	/**
	 * Specifies whether the used can sort this column by clicking on it. The sorting
	 * will be done alphabetically.
	 * @default false
	 */
	canSort?: boolean;

	/**
	 * The width of this column on the horizontal axis, relative to the listview.
	 * @see {@link Scale} for examples of allowed values.
	 * @default "1w".
	 */
	width?: Scale;
}


/**
 * The parameters for configuring the listview.
 */
export interface ListViewParams extends ElementParams
{
	/**
	 * If specified, will add header information above each column and optionally adds sorting.
	 * @default undefined
	 */
	columns?: ListViewColumn[] | ListViewColumnParams[];

	/**
	 * Specifies the items within the listview, either as a single dimension array for
	 * a single row or a multi-dimensional array for multiple columns per row. Can also
	 * include seperator objects to divide the list into multiple sections.
	 */
	items: Bindable<string[] | ListViewItem[]>;

	/**
	 * Whether to allow scrolling horizontally, vertically, both, or neither.
	 * @default "vertical"
	 */
	scrollbars?: ScrollbarType;

	/**
	 * Specifies whether the item that was last clicked will stay selected in the listview.
	 * @default false
	 */
	canSelect?: boolean;

	/**
	 * Whether the rows are displayed in alternating darkness to make each row easier to see.
	 * @default false
	 */
	isStriped?: boolean;

	/**
	 * Triggers whenever the user hovers the mouse pointer over a row.
	 * @default undefined
	 */
	onHighlight?: (item: number, column: number) => void;

	/**
	 * Triggers when one of the rows is clicked.
	 * @default undefined
	 */
	onClick?: (item: number, column: number) => void;
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
	onHighlight?: (item: number, column: number) => void;
	onClick?: (item: number, column: number) => void;

	/** @todo: fix this so it doesnt need to be a complex object, and can just be a ParsedScale instead. */
	_columnWidths?: Parsed<FlexiblePosition>[];


	constructor(parent: ParentControl, output: BuildOutput, params: ListViewParams)
	{
		super("listview", parent, output, params);

		const binder = output.binder;
		binder.add(this, "items", params.items);

		this.showColumnHeaders = (!isUndefined(params.columns));
		this.scrollbars = params.scrollbars;
		this.canSelect = params.canSelect;
		this.isStriped = params.isStriped;
		this.onHighlight = params.onHighlight;
		this.onClick = params.onClick;

		const columns = params.columns;
		this.columns = <Partial<ListViewColumn>[]>columns;

		if (!columns)
		{
			return;
		}

		// Figure out if default columns or custom columns were configured..
		const count = columns.length;
		const columWidths = Array<ParsedScale>(count);
		let hasPercentileWidth = false;

		for (let i = 0; i < count; i++)
		{
			const column = columns[i];
			const tooltip = (<ListViewColumnParams>column).tooltip;
			const parsedWidth = parseScaleOrFallback(column.width, defaultScale);

			hasPercentileWidth ||= isPercentile(parsedWidth);
			columWidths[i] = parsedWidth;

			// Rename tooltip property
			if (tooltip)
			{
				(<ListViewColumn>column).headerTooltip = tooltip;
			}
		}

		// If there is percentile width, let the plugin handle calculation.
		if (hasPercentileWidth)
		{
			this._columnWidths = columWidths.map(width =>
			({
				width,
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
