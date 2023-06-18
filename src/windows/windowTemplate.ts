import { OpenWindow } from "./openWindow";

/**
 * A fully created and compressed window template that can now be used.
 */
export interface WindowTemplate extends OpenWindow
{
	/**
	 * Opens this window on-screen.
	 */
	open(): void;
}
