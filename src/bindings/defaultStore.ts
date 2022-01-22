import { Event, invoke } from "@src/utilities/event";
import { Store } from "./store";


/**
 * The default implementation of a store.
 */
export class DefaultStore<T> implements Store<T>
{
	private _value: T;
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
		this._value = value;
		if (this._listeners)
		{
			invoke(this._listeners, value);
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
}