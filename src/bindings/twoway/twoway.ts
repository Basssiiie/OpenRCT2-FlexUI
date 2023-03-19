import { WritableStore } from "../stores/writableStore";
import { TwoWayBinding } from "./twowayBinding";


/**
 * Marks a writable store as a two-way binding. This means all updates to the store
 * will update the widget control (one-way), and all updates to the widget control
 * will update the store in return (two-way).
 */
export function twoway<T>(store: WritableStore<T>): TwoWayBinding<T>
{
	return { twoway: store };
}