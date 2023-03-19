import { Bindable } from "../bindable";
import { TwoWayBinding } from "./twowayBinding";

/**
 * A value that can either be a constant, a regular store, or a store marked for two-way binding.
 */
export type TwoWayBindable<T> = Bindable<T> | TwoWayBinding<T>;
