import { Store } from "./stores/store";


/**
 * A value that can either be a constant or a store value.
 */
export type Bindable<T> = T | Store<T>;
