/**
 * Makes all readonly properties on an object mutable.
 */
export type Mutable<T> =
{
	-readonly [k in keyof T]: T[k];
};


/**
 * Converts the specified target to a mutable object.
 */
export function mutable<T>(target: T): Mutable<T>
{
	return <Mutable<T>>target;
}