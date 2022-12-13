import { Binder } from "@src/bindings/binder";
import { FrameContext } from "./frames/frameContext";
import { FrameEvent } from "./frames/frameEvent";


/**
 * Object that allows components to add themselves to the window.
 */
export interface BuildOutput
{
	/**
	 * The binder helps with binding stores from a viewmodel to a widget inside a window.
	 */
	readonly binder: Binder<WidgetBaseDesc>;

	/**
	 * A context which can be used to interact with the window or tab as a whole.
	 */
	readonly context: FrameContext;

	/**
	 * Add a widget to the build output that will be rendered.
	 */
	add(widget: WidgetBaseDesc): void;

	/**
	 * Subscribe to an event on the created window.
	 */
	on(event: FrameEvent, callback: (context: FrameContext) => void): void;
}
