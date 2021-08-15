/**
 * Event list with typed parameters.
 */
export type Event<T = never> = ((params: T) => void)[];


export const Event: EventInvoker =
{
	invoke<T = never>(event: Event<T>, params?: T): void
	{
		for (let i = 0; i < event.length; i++)
		{
			event[i](params as T);
		}
	}
};


interface EventInvoker
{
	/**
	 * Invoke the specified event and all its registered callbacks.
	 */
	invoke(event: Event<never>): void;
	invoke<T>(event: Event<T>, params: T): void;
}