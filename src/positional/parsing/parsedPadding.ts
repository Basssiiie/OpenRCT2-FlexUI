import { ParsedScale } from "./parsedScale";


/**
 * Object that contains the parsed padding values.
 */
export interface ParsedPadding
{
	top: ParsedScale;
	right: ParsedScale;
	bottom: ParsedScale;
	left: ParsedScale;
}