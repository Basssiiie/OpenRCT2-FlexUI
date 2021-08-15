/**
 * An object that can be subscribed to and whose subscriptions will be notified
 * when the value has changed.
 */
export class Observable<T>
{
	/**
	 * The current value.
	 * @internal
	 */
	private _value: T;

	/**
	 * Keeps track of the current listeners.
	 * @internal
	 */
	private _listeners?: ((value: T) => void)[];

	/**
	 * Create a new observable object with the specified value.
	 * @param value The value that the object will be initialized with.
	 */
	constructor(value: T)
	{
		this._value = value;
	}

	/**
	 * Gets the current value in this observable.
	 */
	get(): T
	{
		return this._value;
	}

	/**
	 * Updates the current value to a new one, and notifies all subscribers of this change.
	 * @param value The new value.
	 */
	set(value: T): void
	{
		this._value = value;
		invoke(value, this._listeners);
	}

	/**
	 * Subscribes to this observable. The subscription will be called when the value
	 * within this observable has changed.
	 * @param callback The action to perfom when the value within this observable
	 * has changed.
	 * @returns A callback to unsubscribe from the subscription.
	 */
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


/**
 * Informs all listeners of the new value.
 */
function invoke<T>(value: T, listeners?: ((value: T) => void)[]): void
{
	if (listeners)
	{
		for (let i = 0; i < listeners.length; i++)
		{
			listeners[i](value);
		}
	}
}