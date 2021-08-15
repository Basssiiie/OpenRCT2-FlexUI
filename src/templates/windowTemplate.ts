/**
 * A fully created and compressed window template that can now be used.
 */


export interface WindowTemplate
{
	/**
	 * Opens this window on-screen.
	 */
	open(): void;

	/**
	 * Closes this window on-screen.
	 */
	close(): void;

	/**
	 * Moves the window into focus, if it is open.
	 */
	focus(): void;
}
