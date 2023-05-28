import { ParsedScale } from "@src/positional/parsing/parsedScale";
import { TabScaleOptions } from "../windowHelpers";

export interface FramePosition
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


export const enum FrameScaleType
{
	Specified = 0,
	Auto = 1,
	Inherit = 2,
}



export interface ParsedFramePosition
{
	width: ParsedScale;
	height: ParsedScale;
	_scales: [FrameScaleType, FrameScaleType];
}