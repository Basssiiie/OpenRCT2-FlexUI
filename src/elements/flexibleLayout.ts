import { WidgetFactory } from "../core/widgetFactory";
import { LayoutElement } from "../layouts/layoutElement";
import { LayoutFactory } from "../layouts/layoutFactory";
import { LayoutFunction } from "../layouts/layoutFunction";
import { Direction } from "../positional/direction";
import { FlexiblePosition } from "../positional/flexiblePosition";
import { ButtonFactory, ButtonParams } from "./button";
import { DropdownFactory, DropdownParams } from "./dropdown";
import { LabelFactory, LabelParams } from "./label";
import { ListViewFactory, ListViewParams } from "./listview";
import { SpinnerFactory, SpinnerParams } from "./spinner";
import { ViewportFactory, ViewportParams } from "./viewport";
import { CustomWidgetFactory, WidgetParams } from "./widget";


export interface FlexibleLayoutParams
{
	/**
	 * Specify the child widgets within this box.
	 */
	content: (builder: FlexibleLayoutBuilder) => void;
}


export interface FlexibleLayoutBuilder
{
	/**
	 * Add a clickable button widget.
	 */
	button(params: ButtonParams & FlexiblePosition): FlexibleLayoutBuilder;

	/**
	 * Add a dropdown widget with one or more selectable options.
	 */
	dropdown(params: DropdownParams & FlexiblePosition): FlexibleLayoutBuilder;

	/**
	 * Add a horizontal row with additional child widgets.
	 */
	horizontal(params: FlexibleLayoutParams & FlexiblePosition): FlexibleLayoutBuilder;

	/**
	 * Add a textual label widget.
	 */
	label(params: LabelParams & FlexiblePosition): FlexibleLayoutBuilder;

	/**
	 * Add a listbox for displaying data in rows and columns.
	 */
	listview(params: ListViewParams & FlexiblePosition): FlexibleLayoutBuilder;

	/**
	 * Add a spinner widget with [+] and [-] buttons.
	 */
	spinner(params: SpinnerParams & FlexiblePosition): FlexibleLayoutBuilder;

	/**
	 * Add a viewport for displaying a location somewhere on the map.
	 */
	viewport(params: ViewportParams & FlexiblePosition): FlexibleLayoutBuilder;

	/**
	 * Add a static custom widget.
	 */
	widget<TWidget extends WidgetParams>(params: TWidget & FlexiblePosition): FlexibleLayoutBuilder;

	/**
	 * Add a vertical row with additional child widgets.
	 */
	vertical(params: FlexibleLayoutParams & FlexiblePosition): FlexibleLayoutBuilder;
}


export const FlexibleLayoutFactory =
{
	/**
	 * Get a flexible layout factory for the specified direction.
	 */
	for(direction: Direction): WidgetFactory<FlexibleLayoutParams>
	{
		return {
			create(output, params): LayoutFunction
			{
				const builder = new LayoutBuilder();
				params.content(builder);
				const children = builder.children;
				const childParams = children.map(c => c.params);

				const layoutFunctions: LayoutFunction[] = [];
				for (let i = 0; i < children.length; i++)
				{
					const child = children[i];
					const layout = child.factory.create(output, child.params);

					layoutFunctions.push(layout);
				}

				return (widgets, area): void =>
				{
					LayoutFactory.flexibleLayout(childParams, area, direction, (idx, subarea) =>
					{
						layoutFunctions[idx](widgets, subarea);
					});
				};
			}
		};
	}
};


class LayoutBuilder implements FlexibleLayoutBuilder
{
	readonly children: LayoutElement<FlexiblePosition, unknown>[] = [];

	/*
	absolute(params: AbsoluteLayoutParams): FlexibleLayoutBuilder
	{

	}
	*/

	button(params: ButtonParams & FlexiblePosition): FlexibleLayoutBuilder
	{
		return this.add(params, ButtonFactory);
	}

	/*
	checkbox(params: Params<CheckboxWidget> & FlexiblePosition): FlexibleLayoutBuilder
	{
		const widget = params as CheckboxWidget;
		widget.type = "checkbox";
		return this.add(widget);
	}
	*/

	dropdown(params: DropdownParams & FlexiblePosition): FlexibleLayoutBuilder
	{
		return this.add(params, DropdownFactory);
	}

	/*
	dropdownSpinner(params: DropdownSpinnerParams & FlexiblePosition): FlexibleLayoutBuilder
	{
		const view = new DropdownSpinner(params);
		this._elements.push(view as Element<WidgetBase>);
		return view;
	}


	groupbox(params: Params<GroupBoxWidget> & FlexiblePosition): FlexibleLayoutBuilder
	{
		const widget = params as GroupBoxWidget;
		widget.type = "groupbox";
		return this.add(widget);
	}
	*/

	horizontal(params: FlexibleLayoutParams & FlexiblePosition): FlexibleLayoutBuilder
	{
		return this.add(params, FlexibleLayoutFactory.for(Direction.Horizontal));
	}

	label(params: LabelParams & FlexiblePosition): FlexibleLayoutBuilder
	{
		return this.add(params, LabelFactory);
	}

	listview(params: ListViewParams & FlexiblePosition): FlexibleLayoutBuilder
	{
		return this.add(params, ListViewFactory);
	}

	spinner(params: SpinnerParams & FlexiblePosition): FlexibleLayoutBuilder
	{
		return this.add(params, SpinnerFactory);
	}

	viewport(params: ViewportParams & FlexiblePosition): FlexibleLayoutBuilder
	{
		return this.add(params, ViewportFactory);
	}

	widget<TWidget extends WidgetParams>(params: TWidget & FlexiblePosition): FlexibleLayoutBuilder
	{
		return this.add(params, CustomWidgetFactory);
	}

	vertical(params: FlexibleLayoutParams & FlexiblePosition): FlexibleLayoutBuilder
	{
		return this.add(params, FlexibleLayoutFactory.for(Direction.Vertical));
	}

	private add<T>(params: FlexiblePosition, factory: WidgetFactory<T>): FlexibleLayoutBuilder
	{
		this.children.push({ params: params, factory: factory as WidgetFactory<unknown> });
		return this;
	}
}
