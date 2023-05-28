import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { endKeys, sizeKeys, startKeys } from "@src/elements/layouts/paddingHelpers";
import { Size } from "@src/positional/size";
import { WindowScale } from "./windowScale";
import { isAbsolute } from "@src/positional/parsing/parsedScale";
import * as Log from "@src/utilities/logger";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";


export const inheritKey = "inherit";
export const autoKey = "auto";

const minKeys = ["minHeight", "minWidth"] as const;
const maxKeys = ["maxHeight", "maxWidth"] as const;

export type WindowScaleOptions = number | WindowScale | "auto";
export type TabScaleOptions = WindowScaleOptions | "inherit";


export function getTabSizeOrInheritWindow(tabValue: TabScaleOptions, windowValue: WindowScaleOptions): WindowScaleOptions
{
	if (tabValue === inheritKey)
	{
		return windowValue;
	}
	return tabValue;
}

export function setAxisSizeIfNumber(window: Window | WindowDesc, direction: LayoutDirection, scaleOption: WindowScaleOptions): number
{
	if (scaleOption === autoKey)
	{
		return window[sizeKeys[direction]];
	}

	const scale = (<WindowScale>scaleOption);
	const size = scale.value || <number>scaleOption;
	const min = scale.min;
	const max = scale.max;

	setWindowSize(window, direction, size, min, max);
	return size;
}

export function setAxisSizeIfAuto(window: Window | WindowDesc, direction: LayoutDirection, scaleOption: WindowScaleOptions, frameSize: Size, windowPadding: ParsedPadding, extraPadding: number): void
{
	if (scaleOption !== autoKey)
	{
		return;
	}

	const directionKey = sizeKeys[direction];
	const startPad = windowPadding[startKeys[direction]];
	const endPad = windowPadding[endKeys[direction]];
	const size = (frameSize[directionKey] + startPad[0] + endPad[0] + extraPadding - 1);

	if (!isAbsolute(startPad) || !isAbsolute(endPad))
	{
		Log.thrown("Padding for " + directionKey + "must be absolute for auto window resize.");
	}

	setWindowSize(window, direction, size, size, size);
}


function setWindowSize(window: WindowDesc | Window, direction: LayoutDirection, size: number, min: number | undefined, max: number | undefined): void
{
	window[sizeKeys[direction]] = size;
	window[minKeys[direction]] = min;
	window[maxKeys[direction]] = max;
}