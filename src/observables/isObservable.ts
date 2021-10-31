import { isFunction, isObject } from "@src/utilities/type";
import { Observable } from "./observable";
import { ObservableInstance } from "./observableInstance";


/**
 * Returns true if the target is an observable or follows to the observable contract. Returns false if not.
 */
export function isObservable(target: unknown): target is Observable<unknown>
{
	return (target instanceof ObservableInstance || isObservableContract(target));
}


function isObservableContract(target: unknown): target is Observable<unknown>
{
	if (!target || !isObject(target))
		return false;

	const record = <Record<string, unknown>>target;
	return isFunction(record["get"]) && isFunction(record["set"]) && isFunction(record["subscribe"]);
}