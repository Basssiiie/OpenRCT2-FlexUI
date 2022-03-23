import { zeroPadding } from "@src/elements/constants";
import { isArray, isObject, isUndefined } from "@src/utilities/type";
import { Padding } from "../padding";
import { ParsedPadding } from "./parsedPadding";
import { ParsedScale } from "./parsedScale";
import { parseScaleOrFallback, parseScaleOrZero } from "./parseScale";


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
			throw Error(`Padding array of unknown length: ${length}. Only lengths of 2 or 4 are supported.`);
	}
	else if (isObject(padding))
	{
		// padding specified as object
		returnValue = createParsed(
			parseScaleOrFallback(padding.top, fallbackPadding.top),
			parseScaleOrFallback(padding.right, fallbackPadding.right),
			parseScaleOrFallback(padding.bottom, fallbackPadding.bottom),
			parseScaleOrFallback(padding.left, fallbackPadding.left)
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
 * Create a parsed padding object.
 */
function createParsed(top: ParsedScale, right: ParsedScale, bottom: ParsedScale, left: ParsedScale): ParsedPadding
{
	return { top, right, bottom, left };
}