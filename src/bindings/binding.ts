import { Store } from "./store";


/**
 * Internally saved binding information.
 */
export interface Binding<W extends WidgetBase, T>
{
	readonly widgetName: string;
	readonly store: Store<T>;
	setter(widget: W, value: T): void;
	unsubscribe(): void;
}
