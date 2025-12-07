import * as Log from "@src/utilities/logger";
import { isArray, isNumber, isObject, isUndefined } from "@src/utilities/type";
import { Span } from "../span";
import { ParsedSpan } from "./parsedSpan";

/**
 * Parses an user-defined grid span.
 */
export function parseSpan(value: Span): ParsedSpan;
export function parseSpan(value: Span | undefined): ParsedSpan | undefined;
export function parseSpan(value: Span | undefined): ParsedSpan | undefined
{
	let parsed: ParsedSpan | undefined;

	if (isNumber(value))
	{
		parsed = [value, 1];
	}
	else if (isArray(value))
	{
		parsed = value;
	}
	else if (isObject(value))
	{
		parsed = [value.index, value.span];
	}
	else if (!isUndefined(value))
	{
		Log.thrown("Value '" + Log.stringify(value) + "' is not a valid grid span.");
	}

	return parsed;
}
