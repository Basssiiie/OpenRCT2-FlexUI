/**
 * Checks whether the target is an array or not.
 */
export function isArray(target: unknown): target is unknown[]
{
	return Array.isArray(target);
}

/**
 * Checks whether the target is an array or not.
 */
export function isFunction(target: unknown): target is ((...args: unknown[]) => void)
{
	return is(target, "function");
}

/**
 * Checks whether the target is a number or not.
 */
export function isNumber(target: unknown): target is number
{
	return is(target, "number");
}

/**
 * Checks whether the target is an object or not. This includes arrays and
 * anything created with `new` as well.
 */
export function isObject(target: unknown): target is object
{
	return is(target, "object");
}

/**
 * Checks whether the target is a string or not.
 */
export function isString(target: unknown): target is string
{
	return is(target, "string");
}

/**
 * Checks whether the target is of the specified type.
 */
function is(target: unknown, type: string): boolean
{
	return typeof target === type;
}