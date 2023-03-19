import { WritableStore } from "../stores/writableStore";

/**
 * Marks a writable store as a two-way binding. This means all updates to the store
 * will update the widget control (one-way), and all updates to the widget control
 * will update the store in return (two-way).
 */
export interface TwoWayBinding<T>
{
	/**
	 * The store to be two-way bounded.
	 */
	readonly twoway: WritableStore<T>;
}