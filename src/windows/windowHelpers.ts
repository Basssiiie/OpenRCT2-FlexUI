import { endKeys, sizeKeys, startKeys } from "@src/elements/layouts/paddingHelpers";
import { Axis } from "@src/positional/axis";
import { ParsedPadding } from "@src/positional/parsing/parsedPadding";
import { isAbsolute } from "@src/positional/parsing/parsedScale";
import { Size } from "@src/positional/size";
import * as Log from "@src/utilities/logger";
import { isObject, isString } from "@src/utilities/type";
import { WindowScale } from "./windowScale";


export const inheritKey = "inherit"; // take from parent?
export const autoKey = "auto"; // take from children?

const minKeys = <const>["minHeight", "minWidth"];
const maxKeys = <const>["maxHeight", "maxWidth"];

export type WindowScaleOptions = number | WindowScale | "auto";
export type TabScaleOptions = WindowScaleOptions | "inherit";


export function getScaleValue<T>(input: T | { value: T }): T
{
	return (isObject(input)) ? input.value : input;
}


export function getAxisSizeWithInheritance(windowScaleOption: WindowScaleOptions, tabScaleOption: TabScaleOptions): number | "auto"
{
	const result = (tabScaleOption == inheritKey) ? windowScaleOption : tabScaleOption;
	return getScaleValue(result);
}


export function setAxisSizeIfInheritedNumber(window: Window | WindowDesc, direction: Axis, tabValue: TabScaleOptions, windowValue: WindowScaleOptions): number | "auto"
{
	if (tabValue != inheritKey)
	{
		return getScaleValue(tabValue);
	}
	return setAxisSizeIfNumber(window, direction, windowValue);
}

/**
 * Sets the window to the specified scale if it is of static size, and returns the final size if possible.
 */
export function setAxisSizeIfNumber(window: Window | WindowDesc, direction: Axis, scaleOption: TabScaleOptions | undefined): number | "auto"
{
	if (isString(scaleOption))
	{
		return autoKey;
	}

	const scale = (<WindowScale>scaleOption);
	const size = scale.value || <number>scaleOption;
	const min = scale.min || size;
	const max = scale.max || size;

	return setWindowSize(window, direction, size, min, max);
}

export function setAxisSizeIfAuto(window: Window | WindowDesc, direction: Axis, frameSize: Size, windowPadding: ParsedPadding, extraPadding: number): number
{
	const directionKey = sizeKeys[direction];
	const startPad = windowPadding[startKeys[direction]];
	const endPad = windowPadding[endKeys[direction]];
	const size = (frameSize[directionKey] + startPad[0] + endPad[0] + extraPadding);

	if (!isAbsolute(startPad) || !isAbsolute(endPad))
	{
		Log.thrown("Padding for " + directionKey + " must be absolute for auto window resize.");
	}
	return setWindowSize(window, direction, size, size, size);
}


function setWindowSize(window: WindowDesc | Window, direction: Axis, size: number, min: number, max: number): number
{
	Log.debug("Window.resize();", sizeKeys[direction], "=", size, ", min =", min, ", max =", max);

	window[minKeys[direction]] = min;
	window[maxKeys[direction]] = max;

	// Prioritize previous size if it fits in min/max constraints.
	const sizeKey = sizeKeys[direction];
	const current = window[sizeKey];
	return window[sizeKey] = (current && min <= current && current <= max)
		? current
		: size;
}
