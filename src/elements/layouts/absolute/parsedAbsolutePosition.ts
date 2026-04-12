import { ParsedScale } from "@src/positional/parsing/parsedScale";

export interface ParsedAbsolutePosition
{
	x: ParsedScale;
	y: ParsedScale;
	_width: ParsedScale;
	_height: ParsedScale;
	_skip?: boolean;
}
