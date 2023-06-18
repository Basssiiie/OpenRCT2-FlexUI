/**
 * Specifies a rectangle shape somewhere within a parent space for a frame.
 */
export interface FrameRectangle
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
	 * The size of the rectangle on the X axis, or `"auto"` if the frame size should
	 * be determined by the size of the children.
	 */
	width: number | "auto";

	/**
	 * The size of the rectangle on the Y axis, or `"auto"` if the frame size should
	 * be determined by the size of the children.
	 */
	height: number | "auto";
}