
/**
 * A reference to an opened window.
 */
export interface OpenWindow
{
	/**
	 * Specifies whether the window is still open.
	 */
	isOpen(): boolean;

	/**
	 * Moves the window into focus, if it is open.
	 */
	focus(): void;

	/**
	 * Closes this window on-screen.
	 */
	close(): void;
}
