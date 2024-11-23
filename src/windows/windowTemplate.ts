import { OpenWindow } from "./openWindow";

/**
 * A fully created and compressed window template that can now be used.
 */
export interface WindowTemplate<TModel = void>
{
	/**
	 * Opens this window on-screen with the specified details.
	 */
	open(model: TModel): OpenWindow;
}
