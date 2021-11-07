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
		if (target.width === undefined && defaults.width !== undefined)
		{
			target.width = defaults.width;
		}
		if (target.height === undefined && defaults.height !== undefined)
		{
			target.height = defaults.height;
		}
		if (target.padding === undefined && defaults.padding !== undefined)
		{
			target.padding = defaults.padding;
		}
	}
}