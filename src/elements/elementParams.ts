import { Bindable } from "@src/bindings/bindable";


/**
 * Whether the element is visible, hidden or gone completely.
 *
 * Note: `hidden` elements still take up space, `none` elements do not.
 */
export type ElementVisibility = "visible" | "hidden" | "none";

/**
 * Key for the "visible" state of an element.
 */
export const visibleKey = "visible";

/**
 * Key for the "hidden" state of an element: invisible but still taking up space.
 */
export const hiddenKey = "hidden";

/**
 * Key for the "none" state of an element: invisible and not taking up space.
 */
export const noneKey = "none";

/**
 * Configurable settings for a custom element.
 */
export interface ElementParams
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

	/**
	 * Whether the element is visible, hidden or gone completely.
	 *
	 * Note: `hidden` elements still take up space, `none` elements do not.
	 * @default "visible"
	 */
	visibility?: Bindable<ElementVisibility>;
}
