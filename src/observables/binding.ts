import { Observable } from "./observable";


/**
 * Internally saved binding information.
 */
export interface Binding<W extends WidgetBase, T>
{
	readonly widgetName: string;
	readonly observable: Observable<T>;
	setter(widget: W, value: T): void;
	unsubscribe(): void;
}
