/**
 * Specifies that a position has at least a width and height of the specified type.
 */
export interface SizeParams
{
	width?: unknown;
	height?: unknown;
}

/**
 * Specifies the current absolute width and height in pixels.
 */
export interface Size
{
	width: number;
	height: number;
}
