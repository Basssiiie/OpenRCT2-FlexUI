import { defaultScale, zeroScale } from "@src/elements/constants";
import { Axis } from "@src/positional/axis";
import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { parsePadding } from "@src/positional/parsing/parsePadding";
import { convertToPixels, parseScale } from "@src/positional/parsing/parseScale";
import { parseSpan } from "@src/positional/parsing/parseSpan";
import { Rectangle } from "@src/positional/rectangle";
import { Scale } from "@src/positional/scale";
import { isArray, isNumber } from "@src/utilities/type";
import { BuildOutput } from "@src/windows/buildOutput";
import { Layoutable } from "@src/windows/layoutable";
import { ParentControl } from "@src/windows/parentControl";
import { toWidgetCreator, WidgetCreator } from "@src/windows/widgets/widgetCreator";
import { WidgetMap } from "@src/windows/widgets/widgetMap";
import { AbsolutePosition } from "../absolute/absolutePosition";
import { Container } from "../container";
import { FlexiblePosition } from "../flexible/flexiblePosition";
import { applyPaddingToDirection, axisKeys, sizeKeys } from "../paddingHelpers";
import { addScaleToStack, createStack } from "../stack";
import { GridPosition } from "./gridPosition";
import { ParsedGridPosition } from "./parsedGridPosition";


/**
 * The parameters for configuring either the column axis or row axis of a grid layout.
 */
export interface GridCellParams
{
	/**
	 * Specifies the amount of cells (rows or columns) on this axis. If not specified
	 * and `size` is set to an array, it will use the length of that array. In other
	 * cases it will fallback to `1`.
	 * @default size?.length ?? 1
	 */
	count: number;

	/**
	 * Specifies the scale or scales for the various columns in the grid.
	 * @see {@link Scale} for examples of allowed values.
	 * @default "1w"
	 */
	size?: Scale | Scale[];

	/**
	 * Specifies the space between cells. If not absolute, the size will be relative
	 * to the size of the grid.
	 * @see {@link Scale} for examples of allowed values.
	 * @default 0
	 */
	gap?: Scale;
}


/**
 * The parameters for configuring an grid layout.
 */
export interface GridLayoutParams
{
	/**
	 * Specifies the scale or scales for the various columns in the grid.
	 * @see {@link Scale} for examples of allowed values.
	 */
	columns: GridCellParams | Scale[] | number;

	/**
	 * Specifies the scale or scales for the various rows in the grid.
	 * @see {@link Scale} for examples of allowed values.
	 */
	rows: GridCellParams | Scale[] | number;

	/**
	 * Specify the child widgets within this box. By default, each widget will be
	 * placed in the first available cell from left to right, then top to bottom,
	 * unless specified otherwise.
	 */
	content: WidgetCreator<GridPosition>[];
}

/**
 * Add an area with widgets positioned at absolute.
 */
export function grid(params: GridLayoutParams & FlexiblePosition): WidgetCreator<FlexiblePosition>;
export function grid(params: GridLayoutParams & AbsolutePosition): WidgetCreator<AbsolutePosition>;
export function grid(params: GridLayoutParams & GridPosition): WidgetCreator<GridPosition>;
export function grid<Position>(params: GridLayoutParams & Position): WidgetCreator<Position>
{
	return toWidgetCreator(params, GridLayoutControl);
}


class GridLayoutControl<Position> extends Container<GridPosition, ParsedGridPosition> implements ParentControl, Layoutable
{
	_columns: ParsedCellAxis;
	_rows: ParsedCellAxis;

	constructor(parent: ParentControl, output: BuildOutput, params: GridLayoutParams & Position)
	{
		const freeform: ParsedGridPosition[] = [];

		super(output, params.content, position =>
		{
			const row = parseSpan(position.row);
			const column = parseSpan(position.column);
			const padding = parsePadding(position.padding);
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const parsed: ParsedGridPosition = { _row: row!, _column: column!, _padding: padding };

			if (!row || !column)
			{
				freeform.push(parsed);
			}

			return parsed;
		});

		this._columns = parseCellAxis(params.columns);
		this._rows = parseCellAxis(params.rows);

		// todo: apply columns/rows to freeform widgets
	}

	layout(widgets: WidgetMap, area: Rectangle): void
	{
		const children = this._children;
		const positions = this._positions;
		const rectangles = this._rectangles;
		const count = children.length;
		let idx = 0;

		layoutAxis(this._columns, area.x, area.width, Axis.Horizontal, positions, rectangles);
		layoutAxis(this._rows, area.y, area.height, Axis.Vertical, positions, rectangles);

		for (; idx < count; idx++)
		{
			children[idx].layout(widgets, rectangles[idx]);
		}
	}
}

function layoutAxis(parsed: ParsedCellAxis, start: number, size: number, direction: Axis, positions: ParsedGridPosition[], rectangles: Rectangle[])
{
	const childrenCount = positions.length;
	const sizes = parsed._sizes;
	const length = sizes.length;
	const gap = parsed._gap;

	// First pass: calculate available and used space.
	const stack = createStack(length, gap);
	let idx = 0;

	for (; idx < length; idx++)
	{
		const scale = sizes[idx];
		addScaleToStack(scale, stack, 1);
	}

	// Second pass: compute all cell offsets
	const offsets = Array<number>(length);
	const leftoverSpace = (size - stack._requestedPixels);
	const weightedTotal = stack._requestedWeightTotal;
	const percentileTotal = stack._requestedPercentile;
	const gapInPixels = convertToPixels(gap, leftoverSpace, weightedTotal, percentileTotal);

	idx = 1;
	offsets[0] = 0;

	for (; idx < length; idx++)
	{
		offsets[idx] = convertToPixels(sizes[idx], leftoverSpace, weightedTotal, percentileTotal);
	}

	// Third pass: update widgets
	for (idx = 0; idx < childrenCount; idx++)
	{
		const position = positions[idx];
		const rectangle = rectangles[idx];
		const offset = direction ? position._column : position._row;
		const cell = offset[0];
		const span = offset[1];

		rectangle[axisKeys[direction]] = (start + offsets[cell]);
		rectangle[sizeKeys[direction]] = getSpan(span, cell, offsets, gapInPixels);

		// todo: check if this works correctly or if it should be relative to cell size
		applyPaddingToDirection(rectangle, direction, position._padding, leftoverSpace, weightedTotal, percentileTotal);
	}
}

function getSpan(span: number, start: number, offsets: number[], gap: number): number
{
	const end = start + span;
	let total = gap * (span - 1);
	let idx = start;

	for (; idx < end; idx++)
	{
		total += offsets[idx + 1] - offsets[idx];
	}

	return total;
}


interface ParsedCellAxis
{
	_sizes: ParsedScale[];
	_gap: ParsedScale;
}


function parseCellAxis(axis: GridCellParams | Scale[] | number): ParsedCellAxis
{
	let sizes: ParsedScale[];
	let gap = zeroScale;

	if (isNumber(axis))
	{
		sizes = parseScales(axis, defaultScale);
	}
	else if (isArray(axis))
	{
		sizes = parseScales(0, defaultScale, axis);
	}
	else
	{
		const size = axis.size;
		const isAxisArray = isArray(size);
		const array = isAxisArray ? size : undefined;
		const fallback = size && !isAxisArray ? parseScale(size) : defaultScale;

		sizes = parseScales(axis.count, fallback, array);
		gap = parseScale(axis.gap) || gap;
	}

	return { _sizes: sizes, _gap: gap };
}

function parseScales(count: number, fallback: ParsedScale, scales?: Scale[]): ParsedScale[]
{
	const length = scales ? scales.length : 0;
	const sizes = Array<ParsedScale>(count || length);
	let idx = 0;

	for (; idx < count; idx++)
	{
		sizes[idx] = (count <= length)
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			? parseScale(scales![idx])
			: fallback;
	}

	return sizes;
}
