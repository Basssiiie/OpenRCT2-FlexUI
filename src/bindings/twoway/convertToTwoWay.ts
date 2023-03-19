import { wrap } from "../stores/wrap";
import { isTwoWay } from "./isTwoWay";
import { twoway } from "./twoway";
import { TwoWayBindable } from "./twowayBindable";
import { TwoWayBinding } from "./twowayBinding";


/**
 * Returns the target if it is a two-way binding, or creates a new bound store from an existing store or constant.
 */
export function getOrConvertToTwoWayBinding<T>(target: TwoWayBindable<T> | undefined, fallback: T): TwoWayBinding<T>
{
	return (isTwoWay(target)) ? target : twoway(wrap(target || fallback));
}