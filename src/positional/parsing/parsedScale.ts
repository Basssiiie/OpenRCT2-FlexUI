import { ScaleType } from "./scaleType";


/**
 * A scale value split into the hard number and its type.
 */
export type ParsedScale = [number, ScaleType];

/**
 * Returns true if the scale is in pixels.
 */
export function isAbsolute(scale: ParsedScale): scale is [number, ScaleType.Pixel]
{
	return isScaleType(scale, ScaleType.Pixel);
}

/**
 * Returns true if the scale is in percentages.
 */
export function isPercentile(scale: ParsedScale): scale is [number, ScaleType.Percentage]
{
	return isScaleType(scale, ScaleType.Percentage);
}

/**
 * Returns true if the scale is in percentages.
 */
export function isWeighted(scale: ParsedScale): scale is [number, ScaleType.Weight]
{
	return isScaleType(scale, ScaleType.Weight);
}

/**
 * Minifiable shortcut that returns true if the scale is of the specified type.
 */
function isScaleType(scale: ParsedScale, type: ScaleType): boolean
{
	return (scale[1] === type);
}