import { ParsedScale, ScaleType } from "@src/positional/scale";
import { isUndefined } from "@src/utilities/type";
import { AbsolutePosition } from "./layouts/absolute/absolutePosition";
import { FlexiblePosition } from "./layouts/flexible/flexiblePosition";

/**
 * Default height for widgets like labels, spinners and dropdowns.
 */
export const defaultLineHeight = 14;

/**
 * Default spacing in widgets with more than one child.
 */
export const defaultSpacing: ParsedScale = [4, ScaleType.Pixel];

/**
 * A scale that equals to zero.
 */
export const zeroScale: ParsedScale = [0, ScaleType.Pixel];


/**
 * Ensures the height of the control is set to the default line height.
 */
export function ensureDefaultLineHeight(position: FlexiblePosition | AbsolutePosition): void
{
	if (isUndefined(position.height))
		position.height = defaultLineHeight;
}