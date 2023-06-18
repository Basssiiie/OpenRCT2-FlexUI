import { ParsedScale } from "./parsing/parsedScale";


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

/**
 * Specifies that a parsed position has at least a width and height of the specified type.
 */
export interface ParsedSize
{
	width: ParsedScale;
	height: ParsedScale;
}
