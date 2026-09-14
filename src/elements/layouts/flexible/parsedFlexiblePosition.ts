import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { Visibility } from "@src/positional/visibility";

export interface ParsedFlexiblePosition
{
	_width: ParsedScale;
	_height: ParsedScale;
	_padding: ParsedPadding;
	_visibility?: Visibility;
}
