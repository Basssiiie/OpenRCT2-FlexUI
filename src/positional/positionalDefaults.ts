import { isUndefined } from "@src/utilities/type";
import { Padding } from "./padding";
import { Scale } from "./scale";


/**
 * The default values to use if these values have not been specified.
 */
export interface PositionalDefaults
{
	width?: Scale;
	height?: Scale;
	padding?: Padding;
}


/**
 * Applies default width, height and padding if they are specified.
 */
export function applyDefaults(target: PositionalDefaults, defaults: PositionalDefaults | undefined): void
{
	if (defaults)
	{
		if (isUndefined(target.width) && !isUndefined(defaults.width))
		{
			target.width = defaults.width;
		}
		if (isUndefined(target.height) && !isUndefined(defaults.height))
		{
			target.height = defaults.height;
		}
		if (isUndefined(target.padding) && !isUndefined(defaults.padding))
		{
			target.padding = defaults.padding;
		}
	}
}