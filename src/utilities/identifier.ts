// Create a somewhat random id, but offset it times a 1024 to ensure nearby numbers
// will almost never really overlap (hopefully).
// (It just needs to be unique enough to not overlap with other plugins this session.)
let internalCounter = (Math.floor(Math.random() * 0xFFFFF) << 10);


/**
 * Creates a new unique id that hasn't been assigned yet this session.
 * @returns A unique incremental string identifier.
 */
export function identifier(): string
{
	return (internalCounter++).toString(36);
}