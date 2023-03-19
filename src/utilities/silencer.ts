import * as Log from "@src/utilities/logger";


/**
 * Control whose `onChange` callback can be silenced.
 */
interface SilenceOnChangeControl
{
	name: string;
	_silenceOnChange?: boolean;
}


/**
 * Set the `onChange` callback to a custom callback that can be silenced when FlexUI is updating certain widget valued.
 */
export function decorateWithSilencer(control: SilenceOnChangeControl, callback: ((value: number) => void) | undefined, apply?: (value: number, callback: (value: number) => void) => void): ((value: number) => void) | undefined
{
	if (!callback)
	{
		return callback;
	}

	return (value: number): void =>
	{
		if (control._silenceOnChange)
		{
			Log.debug("Callback to control", control.name, "onChange is silenced, with value:", value);
		}
		else if (apply)
		{
			apply(value, callback);
		}
		else
		{
			callback(value);
		}
	};
}


/**
 * Sets the property of the target while the control is silenced for `onChange` updates.
 */
export function setPropertyAndSilenceOnChange<T, K extends keyof T>(control: SilenceOnChangeControl, target: T, key: K, value: T[K]): void
{
	control._silenceOnChange = true;
	target[key] = value;
	control._silenceOnChange = false;
}