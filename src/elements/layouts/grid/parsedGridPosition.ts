import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { ParsedSpan } from "@src/positional/parsing/parsedSpan";

export interface ParsedGridPosition
{
	_row: ParsedSpan;
	_column: ParsedSpan;
	_padding: ParsedPadding;
}
