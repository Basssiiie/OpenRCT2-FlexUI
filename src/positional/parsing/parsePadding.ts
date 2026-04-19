import { zeroPadding } from "@src/elements/constants";
import * as Log from "@src/utilities/logger";
import { isArray, isObject, isUndefined } from "@src/utilities/type";
import { Padding } from "../padding";
import { Scale } from "../scale";
import { parseScaleOrFallback, parseScaleOrZero } from "./parseScale";
import { PadKey, ParsedPadding } from "./parsedPadding";
import { ParsedScale } from "./parsedScale";


/**
 * Parses the padding to usable tuples of parsed scales.
 */
export function parsePadding(padding: Padding | undefined, fallbackPadding?: ParsedPadding): ParsedPadding
{
	fallbackPadding ||= zeroPadding;
	let returnValue: ParsedPadding | undefined;

	if (isUndefined(padding))
	{
		// padding not specified, apply no padding.
		returnValue = padding;
	}
	else if (isArray(padding))
	{
		// padding specified as 2 or 4 item tuple.
		const length = <number>padding.length;
		if (length === 2)
		{
			// Todo: do we need to take in account `undefined` for fallback ?
			const vertical = parseScaleOrZero(padding[0]);
			const horizontal = parseScaleOrZero(padding[1]);
			returnValue = [vertical, horizontal, vertical, horizontal];
		}
		else if (length === 4)
		{
			returnValue = [ // direction is flipped for efficient index mapping
				parseScaleOrZero(padding[0]),
				parseScaleOrZero(padding[3]),
				parseScaleOrZero(padding[2]),
				parseScaleOrZero(padding[1])
			];
		}
		else
		{
			Log.thrown("Padding array of unknown length: " + length + ". Only lengths of 2 or 4 are supported.");
		}
	}
	else if (isObject(padding))
	{
		// padding specified as object
		const rest = padding.rest;
		returnValue = [
			parsePaddingSideOrFallback(padding.top, rest, fallbackPadding, PadKey.Top),
			parsePaddingSideOrFallback(padding.left, rest, fallbackPadding, PadKey.Left),
			parsePaddingSideOrFallback(padding.bottom, rest, fallbackPadding, PadKey.Bottom),
			parsePaddingSideOrFallback(padding.right, rest, fallbackPadding, PadKey.Right)
		];
	}
	else
	{
		// padding specified as number or string
		const value = parseScaleOrZero(padding);
		returnValue = [value, value, value, value];
	}
	return returnValue || fallbackPadding;
}

/**
 * Determines the padding for a specific side, or takes the fallback value.
 */
function parsePaddingSideOrFallback(value: Scale | undefined, rest: Scale | undefined, fallback: ParsedPadding, side: PadKey): ParsedScale
{
	return parseScaleOrFallback(isUndefined(value) ? rest : value, fallback[side]);
}
