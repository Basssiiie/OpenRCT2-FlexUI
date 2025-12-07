import * as Log from "@src/utilities/logger";
import { BaseWindowControl } from "../baseWindowControl";
import { GenericBinder } from "./genericBinder";


/**
 * Binder for OpenRCT2 windows.
 */
export class WindowBinder extends GenericBinder<BaseWindowControl, Window | WindowDesc>
{
	/**
	 * Bind a window control to this binder.
	 */
	override _bind(control: BaseWindowControl): void
	{
		Log.assert(!!control._description, "Window control is missing description!");

		const description = control._description;
		const bindings = this._bindings;
		for (const binding of bindings)
		{
			binding._bind(description);
		}
		this._source = control;
	}


	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
	protected override _getBindTarget<T>(): (source: BaseWindowControl) => T | null
	{
		return (source: BaseWindowControl): T | null =>
		{
			Log.assert(!!source, "Window is not available!");
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return <T>source._window!;
		};
	}
}
