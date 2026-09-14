import { Bindable } from "@src/bindings/bindable";

/**
 * Whether the element is visible, hidden or gone completely.
 *
 * Note: `hidden` elements still take up space, `none` elements do not.
 */
export type Visibility = "visible" | "hidden" | "none";

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
 * Applies to elements and containers that can be hidden.
 */
export interface Hideable
{
	/**
	 * Whether the element or container is visible, hidden or gone completely. Any children of a container will also be hidden.
	 *
	 * Note: `hidden` elements still take up space, `none` elements do not.
	 * @default "visible"
	 */
	visibility?: Bindable<Visibility>;
}
