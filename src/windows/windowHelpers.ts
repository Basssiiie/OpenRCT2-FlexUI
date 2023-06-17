import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { endKeys, sizeKeys, startKeys } from "@src/elements/layouts/paddingHelpers";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { isAbsolute } from "@src/positional/parsing/parsedScale";
import { Size } from "@src/positional/size";
import * as Log from "@src/utilities/logger";
import { isObject, isString } from "@src/utilities/type";
import { WindowScale } from "./windowScale";


export const inheritKey = "inherit";
export const autoKey = "auto";

const minKeys = ["minHeight", "minWidth"] as const;
const maxKeys = ["maxHeight", "maxWidth"] as const;

export type WindowScaleOptions = number | WindowScale | "auto";
export type TabScaleOptions = WindowScaleOptions | "inherit";


export function getAxisSizeWithInheritance(windowScaleOption: WindowScaleOptions, tabScaleOption: TabScaleOptions): number | "auto"
{
	const result = (tabScaleOption == inheritKey) ? windowScaleOption : tabScaleOption;
	return (isObject(result)) ? result.value : result;
}


export function setAxisSizeIfInheritedNumber(window: Window | WindowDesc, direction: LayoutDirection, tabValue: TabScaleOptions, windowValue: WindowScaleOptions): number | "auto"
{
	if (tabValue != inheritKey)
	{
		return (isObject(tabValue)) ? tabValue.value : tabValue;
	}
	return setAxisSizeIfNumber(window, direction, windowValue);
}

export function setAxisSizeIfNumber(window: Window | WindowDesc, direction: LayoutDirection, scaleOption: TabScaleOptions): number | "auto"
{
	if (isString(scaleOption))
	{
		return autoKey;
	}

	const scale = (<WindowScale>scaleOption);
	const size = scale.value || <number>scaleOption;
	const min = scale.min || size;
	const max = scale.max || size;

	setWindowSize(window, direction, size, min, max);
	return size;
}

export function setAxisSizeIfAuto(window: Window | WindowDesc, direction: LayoutDirection, scaleOption: number | "auto", frameSize: Size, windowPadding: ParsedPadding, extraPadding: number): number
{
	if (scaleOption !== autoKey)
	{
		return scaleOption;
	}

	const directionKey = sizeKeys[direction];
	const startPad = windowPadding[startKeys[direction]];
	const endPad = windowPadding[endKeys[direction]];
	const size = (frameSize[directionKey] + startPad[0] + endPad[0] + extraPadding - 1);

	if (!isAbsolute(startPad) || !isAbsolute(endPad))
	{
		Log.thrown("Padding for " + directionKey + " must be absolute for auto window resize.");
	}
	setWindowSize(window, direction, size, size, size);
	return size;
}


function setWindowSize(window: WindowDesc | Window, direction: LayoutDirection, size: number, min: number | undefined, max: number | undefined): void
{
	Log.debug("Window.resize();", sizeKeys[direction], "=", size, ", min =", min, ", max =", max);
	window[sizeKeys[direction]] = size;
	window[minKeys[direction]] = min;
	window[maxKeys[direction]] = max;
}