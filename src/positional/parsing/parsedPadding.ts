import { ParsedScale } from "./parsedScale";


/**
 * Keys identifying the side of padding.
 */
export const enum PadKey
{
	Top = 0,
	Left = 1,
	Bottom = 2,
	Right = 3
}

/**
 * Object that contains the parsed padding values, in counter-clockwise order of top, left, bottom, right.
 */
export type ParsedPadding = [ParsedScale, ParsedScale, ParsedScale, ParsedScale];
