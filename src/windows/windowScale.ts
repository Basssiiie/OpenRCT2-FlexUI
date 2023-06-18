/**
 * Sets a rescalable window size on the specified axis.
 */
export interface WindowScale
{
	/**
	 * The initial size of the window in pixels when the window opens.
	 */
	value: number;

	/**
	 * The absolute minimum size the window can be resized to on this axis. If set, the
	 * window will be rescalable by the user.
	 * @default this.value
	 */
	min?: number;

	/**
	 * The absolute maximum size the window can be resized to on this axis. If set, the
	 * window will be rescalable by the user.
	 * @default this.value
	 */
	max?: number;
}