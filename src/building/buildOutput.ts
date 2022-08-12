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
	readonly binder: Binder<WidgetBase>;

	/**
	 * A context which can be used to interact with the window as a whole.
	 */
	readonly context: WindowContext;

	/**
	 * Add a widget to the build output that will be rendered.
	 */
	add(widget: WidgetBase): void;

	/**
	 * Subscribe to an event on the created window.
	 */
	on(event: WindowEvent, callback: (context: WindowContext) => void): void;
}
