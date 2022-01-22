import { Binder } from "@src/bindings/binder";
import { WindowContext } from "./windowContext";
import { WindowEvent } from "./windowEvent";


/**
 * Object that allows components to add themselves to the window.
 */
export interface BuildOutput
{
	/**
	 * The binder helps with binding stores from a viewmodel to a widget inside a window.
	 */
	binder: Binder;

	/**
	 * Add a widget to the build output.
	 */
	add(widget: Widget): void;

	/**
	 * Subscribe to an event on the created window.
	 */
	on(event: WindowEvent, callback: (context: WindowContext) => void): void;
}
