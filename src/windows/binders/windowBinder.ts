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

		const bindings = this._bindings;
		for (const binding of bindings)
		{
			binding._bind(control);
		}
		this._source = control;
	}


	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
	protected override _getBindTarget<T>(): (source: BaseWindowControl) => T | null
	{
		return (source: BaseWindowControl): T | null =>
		{
			Log.assert(source.isOpen() || !!source._description, "Window description is not available!");
			Log.assert(!source.isOpen() || !!source._window, "Window instance is not available!");

			return <T>(source._window || source._description);
		};
	}
}
