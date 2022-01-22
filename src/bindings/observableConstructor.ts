import { Observable } from "./observable";
import { ObservableInstance } from "./observableInstance";


/**
 * Create a value that can be observed by the user interface for change detection.
 */
export function observable<U>(): Observable<U | undefined>;
export function observable<T>(initialValue: T): Observable<T>;
export function observable<T>(initialValue?: T): Observable<T | undefined>
{
	return new ObservableInstance<T | undefined>(initialValue);
}