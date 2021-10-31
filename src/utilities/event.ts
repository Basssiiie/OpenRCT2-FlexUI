/**
 * Event list with typed parameters.
 */
export type Event<T = never> = ((params: T) => void)[];


/**
 * Invoke the specified event and all its registered callbacks.
 */
export function invoke<T = never>(event: Event<T>, params?: T): void
{
	for (let i = 0; i < event.length; i++)
	{
		event[i](<T>params);
	}
}