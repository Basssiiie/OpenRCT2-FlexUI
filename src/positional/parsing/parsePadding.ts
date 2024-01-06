import { zeroPadding } from "@src/elements/constants";
import { endKeys, startKeys } from "@src/elements/layouts/paddingHelpers";
import * as Log from "@src/utilities/logger";
import { isArray, isObject, isUndefined } from "@src/utilities/type";
import { Padding } from "../padding";
import { parseScaleOrFallback, parseScaleOrZero } from "./parseScale";
import { ParsedPadding } from "./parsedPadding";
import { ParsedScale } from "./parsedScale";


/*
 * A type specifying the padding object notation.
 */
type PaddingObject = Extract<Padding, Record<string, unknown>>;


/**
 * Parses the padding to usable tuples of parsed scales.
 */
export function parsePadding(padding: Padding | undefined, fallbackPadding: ParsedPadding = zeroPadding): ParsedPadding
{
	let returnValue: ParsedPadding | undefined;
	if (isUndefined(padding))
	{
		// padding not specified, apply no padding.
		returnValue = padding;
	}
	else if (isArray(padding))
	{
		// padding specified as 2 or 4 item tuple.
		const length = padding.length;
		if (length === 2)
		{
			// Todo: do we need to take in account `undefined` for fallback ?
			const vertical = parseScaleOrZero(padding[0]);
			const horizontal = parseScaleOrZero(padding[1]);
			returnValue = createParsed(vertical, horizontal, vertical, horizontal);
		}
		else if (length === 4)
		{
			returnValue = createParsed(
				parseScaleOrZero(padding[0]),
				parseScaleOrZero(padding[1]),
				parseScaleOrZero(padding[2]),
				parseScaleOrZero(padding[3])
			);
		}
		else
		{
			Log.thrown("Padding array of unknown length: " + length + ". Only lengths of 2 or 4 are supported.");
		}
	}
	else if (isObject(padding))
	{
		// padding specified as object
		returnValue = createParsed(
			parsePaddingSideOrFallback(startKeys[0], padding, fallbackPadding),
			parsePaddingSideOrFallback(endKeys[1], padding, fallbackPadding),
			parsePaddingSideOrFallback(endKeys[0], padding, fallbackPadding),
			parsePaddingSideOrFallback(startKeys[1], padding, fallbackPadding)
		);
	}
	else
	{
		// padding specified as number or string
		const value = parseScaleOrZero(padding);
		returnValue = createParsed(value, value, value, value);
	}
	return returnValue || fallbackPadding;
}


/**
 * Determines the padding for a specific side, or takes the fallback value.
 */
function parsePaddingSideOrFallback(side: keyof ParsedPadding, padding: PaddingObject, fallback: ParsedPadding): ParsedScale
{
	const value = padding[side];
	return parseScaleOrFallback(isUndefined(value) ? padding.rest : value, fallback[side]);
}


/**
 * Create a parsed padding object.
 */
function createParsed(top: ParsedScale, right: ParsedScale, bottom: ParsedScale, left: ParsedScale): ParsedPadding
{
	return { top, right, bottom, left };
}
