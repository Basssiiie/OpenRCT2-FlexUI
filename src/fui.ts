import { WindowFactory } from "./core/window";
import { ObservableFactory } from "./observables/observableFactory";
import { WindowParams, TabbedWindowParams } from "./core/window";
import { WindowTemplate } from "./templates/windowTemplate";


/**
 * FluentUI is a user interface framework for OpenRCT2.
 */
const fui =
{
	/**
	 * Create a new fluently designed window.
	 */
	window: WindowFactory,

	/**
	 * Create a value that can be observed by the user interface for change detection.
	 */
	observable: ObservableFactory
};

export default fui;
export type { WindowParams, TabbedWindowParams, WindowTemplate };