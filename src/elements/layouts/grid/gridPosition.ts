import { Paddable } from "@src/positional/paddable";
import { Span } from "@src/positional/span";

/**
 * Specifies a grid position for a widget.
 */
export interface GridPosition extends Paddable
{
	/**
	 * The column of the grid to place this widget in. Optionally, a column span can
	 * be used to span multiple columns.
	 *
	 * Columns are 0-based; the first column is column 0, the second column is row 1,
	 * and so on.
	 * @default undefined
	 */
	column?: number | Span;

	/**
	 * The row of the grid to place this widget in. Optionally, a row span can be
	 * used to have the widget span multiple rows.
	 *
	 * Rows are 0-based; the first row is row 0, the second row is row 1, and so on.
	 * @default undefined
	 */
	row?: number | Span;
}
