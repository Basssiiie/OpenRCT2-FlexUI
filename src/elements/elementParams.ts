import { Bindable } from "@src/bindings/bindable";
import { Hideable } from "@src/positional/visibility";


/**
 * Configurable settings for a custom element.
 */
export interface ElementParams extends Hideable
{
	/**
	 * An optional tooltip to show by this element, when hovering over it.
	 * @default undefined
	 */
	tooltip?: Bindable<string>;

	/**
	 * Whether or not the element starts active.
	 * @default false
	 */
	disabled?: Bindable<boolean>;
}
