import { WidgetFactory } from "../core/widgetFactory";



export interface LayoutElement<TPositional, TParams>
{
	params: TPositional & TParams;
	factory: WidgetFactory<TParams>;
}