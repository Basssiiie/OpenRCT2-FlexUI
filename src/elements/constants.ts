import { Padding } from "@src/positional/padding";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { ScaleType } from "@src/positional/parsing/scaleType";
import { isUndefined } from "@src/utilities/type";


/**
 * The "open" event string for frame events.
 */
export const openEvent = "open";

/**
 * The "redraw" event string for frame events.
 */
export const redrawEvent = "redraw";

/**
 * The "update" event string for frame events.
 */
export const updateEvent = "update";

/**
 * Default height for widgets like labels, spinners and dropdowns.
 */
export const defaultLineHeight = 14;

/**
 * Default padding for windows.
 */
export const defaultWindowPadding: Padding = 5;

/**
 * Default spacing in widgets with more than one child.
 */
export const defaultSpacing: ParsedScale = [4, ScaleType.Pixel];

/**
 * Default scale of a widget.
 */
export const defaultScale: ParsedScale = [1, ScaleType.Weight];

/**
 * A scale that equals to zero.
 */
export const zeroScale: ParsedScale = [0, ScaleType.Pixel];

/**
 * A padding that equals to zero on each side.
 */
export const zeroPadding: ParsedPadding =
{
	top: zeroScale,
	right: zeroScale,
	bottom: zeroScale,
	left: zeroScale
};


/**
 * Ensures the height of the control is set to the default line height.
 */
export function ensureDefaultLineHeight(position: { height?: unknown }): void
{
	if (isUndefined(position.height))
		position.height = defaultLineHeight;
}