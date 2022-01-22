/**
 * An object that can be subscribed to and whose subscriptions will be notified
 * when the value has changed.
 */
export interface Store<T>
{
	/**
	 * Gets the current value in this store.
	 */
	get(): T;

	/**
	 * Updates the current value to a new one, and notifies all subscribers of this change.
	 * @param value The new value.
	 */
	set(value: T): void;

	/**
	 * Subscribes to this store. The subscription will be called when the value
	 * within this store has changed.
	 * @param callback The action to perfom when the value within this store
	 * has changed.
	 * @returns A callback to unsubscribe from the subscription.
	 */
	subscribe(callback: (value: T) => void): () => void;
}