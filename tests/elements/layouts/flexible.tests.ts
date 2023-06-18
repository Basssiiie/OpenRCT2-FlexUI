/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { defaultScale } from "@src/elements/constants";
import { box } from "@src/elements/controls/box";
import { button } from "@src/elements/controls/button";
import { label } from "@src/elements/controls/label";
import { ElementVisibility } from "@src/elements/elementParams";
import { flexible, FlexibleLayoutControl, horizontal, vertical } from "@src/elements/layouts/flexible/flexible";
import { FlexiblePosition } from "@src/elements/layouts/flexible/flexiblePosition";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { parseFlexiblePosition } from "@src/elements/layouts/flexible/parseFlexiblePosition";
import { Parsed } from "@src/positional/parsing/parsed";
import { ScaleType } from "@src/positional/parsing/scaleType";
import { Rectangle } from "@src/positional/rectangle";
import { Event, invoke } from "@src/utilities/event";
import { noop } from "@src/utilities/noop";
import { WidgetBinder } from "@src/windows/binders/widgetBinder";
import { FrameContext } from "@src/windows/frames/frameContext";
import { FrameEvent } from "@src/windows/frames/frameEvent";
import { ParentControl } from "@src/windows/parentControl";
import { addToWidgetMap } from "@src/windows/widgets/widgetMap";
import test from "ava";
import Mock from "openrct2-mocks";


type FlexControl = FlexibleLayoutControl<FlexiblePosition, Parsed<FlexiblePosition>>;

const parentMock: ParentControl<FlexiblePosition> =
{
	parse: parseFlexiblePosition,
	recalculate(): void { /* empty */ }
};
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createBuildOutput()
{
	return {
		widgets: Array<Widget>(),
		binder: new WidgetBinder(),
		context: <FrameContext>{ redraw: noop },
		open: <Event<never>>[],
		redraw: <Event<never>>[],
		update: <Event<never>>[],
		close: <Event<never>>[],
		add(widget: WidgetBaseDesc): void
		{
			this.widgets.push(<Widget>widget);
		},
		on(event: FrameEvent, callback: (context: FrameContext) => void): void
		{
			this[event].push(callback);
		}
	};
}


test("Simple layouts with widgets", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 200, height: 150 };
	const creator = flexible({
		spacing: 0, direction: LayoutDirection.Vertical,
		content: [
			label({ text: "hello world", height: "1w" }),
			horizontal({
				spacing: 0,
				content: [
					button({ text: "left button" }),
					button({ text: "right button" })
				]
			}),
			label({ text: "big area", alignment: "centred", height: "1w" })
		]
	});
	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.type, "label");
	t.is(label1.text, "hello world");
	t.is(label1.x, 0);
	t.is(label1.y, 0 + 2);
	t.is(label1.width, 200);
	t.is(label1.height, 50);

	const button1 = output.widgets[1] as ButtonWidget;
	t.is(button1.type, "button");
	t.is(button1.text, "left button");
	t.is(button1.x, 0);
	t.is(button1.y, 50);
	t.is(button1.width, 100);
	t.is(button1.height, 50);

	const button2 = output.widgets[2] as ButtonWidget;
	t.is(button2.type, "button");
	t.is(button2.text, "right button");
	t.is(button2.x, 100);
	t.is(button2.y, 50);
	t.is(button2.width, 100);
	t.is(button2.height, 50);

	const label2 = output.widgets[3] as LabelWidget;
	t.is(label2.type, "label");
	t.is(label2.text, "big area");
	t.is(label2.textAlign, "centred");
	t.is(label2.x, 0);
	t.is(label2.y, 100 + 2);
	t.is(label2.width, 200);
	t.is(label2.height, 50);
});


test("Pixel sizes ignore leftover space", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 60 };
	const creator = flexible({
		spacing: 0, direction: LayoutDirection.Vertical,
		content: [
			label({
				text: "a", width: "40px", height: "25px"
			}),
			label({
				text: "b", width: "30px", height: "10px"
			}),
			label({
				text: "c", width: "70px", height: "20px"
			})
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 0 + 2);
	t.is(label1.width, 40);
	t.is(label1.height, 25);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 25 + 2);
	t.is(label2.width, 30);
	t.is(label2.height, 10);

	const label3 = output.widgets[2] as LabelWidget;
	t.is(label3.x, 0);
	t.is(label3.y, 35 + 2);
	t.is(label3.width, 70);
	t.is(label3.height, 20);
});


test("Percentage sizes", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 60 };
	const creator = flexible({
		spacing: 0,
		content: [
			label({
				text: "a", width: "50%", height: "20%"
			}),
			label({
				text: "b", width: "10%", height: "45%"
			}),
			label({
				text: "c", width: "75%", height: "15%"
			})
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 0 + 2);
	t.is(label1.width, 30);
	t.is(label1.height, 12);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 12 + 2);
	t.is(label2.width, 6);
	t.is(label2.height, 27);

	const label3 = output.widgets[2] as LabelWidget;
	t.is(label3.x, 0);
	t.is(label3.y, 39 + 2);
	t.is(label3.width, 45);
	t.is(label3.height, 9);
});


test("Weighted sizes", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 60 };
	const creator = flexible({
		spacing: 0,
		content: [
			label({
				text: "a", width: "1w", height: "5w"
			}),
			label({
				text: "b", width: "2w", height: "2w"
			}),
			label({
				text: "c", width: "3w", height: "10w"
			})
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 0 + 2);
	t.is(label1.width, 60);
	t.is(label1.height, 18);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 18 + 2);
	t.is(label2.width, 60);
	t.is(label2.height, 7);

	const label3 = output.widgets[2] as LabelWidget;
	t.is(label3.x, 0);
	t.is(label3.y, 25 + 2);
	t.is(label3.width, 60);
	t.is(label3.height, 35);
});


test("Relative percentage fills leftover space", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 80, height: 80 };
	const creator = flexible({
		spacing: 0,
		content: [
			label({
				text: "a", height: "100%"
			}),
			label({
				text: "b", height: "65px"
			})
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.y, 0 + 2);
	t.is(label1.height, 15);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.y, 15 + 2);
	t.is(label2.height, 65);
});


test("Relative weight fills leftover space", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 60 };
	const creator = flexible({
		spacing: 0,
		content: [
			label({
				text: "a", height: "3w"
			}),
			label({
				text: "b", height: "17px"
			})
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.y, 0 + 2);
	t.is(label1.height, 43);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.y, 43 + 2);
	t.is(label2.height, 17);
});


test("Relative weight takes leftover after relative percentage", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 80, height: 80 };
	const creator = flexible({
		spacing: 0,
		content: [
			label({
				text: "a", height: "25%"
			}),
			label({
				text: "b", height: "1w"
			})
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.y, 0 + 2);
	t.is(label1.height, 20);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.y, 20 + 2);
	t.is(label2.height, 60);
});


test("Padding: single number value", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const creator = flexible({
		spacing: 0,
		content: [
			button({ text: "a", padding: 5 })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget = output.widgets[0];
	t.is(widget.x, 5);
	t.is(widget.y, 5);
	t.is(widget.width, 50);
	t.is(widget.height, 30);
});


test("Padding: single pixel value", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const creator = flexible({
		spacing: 0,
		content: [
			button({ text: "a", padding: "5px" })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget = output.widgets[0];
	t.is(widget.x, 5);
	t.is(widget.y, 5);
	t.is(widget.width, 50);
	t.is(widget.height, 30);
});


test("Padding: single percentage value", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const creator = flexible({
		spacing: 0,
		content: [
			button({ text: "a", height: "60%", padding: "20%" })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget = output.widgets[0];
	t.is(widget.x, 12);
	t.is(widget.y, 8);
	t.is(widget.width, 60 - (2 * 12));
	t.is(widget.height, 24);
});


test("Padding: single weighted value", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 100 };
	const creator = flexible({
		spacing: 0,
		content: [
			button({ text: "a", width: "2w", height: "1w", padding: "0.4w" })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget = output.widgets[0];
	t.is(widget.x, 9);
	t.is(widget.y, 22);
	t.is(widget.width, 43);
	t.is(widget.height, 55);
});


test("Padding: tuple with 2 values", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 48 };
	const creator = flexible({
		spacing: 0,
		content: [
			label({
				text: "a", width: "1w", height: "4w", padding: ["1w", "7px"]
			}),
			label({
				text: "b", width: "80%", height: "6w", padding: ["2w", "10%"]
			})
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.text, "a");
	t.is(label1.x, 7);
	t.is(label1.y, 3 + 2);
	t.is(label1.width, 46);
	t.is(label1.height, 12);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.text, "b");
	t.is(label2.x, 6);
	t.is(label2.y, 12 + 2 + 6 + 6);
	t.is(label2.width, 48);
	t.is(label2.height, 18);
});


test("Padding: weighted value with absolute size", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const creator = flexible({
		spacing: 0,
		content: [
			button({ text: "a", width: "10px", padding: "1w" })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget = output.widgets[0];
	t.is(widget.x, 25);
	t.is(widget.y, 13);
	t.is(widget.width, 10);
	t.is(widget.height, 13);
});


test("Padding: multiple weighted values mixed with absolute sizes", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 5, y: 5, width: 60, height: 100 };
	const creator = flexible({
		spacing: "0.5w",
		content: [
			button({ text: "a", width: "1w", height: "1w" }),
			button({ text: "b", width: "10px", height: "1w", padding: [ "8px", "1w" ] })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget1 = output.widgets[0] as ButtonWidget;
	t.is(widget1.text, "a");
	t.is(widget1.x, 5);
	t.is(widget1.y, 5);
	t.is(widget1.width, 60);
	t.is(widget1.height, 34);

	const widget2 = output.widgets[1] as ButtonWidget;
	t.is(widget2.text, "b");
	t.is(widget2.x, 5 + 25);
	t.is(widget2.y, 5 + 34 + 16 + 8);
	t.is(widget2.width, 10);
	t.is(widget2.height, 34);
});


test("Padding: included in cursor tracking", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 5, y: 5, width: 60, height: 100 };
	const creator = flexible({
		spacing: 3,
		content: [
			button({ text: "a", height: 30, padding: 12 }),
			button({ text: "b" })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget1 = output.widgets[0] as ButtonWidget;
	t.is(widget1.text, "a");
	t.is(widget1.x, 5 + 12);
	t.is(widget1.y, 5 + 12);
	t.is(widget1.width, 60 - 24);
	t.is(widget1.height, 30);

	const widget2 = output.widgets[1] as ButtonWidget;
	t.is(widget2.text, "b");
	t.is(widget2.x, 5);
	t.is(widget2.y, 5 + 24 + 30 + 3);
	t.is(widget2.width, 60);
	t.is(widget2.height, 100 - (24 + 30 + 3));
});


test("Padding: used as spacing for single element", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 5, y: 5, width: 100, height: 30 };
	const creator = flexible({
		spacing: 3, padding: 0, direction: LayoutDirection.Horizontal,
		content: [
			button({ text: "a", width: 16 }),
			button({ text: "b", width: 17 }),
			button({ text: "c", width: 18, padding: { left: "1w" } })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget1 = output.widgets[0] as ButtonWidget;
	t.is(widget1.text, "a");
	t.is(widget1.x, 5);
	t.is(widget1.y, 5);
	t.is(widget1.width, 16);
	t.is(widget1.height, 30);

	const widget2 = output.widgets[1] as ButtonWidget;
	t.is(widget2.text, "b");
	t.is(widget2.x, 5 + 16 + 3);
	t.is(widget2.y, 5);
	t.is(widget2.width, 17);
	t.is(widget2.height, 30);

	const widget3 = output.widgets[2] as ButtonWidget;
	t.is(widget3.text, "c");
	t.is(widget3.x, 5 + (100 - 18));
	t.is(widget3.y, 5);
	t.is(widget3.width, 18);
	t.is(widget3.height, 30);
});


test("Works without children", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 60 };
	const creator = flexible({
		content: []
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widgets = output.widgets;
	t.is(widgets.length, 0);
});


test("Spacing: 10 pixels between two elements", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const creator = flexible({
		spacing: 10, direction: LayoutDirection.Horizontal,
		content: [
			button({ text: "a" }),
			button({ text: "b" })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget1 = output.widgets[0];
	t.is(widget1.x, 0);
	t.is(widget1.y, 0);
	t.is(widget1.width, 25);
	t.is(widget1.height, 40);

	const widget2 = output.widgets[1];
	t.is(widget2.x, 35);
	t.is(widget2.y, 0);
	t.is(widget2.width, 25);
	t.is(widget2.height, 40);
});


test("Spacing: default space between two elements", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 7, y: 20, width: 78, height: 35 };
	const creator = flexible({
		content: [
			label({ text: "a" }),
			label({ text: "b" })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 7);
	t.is(label1.y, 20 + 2);
	t.is(label1.width, 78);
	t.is(label1.height, 14);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.x, 7);
	t.is(label2.y, 38 + 2);
	t.is(label2.width, 78);
	t.is(label2.height, 14);
});


test("Spacing: percentile space between two elements", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 5, y: 10, width: 50, height: 15 };
	const creator = flexible({
		spacing: "20%", direction: LayoutDirection.Horizontal,
		content: [
			label({ text: "a", width: "40%" }),
			label({ text: "b", width: "40%" })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 5);
	t.is(label1.y, 10 + 2);
	t.is(label1.width, 20);
	t.is(label1.height, 14);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.x, 35);
	t.is(label2.y, 10 + 2);
	t.is(label2.width, 20);
	t.is(label2.height, 14);
});


test("Spacing: weighted space between two elements", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 5, y: 0, width: 30, height: 15 };
	const creator = flexible({
		spacing: "1w", direction: LayoutDirection.Horizontal,
		content: [
			label({ text: "a", width: "1w" }),
			label({ text: "b", width: "1w" })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 5);
	t.is(label1.y, 0 + 2);
	t.is(label1.width, 10);
	t.is(label1.height, 14);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.x, 25);
	t.is(label2.y, 0 + 2);
	t.is(label2.width, 10);
	t.is(label2.height, 14);
});


test("Absolute children make parent absolutely sized", t =>
{
	const output = createBuildOutput();
	const creator = flexible({
		spacing: 0, direction: LayoutDirection.Horizontal,
		content: [
			label({ text: "a", width: 20, height: "12px" }),
			label({ text: "b", width: 15, height: "5px" })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	invoke(output.redraw);

	const pos = control.position;
	t.deepEqual(pos.width, [35, ScaleType.Pixel]);
	t.deepEqual(pos.height, [12, ScaleType.Pixel]);
});


test("Absolutely sized parent includes spacing", t =>
{
	const output = createBuildOutput();
	const creator = flexible({
		spacing: 8, direction: LayoutDirection.Horizontal,
		content: [
			label({ text: "a", width: 20, height: "12px" }),
			label({ text: "b", width: 15, height: "5px" })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	invoke(output.redraw);

	const pos = control.position;
	t.deepEqual(pos.width, [35 + 8, ScaleType.Pixel]);
	t.deepEqual(pos.height, [12, ScaleType.Pixel]);
});


test("Absolute children make all parents absolutely sized", t =>
{
	const output = createBuildOutput();
	const creator = flexible({
		direction: LayoutDirection.Horizontal,
		content: [
			flexible({
				direction: LayoutDirection.Vertical,
				content: [
					label({ text: "a", width: 20, height: "12px" }),
					label({ text: "b", width: 15, height: "5px" })
				]
			}),
			label({ text: "c", width: "20px", height: "10px" }),
			flexible({
				direction: LayoutDirection.Horizontal,
				content: [
					label({ text: "c", width: "33px", height: 11 }),
					label({ text: "d", width: 8, height: "51px" })
				]
			})
		]
	});
	const control = <FlexControl>creator(parentMock, output);
	invoke(output.redraw);

	const pos = control.position;
	t.deepEqual(pos.width, [20 + 20 + 33 + 8 + (3 * 4), ScaleType.Pixel]);
	t.deepEqual(pos.height, [51, ScaleType.Pixel]);
});


test("Single non-absolute child width makes parents width unknown", t =>
{
	const output = createBuildOutput();
	const creator = flexible({
		direction: LayoutDirection.Horizontal,
		content: [
			flexible({
				direction: LayoutDirection.Vertical,
				content: [
					label({ text: "a", width: 20, height: "12px" }),
					label({ text: "b", width: "1w", height: "5px" }) // <- non-absolute
				]
			}),
			label({ text: "c", width: "10px", height: "20px" }),
			flexible({
				direction: LayoutDirection.Horizontal,
				content: [
					label({ text: "c", width: "33px", height: 11 }),
					label({ text: "d", width: 8, height: "51px" })
				]
			})
		]
	});
	const control = <FlexControl>creator(parentMock, output);
	invoke(output.redraw);

	const pos = control.position;
	t.deepEqual(pos.width, defaultScale);
	t.deepEqual(pos.height, [51, ScaleType.Pixel]);
});


test("Single non-absolute child height makes parents height unknown", t =>
{
	const output = createBuildOutput();
	const creator = flexible({
		direction: LayoutDirection.Horizontal,
		content: [
			flexible({
				direction: LayoutDirection.Vertical,
				content: [
					label({ text: "a", width: 20, height: "12px" }),
					label({ text: "b", width: 15, height: "5px" })
				]
			}),
			label({ text: "c", width: "10px", height: "20px" }),
			flexible({
				direction: LayoutDirection.Horizontal,
				content: [
					label({ text: "d", width: "33px", height: 11 }),
					label({ text: "e", width: 8, height: "60%" }) // <- non-absolute
				]
			})
		]
	});
	const control = <FlexControl>creator(parentMock, output);
	invoke(output.redraw);

	const pos = control.position;
	t.deepEqual(pos.width, [20 + 10 + 33 + 8 + (3 * 4), ScaleType.Pixel]);
	t.deepEqual(pos.height, defaultScale);
});


test("Nested layouts with boxed labels using percentage padding", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 32, y: 15, width: 240, height: 180 };
	const creator = vertical({
		spacing: "0px",
		content: [
			horizontal({
				spacing: "0px",
				content: [
					box({
						text:  "b-a",
						content: label({ text: "l-a", padding: [ "50%", 0 ] })
					}),
					box({
						text:  "b-b",
						content: label({ text: "l-b", padding: [ "50%", 0 ] })
					})
				]
			}),
			vertical({
				spacing: "0px",
				content: [
					box({
						text:  "b-c",
						content: label({ text: "l-c", padding: [ "50%", 0 ] })
					}),
					box({
						text:  "b-d",
						content: label({ text: "l-d", padding: [ "50%", 0 ] })
					})
				]
			})
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const box1 = output.widgets[0] as LabelWidget;
	t.is(box1.text, "b-a");
	t.is(box1.x, 0 + 32);
	t.is(box1.y, 0 + 15);
	t.is(box1.width, 120);
	t.is(box1.height, 90);

	const label1 = output.widgets[1] as LabelWidget;
	t.is(label1.text, "l-a");
	t.is(label1.x, 0 + 32);
	t.is(label1.y, 45 + 2 + 15 - 7);
	t.is(label1.width, 120);
	t.is(label1.height, 14);

	const box2 = output.widgets[2] as LabelWidget;
	t.is(box2.text, "b-b");
	t.is(box2.x, 120 + 32);
	t.is(box2.y, 0 + 15);
	t.is(box2.width, 120);
	t.is(box2.height, 90);

	const label2 = output.widgets[3] as LabelWidget;
	t.is(label2.text, "l-b");
	t.is(label2.x, 120 + 32);
	t.is(label2.y, 45 + 2 + 15 - 7);
	t.is(label2.width, 120);
	t.is(label2.height, 14);

	const box3 = output.widgets[4] as LabelWidget;
	t.is(box3.text, "b-c");
	t.is(box3.x, 0 + 32);
	t.is(box3.y, 90 + 15);
	t.is(box3.width, 240);
	t.is(box3.height, 45);

	const label3 = output.widgets[5] as LabelWidget;
	t.is(label3.text, "l-c");
	t.is(label3.x, 0 + 32);
	t.is(label3.y, 90 + 2 + 23 + 15 - 7);
	t.is(label3.width, 240);
	t.is(label3.height, 14);

	const box4 = output.widgets[6] as LabelWidget;
	t.is(box4.text, "b-d");
	t.is(box4.x, 0 + 32);
	t.is(box4.y, 135 + 15);
	t.is(box4.width, 240);
	t.is(box4.height, 45);

	const label4 = output.widgets[7] as LabelWidget;
	t.is(label4.text, "l-d");
	t.is(label4.x, 0 + 32);
	t.is(label4.y, 135 + 2 + 23 + 15 - 7);
	t.is(label4.width, 240);
	t.is(label4.height, 14);
});


test("Child with visibility 'none' is not updated", t =>
{
	globalThis.ui = Mock.ui();
	const output = createBuildOutput();
	const rect: Rectangle = { x: 28, y: 20, width: 43, height: 60 };
	const creator = flexible({
		spacing: 10,
		content: [
			label({ text: "abc", height: "1w" }),
			label({ text: "nada", visibility: "none" }),
			label({ text: "def", height: "1w" }),
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widgets = output.widgets;
	t.is(widgets.length, 3);

	const widget1 = output.widgets[0] as LabelWidget;
	t.is(widget1.text, "abc");
	t.is(widget1.x, 28);
	t.is(widget1.y, 20 + 2);
	t.is(widget1.width, 43);
	t.is(widget1.height, 25);

	const widget2 = output.widgets[1] as LabelWidget;
	t.is(widget2.text, "nada");
	t.is(widget2.x, 0);
	t.is(widget2.y, 0);
	t.is(widget2.width, 0);
	t.is(widget2.height, 0);

	const widget3 = output.widgets[2] as LabelWidget;
	t.is(widget3.text, "def");
	t.is(widget3.x, 28);
	t.is(widget3.y, 20 + 2 + 25 + 10);
	t.is(widget3.width, 43);
	t.is(widget3.height, 25);
});


test("None update if all children have visibility set to 'none'", t =>
{
	globalThis.ui = Mock.ui();
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 60 };
	const creator = flexible({
		content: [
			label({ text: "abc", visibility: "none" }),
			label({ text: "def", visibility: "none" }),
			label({ text: "ghi", visibility: "none" }),
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widgets = output.widgets;
	t.is(widgets.length, 3);

	const widget1 = output.widgets[0] as LabelWidget;
	t.is(widget1.text, "abc");
	t.is(widget1.x, 0);
	t.is(widget1.y, 0);
	t.is(widget1.width, 0);
	t.is(widget1.height, 0);

	const widget2 = output.widgets[1] as LabelWidget;
	t.is(widget2.text, "def");
	t.is(widget2.x, 0);
	t.is(widget2.y, 0);
	t.is(widget2.width, 0);
	t.is(widget2.height, 0);

	const widget3 = output.widgets[2] as LabelWidget;
	t.is(widget3.text, "ghi");
	t.is(widget3.x, 0);
	t.is(widget3.y, 0);
	t.is(widget3.width, 0);
	t.is(widget3.height, 0);
});


test("Child visibility is updated by store", t =>
{
	globalThis.ui = Mock.ui();
	const output = createBuildOutput();
	const rect: Rectangle = { x: 28, y: 3, width: 43, height: 80 };
	const visibility = store<ElementVisibility>("visible");
	const creator = flexible({
		spacing: 10,
		content: [
			label({ text: "abc", height: "1w" }),
			label({ text: "wow", height: "1w", visibility }),
			label({ text: "def", height: "1w" }),
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widgets = output.widgets;
	t.is(widgets.length, 3);

	const widget1 = output.widgets[0] as LabelWidget;
	const widget2 = output.widgets[1] as LabelWidget;
	const widget3 = output.widgets[2] as LabelWidget;
	t.is(widget1.y, 3 + 2);
	t.is(widget2.y, 3 + 2 + 10 + 20);
	t.is(widget3.y, 3 + 2 + 10 + 20 + 10 + 20);
	t.is(widget1.height, 20);
	t.is(widget2.height, 20);
	t.is(widget3.height, 20);

	visibility.set("none");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.y, 3 + 2);
	t.is(widget3.y, 3 + 2 + 10 + 35);
	t.is(widget1.height, 35);
	t.is(widget3.height, 35);

	visibility.set("visible");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.y, 3 + 2);
	t.is(widget2.y, 3 + 2 + 10 + 20);
	t.is(widget3.y, 3 + 2 + 10 + 20 + 10 + 20);
	t.is(widget1.height, 20);
	t.is(widget2.height, 20);
	t.is(widget3.height, 20);
});


test("Invisible childs should still count for size inheritance", t =>
{
	globalThis.ui = Mock.ui();
	const output = createBuildOutput();
	const rect: Rectangle = { x: 28, y: 3, width: 43, height: 50 };
	const visibility = store<ElementVisibility>("visible");
	const creator = flexible({
		spacing: 10,
		content: [
			label({ text: "abc", width: 10, height: "15px" }),
			label({ text: "wow", width: "1w", height: "1w", visibility }),
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widgets = output.widgets;
	t.is(widgets.length, 2);

	const widget1 = output.widgets[0] as LabelWidget;
	const widget2 = output.widgets[1] as LabelWidget;
	t.is(widget1.y, 3 + 2);
	t.is(widget2.y, 3 + 2 + 10 + 15);
	t.is(widget1.height, 15);
	t.is(widget2.height, 25);
	const position = control.position;
	t.deepEqual(position.width, defaultScale);
	t.deepEqual(position.height, defaultScale);

	visibility.set("none");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.y, 3 + 2);
	t.is(widget1.height, 15);
	t.deepEqual(position.width, defaultScale);
	t.deepEqual(position.height, defaultScale);

	visibility.set("visible");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.y, 3 + 2);
	t.is(widget2.y, 3 + 2 + 10 + 15);
	t.is(widget1.height, 15);
	t.is(widget2.height, 25);
	t.deepEqual(position.width, defaultScale);
	t.deepEqual(position.height, defaultScale);
});


test("Rounding: uneven sizes get rounded inwards", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 3, y: 5, width: 37, height: 23 };
	const creator = flexible({
		spacing: 0,
		content: [
			button({ text: "a" }),
			button({ text: "b" })
		]
	});

	const control = <FlexControl>creator(parentMock, output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 3);
	t.is(label1.y, 5);
	t.is(label1.width, 37);
	t.is(label1.height, 11); // 11 instead of 11.5

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.x, 3);
	t.is(label2.y, 5 + 12);  // 12 instead of 11.5
	t.is(label2.width, 37);
	t.is(label2.height, 11);  // 11 instead of 11.5
});