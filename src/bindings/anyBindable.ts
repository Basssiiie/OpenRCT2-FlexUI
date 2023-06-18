import { Store } from "./stores/store";
import { TwoWayBinding } from "./twoway/twowayBinding";


/**
 * A value that can either be a constant, a store value or a two-way binding object.
 */
export type AnyBindable<T> = T | Store<T> | TwoWayBinding<T> | undefined;