import { Event, invoke } from "@src/utilities/event";
import { Store } from "./store";


/**
 * The default implementation of a store.
 */
export class DefaultStore<T> implements Store<T>
{
	protected _value: T;

	private _listeners?: Event<T>;

	constructor(value: T)
	{
		this._value = value;
	}

	get(): T
	{
		return this._value;
	}

	set(value: T): void
	{
		if (this._value !== value)
		{
			this._value = value;
			this._updateListeners();
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

	protected _updateListeners(): void
	{
		if (this._listeners)
		{
			invoke(this._listeners, this._value);
		}
	}
}
