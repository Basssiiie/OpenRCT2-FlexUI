/**
 * Specifies a rectangle shape somewhere within a parent space.
 */
export interface Rectangle
{
	/**
	 * The spot on the X axis where the rectangle starts.
	 */
	x: number;

	/**
	 * The spot on the Y axis where the rectangle starts.
	 */
	y: number;

	/**
	 * The size of the rectangle on the X axis.
	 */
	width: number;

	/**
	 * The size of the rectangle on the Y axis.
	 */
	height: number;
}
