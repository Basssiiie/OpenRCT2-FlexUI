import { Event, invoke } from "@src/utilities/event";
import { Store } from "./store";
import * as Log from "@src/utilities/logger";


/**
 * The default implementation of a store.
 */
export class DefaultStore<T> implements Store<T>
{
	private _listeners?: Event<T>;

	constructor(protected _value: T)
	{
	}

	get(): T
	{
		return this._value;
	}

	set(value: T): void
	{
		if (this._value !== value)
		{
			Log.debug(`(Update store from ${this._value} to ${value}, update ${this._listeners?.length} listeners)`);
			this._value = value;
			this._updateListeners(value);
		}
	}

	subscribe(callback: (value: T) => void): () => void
	{
		if (!this._listeners)
		{
			this._listeners = [ callback ];
		}
		else
		{
			this._listeners.push(callback);
		}

		const subscriptions = this._listeners;
		return (): void =>
		{
			const index = subscriptions.indexOf(callback);
			if (index !== -1)
			{
				subscriptions.splice(index, 1);
			}
		};
	}

	protected _updateListeners(value: T): void
	{
		if (this._listeners)
		{
			invoke(this._listeners, value);
		}
	}
}
