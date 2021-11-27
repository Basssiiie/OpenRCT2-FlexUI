let internalCounter = 0;


/**
 * Creates a new unique id that hasn't been assigned yet this session.
 * @returns A unique incremental string identifier.
 */
export function identifier(): string
{
	return (internalCounter++).toString(36);
}