import * as Log from "@src/utilities/logger";
import { DefaultStore } from "./defaultStore";
import { WritableStore } from "./writableStore";


/**
 * The default implementation of a store.
 */
export class DefaultWritableStore<T> extends DefaultStore<T> implements WritableStore<T>
{
	set(value: T): void
	{
		if (this._value !== value)
		{
			Log.debug("(Update store from", this._value, "to", value, "-> update", this._listeners?.length, "listeners)");
			this._value = value;
			this._updateListeners(value);
		}
	}
}
