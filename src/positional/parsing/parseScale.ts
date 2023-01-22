import { zeroScale } from "@src/elements/constants";
import { isNumber, isUndefined } from "@src/utilities/type";
import { Scale } from "../scale";
import { ParsedScale } from "./parsedScale";
import { ScaleType } from "./scaleType";


/**
 * Parses an user-defined scale (either string or number) to a tuple of scale value and type.
 */
export function parseScale(value: Scale): ParsedScale;
export function parseScale(value: Scale | undefined): ParsedScale | undefined;
export function parseScale(value: Scale | undefined): ParsedScale | undefined
{
	if (isUndefined(value))
	{
		return value;
	}

	// Number = weighted value.
	if (isNumber(value))
	{
		return [value, ScaleType.Pixel];
	}

	const trimmed = value.trim();
	const length = trimmed.length;

	if (length > 1)
	{
		let endIdx: number = (length - 1);
		let type: ScaleType | undefined;
		const last = trimmed[endIdx];

		if (last === "w")
		{
			type = ScaleType.Weight;
		}
		else if (last === "%")
		{
			type = ScaleType.Percentage;
		}
		else if (length > 2)
		{
			endIdx--;
			if (last === "x" && trimmed[endIdx] === "p")
			{
				type = ScaleType.Pixel;
			}
		}

		if (!isUndefined(type))
		{
			const num = parseFloat(trimmed.substring(0, endIdx));
			return [num, type];
		}
	}

	throw Error("Value '" + value + "' is not a valid scale.");
}


/**
 * Tries to parse the scale, or returns zero scale otherwise.
 */
export function parseScaleOrFallback(value: Scale | undefined, fallback: ParsedScale): ParsedScale
{
	return parseScale(value) || fallback;
}


/**
 * Tries to parse the scale, or returns zero scale otherwise.
 */
export function parseScaleOrZero(value: Scale | undefined): ParsedScale
{
	return parseScaleOrFallback(value, zeroScale);
}


/**
 * Returns true if the two parsed scales are of equal size and type, or false if not.
 */
export function isParsedScaleEqual(left: ParsedScale, right: ParsedScale): boolean
{
	return (left[0] === right[0] && left[1] === right[1]);
}


/**
 * Calculates the pixel scale using the leftover space and weighted total if necessary.
 */
export function convertToPixels(scale: ParsedScale, leftoverSpace: number, weightedTotal?: number): number
{
	switch (scale[1])
	{
		case ScaleType.Weight:
			return (weightedTotal)
				? ((scale[0] / weightedTotal) * leftoverSpace)
				: leftoverSpace;

		case ScaleType.Percentage:
			return ((scale[0] * 0.01) * leftoverSpace);

		default: // ScaleType.Pixel
			return scale[0];
	}
}