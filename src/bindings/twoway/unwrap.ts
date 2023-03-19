import { Store } from "../stores/store";
import { isTwoWay } from "./isTwoWay";
import { TwoWayBindable } from "./twowayBindable";


/**
 * If the target is a two-way binding, it will return the underlying store.
 * If the target is not a two-way binding, the original value is returned.
 */
export function unwrap<T>(target: TwoWayBindable<T> | undefined): T | Store<T> | undefined
{
	if (isTwoWay(target))
	{
		return target.twoway;
	}
	return target;
}