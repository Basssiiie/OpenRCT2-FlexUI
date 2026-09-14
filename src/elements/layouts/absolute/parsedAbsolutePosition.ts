import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { Visibility } from "@src/positional/visibility";

export interface ParsedAbsolutePosition
{
	x: ParsedScale;
	y: ParsedScale;
	_width: ParsedScale;
	_height: ParsedScale;
	_visibility?: Visibility;
}
