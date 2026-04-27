/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { read } from "@src/bindings/stores/read";
import { box } from "@src/elements/controls/box";
import { button } from "@src/elements/controls/button";
import { label } from "@src/elements/controls/label";
import { ElementVisibility } from "@src/elements/elementParams";
import { flexible, FlexibleLayoutControl, horizontal, vertical } from "@src/elements/layouts/flexible/flexible";
import { FlexiblePosition } from "@src/elements/layouts/flexible/flexiblePosition";
import { LayoutDirection } from "@src/elements/layouts/flexible/layoutDirection";
import { Rectangle } from "@src/positional/rectangle";
import { Scale } from "@src/positional/scale";
import { Event, invoke } from "@src/utilities/event";
import { noop } from "@src/utilities/noop";
import { WidgetBinder } from "@src/windows/binders/widgetBinder";
import { FrameContext } from "@src/windows/frames/frameContext";
import { FrameEvent } from "@src/windows/frames/frameEvent";
import { addToWidgetMap } from "@src/windows/widgets/widgetMap";
import test from "ava";
import Mock from "openrct2-mocks";


type FlexControl = FlexibleLayoutControl<FlexiblePosition>;

function createBuildOutput()
{
	return {
		widgets: new Array<Widget>(),
		binder: new WidgetBinder(),
		context: <FrameContext>{ redraw: noop },
		open: <Event>[],
		redraw: <Event>[],
		update: <Event>[],
		close: <Event>[],
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

function createFrame(output: { widgets: Widget[]; redraw: Event }): FrameContext
{
	return {
		isOpen(): boolean
		{
			return true;
		},
		getWidget(name: string): Widget | null
		{
			return output.widgets.find(w => w.name == name) || null;
		},
		redraw(): void
		{
			invoke(output.redraw);
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
	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = <LabelWidget>output.widgets[0];
	t.is(label1.type, "label");
	t.is(label1.text, "hello world");
	t.is(label1.x, 0);
	t.is(label1.y, 0 + 2);
	t.is(label1.width, 200);
	t.is(label1.height, 50);

	const button1 = <ButtonWidget>output.widgets[1];
	t.is(button1.type, "button");
	t.is(button1.text, "left button");
	t.is(button1.x, 0);
	t.is(button1.y, 50);
	t.is(button1.width, 100);
	t.is(button1.height, 50);

	const button2 = <ButtonWidget>output.widgets[2];
	t.is(button2.type, "button");
	t.is(button2.text, "right button");
	t.is(button2.x, 100);
	t.is(button2.y, 50);
	t.is(button2.width, 100);
	t.is(button2.height, 50);

	const label2 = <LabelWidget>output.widgets[3];
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = <LabelWidget>output.widgets[0];
	t.is(label1.x, 0);
	t.is(label1.y, 0 + 2);
	t.is(label1.width, 40);
	t.is(label1.height, 25);

	const label2 = <LabelWidget>output.widgets[1];
	t.is(label2.x, 0);
	t.is(label2.y, 25 + 2);
	t.is(label2.width, 30);
	t.is(label2.height, 10);

	const label3 = <LabelWidget>output.widgets[2];
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = <LabelWidget>output.widgets[0];
	t.is(label1.x, 0);
	t.is(label1.y, 0 + 2);
	t.is(label1.width, 30);
	t.is(label1.height, 12);

	const label2 = <LabelWidget>output.widgets[1];
	t.is(label2.x, 0);
	t.is(label2.y, 12 + 2);
	t.is(label2.width, 6);
	t.is(label2.height, 27);

	const label3 = <LabelWidget>output.widgets[2];
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = <LabelWidget>output.widgets[0];
	t.is(label1.x, 0);
	t.is(label1.y, 0 + 2);
	t.is(label1.width, 60);
	t.is(label1.height, 18);

	const label2 = <LabelWidget>output.widgets[1];
	t.is(label2.x, 0);
	t.is(label2.y, 18 + 2);
	t.is(label2.width, 60);
	t.is(label2.height, 7);

	const label3 = <LabelWidget>output.widgets[2];
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = <LabelWidget>output.widgets[0];
	t.is(label1.y, 0 + 2);
	t.is(label1.height, 15);

	const label2 = <LabelWidget>output.widgets[1];
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = <LabelWidget>output.widgets[0];
	t.is(label1.y, 0 + 2);
	t.is(label1.height, 43);

	const label2 = <LabelWidget>output.widgets[1];
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = <LabelWidget>output.widgets[0];
	t.is(label1.y, 0 + 2);
	t.is(label1.height, 20);

	const label2 = <LabelWidget>output.widgets[1];
	t.is(label2.y, 20 + 2);
	t.is(label2.height, 60);
});


test("Mixed pixel, percentage, and weighted sizes", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 100, height: 50 };
	const creator = flexible({
		spacing: 0,
		direction: LayoutDirection.Horizontal,
		content: [
			button({ text: "a", width: "30px" }),
			button({ text: "b", width: "50%" }),
			button({ text: "c", width: "2w" })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget1 = output.widgets[0];
	t.is(widget1.x, 0);
	t.is(widget1.y, 0);
	t.is(widget1.width, 30); // 30px out of 100px
	t.is(widget1.height, 50);

	const widget2 = output.widgets[1];
	t.is(widget2.x, 30);
	t.is(widget2.y, 0);
	t.is(widget2.width, 35); // 50% of leftover 70px
	t.is(widget2.height, 50);

	const widget3 = output.widgets[2];
	t.is(widget3.x, 65);
	t.is(widget3.y, 0);
	t.is(widget3.width, 35); // rest
	t.is(widget3.height, 50);
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

	const control = <FlexControl>creator.create(output);
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

	const control = <FlexControl>creator.create(output);
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

	const control = <FlexControl>creator.create(output);
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget = output.widgets[0];
	t.is(widget.x, 9); // (60 / 2.8) * 0.4
	t.is(widget.y, 22);	// (100 / 1.8) * 0.4
	t.is(widget.width, 43); // (60 / 2.8) * 2
	t.is(widget.height, 56); // (100 / 1.8) * 1
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = <LabelWidget>output.widgets[0];
	t.is(label1.text, "a");
	t.is(label1.x, 7);
	t.is(label1.y, 3 + 2);
	t.is(label1.width, 46);
	t.is(label1.height, 12);

	const label2 = <LabelWidget>output.widgets[1];
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

	const control = <FlexControl>creator.create(output);
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
			button({ text: "b", width: "10px", height: "1w", padding: ["8px", "1w"] })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget1 = <ButtonWidget>output.widgets[0];
	t.is(widget1.text, "a");
	t.is(widget1.x, 5);
	t.is(widget1.y, 5);
	t.is(widget1.width, 60);
	t.is(widget1.height, 34);

	const widget2 = <ButtonWidget>output.widgets[1];
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget1 = <ButtonWidget>output.widgets[0];
	t.is(widget1.text, "a");
	t.is(widget1.x, 5 + 12);
	t.is(widget1.y, 5 + 12);
	t.is(widget1.width, 60 - 24);
	t.is(widget1.height, 30);

	const widget2 = <ButtonWidget>output.widgets[1];
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget1 = <ButtonWidget>output.widgets[0];
	t.is(widget1.text, "a");
	t.is(widget1.x, 5);
	t.is(widget1.y, 5);
	t.is(widget1.width, 16);
	t.is(widget1.height, 30);

	const widget2 = <ButtonWidget>output.widgets[1];
	t.is(widget2.text, "b");
	t.is(widget2.x, 5 + 16 + 3);
	t.is(widget2.y, 5);
	t.is(widget2.width, 17);
	t.is(widget2.height, 30);

	const widget3 = <ButtonWidget>output.widgets[2];
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widgets = output.widgets;
	t.is(widgets.length, 0);
});


test("Layout with zero-size area", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 0, height: 0 };
	const creator = flexible({
		spacing: 0,
		content: [
			button({ text: "a" }),
			button({ text: "b" })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget1 = output.widgets[0];
	t.is(widget1.x, 0);
	t.is(widget1.y, 0);
	t.true(widget1.width === 0);
	t.true(widget1.height === 0);

	const widget2 = output.widgets[1];
	t.is(widget2.x, 0);
	t.is(widget2.y, 0);
	t.true(widget2.width === 0);
	t.true(widget2.height === 0);
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

	const control = <FlexControl>creator.create(output);
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = <LabelWidget>output.widgets[0];
	t.is(label1.x, 7);
	t.is(label1.y, 20 + 2);
	t.is(label1.width, 78);
	t.is(label1.height, 14);

	const label2 = <LabelWidget>output.widgets[1];
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = <LabelWidget>output.widgets[0];
	t.is(label1.x, 5);
	t.is(label1.y, 10 + 2);
	t.is(label1.width, 20);
	t.is(label1.height, 14);

	const label2 = <LabelWidget>output.widgets[1];
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = <LabelWidget>output.widgets[0];
	t.is(label1.x, 5);
	t.is(label1.y, 0 + 2);
	t.is(label1.width, 10);
	t.is(label1.height, 14);

	const label2 = <LabelWidget>output.widgets[1];
	t.is(label2.x, 25);
	t.is(label2.y, 0 + 2);
	t.is(label2.width, 10);
	t.is(label2.height, 14);
});


test("Spacing: pixel space between three elements", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 90, height: 40 };
	const creator = flexible({
		spacing: 15, direction: LayoutDirection.Horizontal,
		content: [
			button({ text: "a" }),
			button({ text: "b" }),
			button({ text: "c" })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	// 3 elements, 2 gaps of 15 = 30px, leftover = 60, each = 20
	const widget1 = output.widgets[0];
	t.is(widget1.x, 0);
	t.is(widget1.y, 0);
	t.is(widget1.width, 20);
	t.is(widget1.height, 40);

	const widget2 = output.widgets[1];
	t.is(widget2.x, 35);
	t.is(widget2.y, 0);
	t.is(widget2.width, 20);
	t.is(widget2.height, 40);

	const widget3 = output.widgets[2];
	t.is(widget3.x, 70);
	t.is(widget3.y, 0);
	t.is(widget3.width, 20);
	t.is(widget3.height, 40);
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

	creator.create(output);
	invoke(output.redraw);

	const pos = creator.position;
	t.is(pos.width, 35);
	t.is(pos.height, 12);
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

	creator.create(output);
	invoke(output.redraw);

	const pos = creator.position;
	t.is(pos.width, 35 + 8);
	t.is(pos.height, 12);
});


test("Non-absolute spacing makes inherited parent size unknown", t =>
{
	const output = createBuildOutput();
	const creator = flexible({
		spacing: "1w", direction: LayoutDirection.Horizontal,
		content: [
			label({ text: "a", width: 20, height: "12px" }),
			label({ text: "b", width: 15, height: "5px" })
		]
	});

	creator.create(output);
	invoke(output.redraw);

	const pos = creator.position;
	t.is(pos.width, undefined);
	t.is(pos.height, 12);
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
	creator.create(output);
	invoke(output.redraw);

	const pos = creator.position;
	t.is(pos.width, 20 + 20 + 33 + 8 + (3 * 4));
	t.is(pos.height, 51);
});


test("Other axis uses biggest child size for parent inheritance", t =>
{
	const output = createBuildOutput();
	const creator = flexible({
		spacing: 0, direction: LayoutDirection.Vertical,
		content: [
			label({ text: "a", width: 10, height: "8px" }),
			label({ text: "b", width: 25, height: "12px" }),
			label({ text: "c", width: 15, height: "6px" })
		]
	});

	creator.create(output);
	invoke(output.redraw);

	const pos = creator.position;
	t.is(pos.width, 25); // max(10, 25, 15)
	t.is(pos.height, 26); // 8 + 12 + 6
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
	creator.create(output);
	invoke(output.redraw);

	const pos = creator.position;
	t.is(pos.width, undefined);
	t.is(pos.height, 51);
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
	creator.create(output);
	invoke(output.redraw);

	const pos = creator.position;
	t.is(pos.width, 20 + 10 + 33 + 8 + (3 * 4));
	t.is(pos.height, undefined);
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
						text: "b-a",
						content: label({ text: "l-a", padding: ["50%", 0] })
					}),
					box({
						text: "b-b",
						content: label({ text: "l-b", padding: ["50%", 0] })
					})
				]
			}),
			vertical({
				spacing: "0px",
				content: [
					box({
						text: "b-c",
						content: label({ text: "l-c", padding: ["50%", 0] })
					}),
					box({
						text: "b-d",
						content: label({ text: "l-d", padding: ["50%", 0] })
					})
				]
			})
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const box1 = <LabelWidget>output.widgets[0];
	t.is(box1.text, "b-a");
	t.is(box1.x, 0 + 32);
	t.is(box1.y, 0 + 15);
	t.is(box1.width, 120);
	t.is(box1.height, 90);

	const label1 = <LabelWidget>output.widgets[1];
	t.is(label1.text, "l-a");
	t.is(label1.x, 0 + 32);
	t.is(label1.y, 45 + 2 + 15 - 7);
	t.is(label1.width, 120);
	t.is(label1.height, 14);

	const box2 = <LabelWidget>output.widgets[2];
	t.is(box2.text, "b-b");
	t.is(box2.x, 120 + 32);
	t.is(box2.y, 0 + 15);
	t.is(box2.width, 120);
	t.is(box2.height, 90);

	const label2 = <LabelWidget>output.widgets[3];
	t.is(label2.text, "l-b");
	t.is(label2.x, 120 + 32);
	t.is(label2.y, 45 + 2 + 15 - 7);
	t.is(label2.width, 120);
	t.is(label2.height, 14);

	const box3 = <LabelWidget>output.widgets[4];
	t.is(box3.text, "b-c");
	t.is(box3.x, 0 + 32);
	t.is(box3.y, 90 + 15);
	t.is(box3.width, 240);
	t.is(box3.height, 45);

	const label3 = <LabelWidget>output.widgets[5];
	t.is(label3.text, "l-c");
	t.is(label3.x, 0 + 32);
	t.is(label3.y, 90 + 2 + 23 + 15 - 7);
	t.is(label3.width, 240);
	t.is(label3.height, 14);

	const box4 = <LabelWidget>output.widgets[6];
	t.is(box4.text, "b-d");
	t.is(box4.x, 0 + 32);
	t.is(box4.y, 135 + 15);
	t.is(box4.width, 240);
	t.is(box4.height, 45);

	const label4 = <LabelWidget>output.widgets[7];
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
			label({ text: "def", height: "1w" })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widgets = output.widgets;
	t.is(widgets.length, 3);

	const widget1 = <LabelWidget>output.widgets[0];
	t.is(widget1.text, "abc");
	t.is(widget1.x, 28);
	t.is(widget1.y, 20 + 2);
	t.is(widget1.width, 43);
	t.is(widget1.height, 25);
	t.is<boolean | undefined, boolean | undefined>(widget1.isVisible, undefined); // unset defaults to true

	const widget2 = <LabelWidget>output.widgets[1];
	t.is(widget2.text, "nada");
	t.is(widget2.x, 0);
	t.is(widget2.y, 0);
	t.is(widget2.width, 0);
	t.is(widget2.height, 0);
	t.false(widget2.isVisible);

	const widget3 = <LabelWidget>output.widgets[2];
	t.is(widget3.text, "def");
	t.is(widget3.x, 28);
	t.is(widget3.y, 20 + 2 + 25 + 10);
	t.is(widget3.width, 43);
	t.is(widget3.height, 25);
	t.is<boolean | undefined, boolean | undefined>(widget3.isVisible, undefined); // unset defaults to true
});


test("Child with visibility 'hidden' still takes up space", t =>
{
	globalThis.ui = Mock.ui();
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 80 };
	const creator = flexible({
		spacing: 10,
		content: [
			label({ text: "abc", height: "1w" }),
			label({ text: "hidden-one", height: "1w", visibility: "hidden" }),
			label({ text: "def", height: "1w" })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	const frame = createFrame(output);
	output.binder._bind(frame);
	control.layout(widgetMap, rect);

	const widget1 = <LabelWidget>output.widgets[0];
	t.is(widget1.text, "abc");
	t.is(widget1.x, 0);
	t.is(widget1.y, 0 + 2);
	t.is(widget1.width, 60);
	t.is(widget1.height, 20);
	t.is<boolean | undefined, boolean | undefined>(widget1.isVisible, undefined); // unset defaults to true

	const widget2 = <LabelWidget>output.widgets[1];
	t.is(widget2.text, "hidden-one");
	t.is(widget2.x, 0);
	t.is(widget2.y, 30 + 2);
	t.is(widget2.width, 60);
	t.is(widget2.height, 20);
	t.false(widget2.isVisible);

	const widget3 = <LabelWidget>output.widgets[2];
	t.is(widget3.text, "def");
	t.is(widget3.x, 0);
	t.is(widget3.y, 60 + 2);
	t.is(widget3.width, 60);
	t.is(widget3.height, 20);
	t.is<boolean | undefined, boolean | undefined>(widget1.isVisible, undefined); // unset defaults to true
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
			label({ text: "ghi", visibility: "none" })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	const frame = createFrame(output);
	output.binder._bind(frame);
	control.layout(widgetMap, rect);

	const widgets = output.widgets;
	t.is(widgets.length, 3);

	const widget1 = <LabelWidget>output.widgets[0];
	t.is(widget1.text, "abc");
	t.is(widget1.x, 0);
	t.is(widget1.y, 0);
	t.is(widget1.width, 0);
	t.is(widget1.height, 0);
	t.false(widget1.isVisible);

	const widget2 = <LabelWidget>output.widgets[1];
	t.is(widget2.text, "def");
	t.is(widget2.x, 0);
	t.is(widget2.y, 0);
	t.is(widget2.width, 0);
	t.is(widget2.height, 0);
	t.false(widget2.isVisible);

	const widget3 = <LabelWidget>output.widgets[2];
	t.is(widget3.text, "ghi");
	t.is(widget3.x, 0);
	t.is(widget3.y, 0);
	t.is(widget3.width, 0);
	t.is(widget3.height, 0);
	t.false(widget3.isVisible);
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
			label({ text: "def", height: "1w" })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	const frame = createFrame(output);
	output.binder._bind(frame);
	control.layout(widgetMap, rect);

	const widgets = output.widgets;
	t.is(widgets.length, 3);

	const widget1 = <LabelWidget>output.widgets[0];
	const widget2 = <LabelWidget>output.widgets[1];
	const widget3 = <LabelWidget>output.widgets[2];
	t.is(widget1.y, 3 + 2);
	t.is(widget2.y, 3 + 2 + 10 + 20);
	t.is(widget3.y, 3 + 2 + 10 + 20 + 10 + 20);
	t.is(widget1.height, 20);
	t.is(widget2.height, 20);
	t.is(widget3.height, 20);
	t.true(widget2.isVisible);
	t.is<boolean | undefined, boolean | undefined>(widget1.isVisible, undefined); // unset defaults to true
	t.is<boolean | undefined, boolean | undefined>(widget3.isVisible, undefined); // unset defaults to true

	visibility.set("none");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.y, 3 + 2);
	t.is(widget3.y, 3 + 2 + 10 + 35);
	t.is(widget1.height, 35);
	t.is(widget3.height, 35);
	t.false(widget2.isVisible);
	t.is<boolean | undefined, boolean | undefined>(widget1.isVisible, undefined); // unset defaults to true
	t.is<boolean | undefined, boolean | undefined>(widget3.isVisible, undefined); // unset defaults to true

	visibility.set("visible");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.y, 3 + 2);
	t.is(widget2.y, 3 + 2 + 10 + 20);
	t.is(widget3.y, 3 + 2 + 10 + 20 + 10 + 20);
	t.is(widget1.height, 20);
	t.is(widget2.height, 20);
	t.is(widget3.height, 20);
	t.true(widget2.isVisible);
	t.is<boolean | undefined, boolean | undefined>(widget1.isVisible, undefined); // unset defaults to true
	t.is<boolean | undefined, boolean | undefined>(widget3.isVisible, undefined); // unset defaults to true
});


test("Child width is updated by store", t =>
{
	globalThis.ui = Mock.ui();
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 80, height: 40 };
	const widthStore = store<Scale>("1w");
	const creator = flexible({
		spacing: 0, direction: LayoutDirection.Horizontal,
		content: [
			button({ text: "a", width: widthStore }),
			button({ text: "b" })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	const frame = createFrame(output);
	output.binder._bind(frame);
	control.layout(widgetMap, rect);

	const widget1 = output.widgets[0];
	const widget2 = output.widgets[1];
	t.is(widget1.x, 0);
	t.is(widget1.width, 40);
	t.is(widget2.x, 40);
	t.is(widget2.width, 40);

	widthStore.set("20px");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.x, 0);
	t.is(widget1.width, 20);
	t.is(widget2.x, 20);
	t.is(widget2.width, 60);

	widthStore.set("75%");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.x, 0);
	t.is(widget1.width, 60); // 75% of 80
	t.is(widget2.x, 60);
	t.is(widget2.width, 20); // leftover 1w
});


test("Child height is updated by store", t =>
{
	globalThis.ui = Mock.ui();
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 60 };
	const heightStore = store<Scale>("1w");
	const creator = flexible({
		spacing: 0,
		content: [
			button({ text: "a", height: heightStore }),
			button({ text: "b" })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	const frame = createFrame(output);
	output.binder._bind(frame);
	control.layout(widgetMap, rect);

	const widget1 = output.widgets[0];
	const widget2 = output.widgets[1];
	t.is(widget1.y, 0);
	t.is(widget1.height, 30);
	t.is(widget2.y, 30);
	t.is(widget2.height, 30);

	heightStore.set("20px");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.y, 0);
	t.is(widget1.height, 20);
	t.is(widget2.y, 20);
	t.is(widget2.height, 40);

	heightStore.set("25%");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.y, 0);
	t.is(widget1.height, 15); // 25% of 60
	t.is(widget2.y, 15);
	t.is(widget2.height, 45); // leftover 1w
});


test("Child width and height updated by stores simultaneously", t =>
{
	globalThis.ui = Mock.ui();
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 100, height: 80 };
	const widthStore = store<Scale>("1w");
	const heightStore = store<Scale>("1w");
	const creator = flexible({
		spacing: 0, direction: LayoutDirection.Horizontal,
		content: [
			button({ text: "a", width: widthStore, height: heightStore }),
			button({ text: "b" })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	const frame = createFrame(output);
	output.binder._bind(frame);
	control.layout(widgetMap, rect);

	const widget1 = output.widgets[0];
	const widget2 = output.widgets[1];
	t.is(widget1.width, 50);
	t.is(widget1.height, 80);
	t.is(widget2.width, 50);

	widthStore.set("30px");
	heightStore.set("25px");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.x, 0);
	t.is(widget1.width, 30);
	t.is(widget1.height, 25);
	t.is(widget2.x, 30);
	t.is(widget2.width, 70);
	t.is(widget2.height, 80);
});


test("Multiple children with independent height stores", t =>
{
	globalThis.ui = Mock.ui();
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 90 };
	const heightA = store<Scale>("1w");
	const heightB = store<Scale>("1w");
	const creator = flexible({
		spacing: 0,
		content: [
			button({ text: "a", height: heightA }),
			button({ text: "b", height: heightB }),
			button({ text: "c" })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	const frame = createFrame(output);
	output.binder._bind(frame);
	control.layout(widgetMap, rect);

	const widget1 = output.widgets[0];
	const widget2 = output.widgets[1];
	const widget3 = output.widgets[2];
	t.is(widget1.height, 30);
	t.is(widget2.height, 30);
	t.is(widget3.height, 30);

	// Fix first child, others share leftover
	heightA.set("30px");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.height, 30);
	t.is(widget2.y, 30);
	t.is(widget2.height, 30);
	t.is(widget3.y, 60);
	t.is(widget3.height, 30);

	// Fix both, third gets all leftover
	heightB.set("20px");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.height, 30);
	t.is(widget2.y, 30);
	t.is(widget2.height, 20);
	t.is(widget3.y, 50);
	t.is(widget3.height, 40);
});


test("Store-driven size affects parent inherited size", t =>
{
	globalThis.ui = Mock.ui();
	const output = createBuildOutput();
	const rect: Rectangle = { x: 0, y: 0, width: 100, height: 100 };
	const heightStore = store<Scale>("20px");
	const creator = flexible({
		spacing: 0,
		content: [
			button({ text: "a", width: 40, height: heightStore }),
			button({ text: "b", width: 30, height: "10px" })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	const frame = createFrame(output);
	output.binder._bind(frame);
	control.layout(widgetMap, rect);

	const position = creator.position;
	t.is(read(position.width), 40);
	t.is(read(position.height), 30); // 20 + 10

	heightStore.set("50px");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(read(position.width), 40);
	t.is(read(position.height), 60); // 50 + 10

	// Switching to non-absolute makes parent height unknown
	heightStore.set("1w");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(read(position.width), 40);
	t.is(read(position.height), undefined);
});


test("Container can switch between inherited and not, based on dynamic child visibility", t =>
{
	globalThis.ui = Mock.ui();
	const output = createBuildOutput();
	const rect: Rectangle = { x: 28, y: 3, width: 43, height: 50 };
	const visibility = store<ElementVisibility>("visible");
	const creator = flexible({
		spacing: 10,
		content: [
			label({ text: "abc", width: 10, height: "15px" }),
			label({ text: "wow", width: "1w", height: "1w", visibility })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	const frame = createFrame(output);
	output.binder._bind(frame);
	control.layout(widgetMap, rect);

	const widgets = output.widgets;
	t.is(widgets.length, 2);

	const widget1 = <LabelWidget>output.widgets[0];
	const widget2 = <LabelWidget>output.widgets[1];
	t.is(widget1.y, 3 + 2);
	t.is(widget2.y, 3 + 2 + 10 + 15);
	t.is(widget1.height, 15);
	t.is(widget2.height, 25);
	const position = creator.position;
	t.is(read(position.width), undefined);
	t.is(read(position.height), undefined);

	visibility.set("none");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.y, 3 + 2);
	t.is(widget1.height, 15);
	t.is(read(position.width), 10); // Based on single widget
	t.is(read(position.height), 15);

	visibility.set("visible");
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	t.is(widget1.y, 3 + 2);
	t.is(widget2.y, 3 + 2 + 10 + 15);
	t.is(widget1.height, 15);
	t.is(widget2.height, 25);
	t.is(read(position.width), undefined);
	t.is(read(position.height), undefined);
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

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const label1 = <LabelWidget>output.widgets[0];
	t.is(label1.x, 3);
	t.is(label1.y, 5);
	t.is(label1.width, 37);
	t.is(label1.height, 11); // 11 instead of 11.5

	const label2 = <LabelWidget>output.widgets[1];
	t.is(label2.x, 3);
	t.is(label2.y, 5 + 12); // 12 instead of 11.5
	t.is(label2.width, 37);
	t.is(label2.height, 11); // 11 instead of 11.5
});


test("Rounding: uneven sizes in horizontal direction", t =>
{
	const output = createBuildOutput();
	const rect: Rectangle = { x: 5, y: 3, width: 23, height: 37 };
	const creator = flexible({
		spacing: 0, direction: LayoutDirection.Horizontal,
		content: [
			button({ text: "a" }),
			button({ text: "b" })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, rect);

	const widget1 = output.widgets[0];
	t.is(widget1.x, 5);
	t.is(widget1.y, 3);
	t.is(widget1.width, 11); // 11 instead of 11.5
	t.is(widget1.height, 37);

	const widget2 = output.widgets[1];
	t.is(widget2.x, 5 + 12); // 12 instead of 11.5
	t.is(widget2.y, 3);
	t.is(widget2.width, 11); // 11 instead of 11.5
	t.is(widget2.height, 37);
});


test("Re-layout adapts to different area", t =>
{
	const output = createBuildOutput();
	const creator = flexible({
		spacing: 0,
		content: [
			button({ text: "a" }),
			button({ text: "b" })
		]
	});

	const control = <FlexControl>creator.create(output);
	const widgetMap = addToWidgetMap(output.widgets);
	invoke(output.redraw);
	control.layout(widgetMap, { x: 0, y: 0, width: 100, height: 60 });

	const widget1 = output.widgets[0];
	const widget2 = output.widgets[1];
	t.is(widget1.y, 0);
	t.is(widget1.height, 30);
	t.is(widget2.y, 30);
	t.is(widget2.height, 30);

	control.layout(widgetMap, { x: 10, y: 5, width: 80, height: 40 });

	t.is(widget1.x, 10);
	t.is(widget1.y, 5);
	t.is(widget1.width, 80);
	t.is(widget1.height, 20);
	t.is(widget2.x, 10);
	t.is(widget2.y, 25);
	t.is(widget2.width, 80);
	t.is(widget2.height, 20);
});
