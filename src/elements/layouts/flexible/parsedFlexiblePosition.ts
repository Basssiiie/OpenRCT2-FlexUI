import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { ParsedScale } from "@src/positional/parsing/parsedScale";

export interface ParsedFlexiblePosition
{
	_width: ParsedScale;
	_height: ParsedScale;
	_padding: ParsedPadding;
	_skip: boolean | undefined;
}
