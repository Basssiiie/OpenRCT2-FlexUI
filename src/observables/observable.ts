/**
 * An object that can be subscribed to and whose subscriptions will be notified
 * when the value has changed.
 */
export interface Observable<T>
{
	/**
	 * Gets the current value in this observable.
	 */
	get(): T;

	/**
	 * Updates the current value to a new one, and notifies all subscribers of this change.
	 * @param value The new value.
	 */
	set(value: T): void;

	/**
	 * Subscribes to this observable. The subscription will be called when the value
	 * within this observable has changed.
	 * @param callback The action to perfom when the value within this observable
	 * has changed.
	 * @returns A callback to unsubscribe from the subscription.
	 */
	subscribe(callback: (value: T) => void): () => void;
}