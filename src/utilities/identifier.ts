let internalCounter = 0;


/**
 * A helper to create unique identifiers.
 */
export const Id =
{
	/**
	 * Creates a new unique id that hasn't been assigned yet this session.
	 * @returns A unique incremental string identifier.
	 */
	new(): string
	{
		return (internalCounter++).toString(36);
	}
};