import { Observable } from "./observable";


/**
 * Create a value that can be observed by the user interface for change detection.
 */
export const ObservableFactory = createObservable;


function createObservable<U>(): Observable<U | undefined>;
function createObservable<T>(initialValue: T): Observable<T>;
function createObservable<T>(initialValue?: T): Observable<T | undefined>
{
	return new Observable<T | undefined>(initialValue);
}