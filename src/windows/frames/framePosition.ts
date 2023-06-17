import { Paddable } from "@src/positional/paddable";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { TabScaleOptions } from "../windowHelpers";


/**
 * Specifies the positional options of a window or a tab.
 */
export interface FramePosition extends Paddable
{
	/**
	 * A custom width for this specific tab, to override the window width.
	 * @default "inherit"
	 */
	width?: TabScaleOptions;

	/**
	 * A custom height for this specific tab, to override the window height.
	 * @default "inherit"
	 */
	height?: TabScaleOptions;
}


/**
 * The parsed variation of the position of a frame.
 */
export interface ParsedFramePosition
{
	width: ParsedScale;
	height: ParsedScale;
	_padding: ParsedPadding;
}