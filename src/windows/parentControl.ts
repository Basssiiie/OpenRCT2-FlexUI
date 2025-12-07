/**
 * An interface to interact with the parent of this control.
 */
export interface ParentControl
{
	/**
	 * Indicate to the parent that it should recalculate its own required area, because (for example)
	 * one of its children has changed their size.
	 */
	recalculate(): void;
}
