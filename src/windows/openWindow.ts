
/**
 * A reference to an opened window.
 */
export interface OpenWindow
{
	/**
	 * Moves the window into focus, if it is open.
	 */
	focus(): void;

	/**
	 * Closes this window on-screen.
	 */
	close(): void;
}
