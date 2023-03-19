import { Store } from "./stores/store";
import { TwoWayBinding } from "./twoway/twowayBinding";


/**
 * A value that can either be a constant or a store value.
 */
export type AnyBindable<T> = T | Store<T> | TwoWayBinding<T> | undefined;