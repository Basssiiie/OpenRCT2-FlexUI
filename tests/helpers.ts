/**
 * Call calback in OpenRCT2 fashion (without a this).
 */
export function call<T extends unknown[]>(method: ((...args: T) => void) | undefined, ...args: T): void
{
	method?.call(undefined, ...args);
}
