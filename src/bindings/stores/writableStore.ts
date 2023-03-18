import { Store } from "./store";

/**
 * A mutable object that can be subscribed to and whose subscriptions will be
 * notified when the value has changed.
 *
 * Tip: Stores work best if you only use them for binding a model to your user
 * interface, and nowhere else.
 */
export interface WritableStore<T> extends Store<T>
{
	/**
	 * Updates the current value to a new one. If the new value is different from the
	 * old one, it will notifies all subscribers of this change.
	 * @param value The new value.
	 */
	set(value: T): void;
}