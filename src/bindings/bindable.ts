import { Observable } from "./observable";


/**
 * A value that can either be a constant or an observable value.
 */
export type Bindable<T> = T | Observable<T>;
