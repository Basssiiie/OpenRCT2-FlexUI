import { ParsedScale, ScaleType } from "@src/positional/scale";

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