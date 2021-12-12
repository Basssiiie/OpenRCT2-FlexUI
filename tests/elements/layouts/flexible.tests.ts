/// <reference path="../../../lib/openrct2.d.ts" />

import { BuildContainer } from "@src/building/buildContainer";
import { createWidgetMap } from "@src/building/widgetMap";
import { button } from "@src/elements/controls/button";
import { label } from "@src/elements/controls/label";
import { flexible, FlexibleLayoutContainer, FlexibleLayoutParams, horizontal } from "@src/elements/layouts/flexible/flexible";
import { Direction } from "@src/positional/direction";
import { Rectangle } from "@src/positional/rectangle";
import test from "ava";


test("Simple layouts with widgets", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 200, height: 150 };
	const creator = flexible({
		spacing: 0,
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
	}, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const label1 = output._widgets[0] as LabelWidget;
	t.is(label1.type, "label");
	t.is(label1.text, "hello world");
	t.is(label1.x, 0);
	t.is(label1.y, 0);
	t.is(label1.width, 200);
	t.is(label1.height, 50);

	const button1 = output._widgets[1] as ButtonWidget;
	t.is(button1.type, "button");
	t.is(button1.text, "left button");
	t.is(button1.x, 0);
	t.is(button1.y, 50);
	t.is(button1.width, 100);
	t.is(button1.height, 50);

	const button2 = output._widgets[2] as ButtonWidget;
	t.is(button2.type, "button");
	t.is(button2.text, "right button");
	t.is(button2.x, 100);
	t.is(button2.y, 50);
	t.is(button2.width, 100);
	t.is(button2.height, 50);

	const label2 = output._widgets[3] as LabelWidget;
	t.is(label2.type, "label");
	t.is(label2.text, "big area");
	t.is(label2.textAlign, "centred");
	t.is(label2.x, 0);
	t.is(label2.y, 100);
	t.is(label2.width, 200);
	t.is(label2.height, 50);
});


test("Pixel sizes ignore leftover space", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 60 };
	const params: FlexibleLayoutParams =
	{
		spacing: 0,
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
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const label1 = output._widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 0);
	t.is(label1.width, 40);
	t.is(label1.height, 25);

	const label2 = output._widgets[1] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 25);
	t.is(label2.width, 30);
	t.is(label2.height, 10);

	const label3 = output._widgets[2] as LabelWidget;
	t.is(label3.x, 0);
	t.is(label3.y, 35);
	t.is(label3.width, 70);
	t.is(label3.height, 20);
});


test("Percentage sizes", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 60 };
	const params: FlexibleLayoutParams =
	{
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
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const label1 = output._widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 0);
	t.is(label1.width, 30);
	t.is(label1.height, 12);

	const label2 = output._widgets[1] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 12);
	t.is(label2.width, 6);
	t.is(label2.height, 27);

	const label3 = output._widgets[2] as LabelWidget;
	t.is(label3.x, 0);
	t.is(label3.y, 39);
	t.is(label3.width, 45);
	t.is(label3.height, 9);
});


test("Weighted sizes", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 60 };
	const params: FlexibleLayoutParams =
	{
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
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const label1 = output._widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 0);
	t.is(label1.width, 60);
	t.is(label1.height, 18);

	const label2 = output._widgets[1] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 18);
	t.is(label2.width, 60);
	t.is(label2.height, 7);

	const label3 = output._widgets[2] as LabelWidget;
	t.is(label3.x, 0);
	t.is(label3.y, 25);
	t.is(label3.width, 60);
	t.is(label3.height, 35);
});


test("Relative percentage fills leftover space", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 80, height: 80 };
	const params: FlexibleLayoutParams =
	{
		spacing: 0,
		content: [
			label({
				text: "a", height: "100%"
			}),
			label({
				text: "b", height: "65px"
			})
		]
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const label1 = output._widgets[0] as LabelWidget;
	t.is(label1.y, 0);
	t.is(label1.height, 15);

	const label2 = output._widgets[1] as LabelWidget;
	t.is(label2.y, 15);
	t.is(label2.height, 65);
});


test("Relative weight fills leftover space", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 60 };
	const params: FlexibleLayoutParams =
	{
		spacing: 0,
		content: [
			label({
				text: "a", height: "3w"
			}),
			label({
				text: "b", height: "17px"
			})
		]
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const label1 = output._widgets[0] as LabelWidget;
	t.is(label1.y, 0);
	t.is(label1.height, 43);

	const label2 = output._widgets[1] as LabelWidget;
	t.is(label2.y, 43);
	t.is(label2.height, 17);
});


test("Padding: single number value", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const params: FlexibleLayoutParams =
	{
		spacing: 0,
		content: [
			button({ text: "a", padding: 5 })
		]
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const widget = output._widgets[0];
	t.is(widget.x, 5);
	t.is(widget.y, 5);
	t.is(widget.width, 50);
	t.is(widget.height, 30);
});


test("Padding: single pixel value", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const params: FlexibleLayoutParams =
	{
		spacing: 0,
		content: [
			button({ text: "a", padding: "5px" })
		]
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const widget = output._widgets[0];
	t.is(widget.x, 5);
	t.is(widget.y, 5);
	t.is(widget.width, 50);
	t.is(widget.height, 30);
});


test("Padding: single percentage value", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const params: FlexibleLayoutParams =
	{
		spacing: 0,
		content: [
			button({ text: "a", padding: "20%" })
		]
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const widget = output._widgets[0];
	t.is(widget.x, 12);
	t.is(widget.y, 8);
	t.is(widget.width, 36);
	t.is(widget.height, 24);
});


test("Padding: single weighted value", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const params: FlexibleLayoutParams =
	{
		spacing: 0,
		content: [
			button({ text: "a", width: "1w", padding: "0.4w" })
		]
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const widget = output._widgets[0];
	t.is(widget.x, 24);
	t.is(widget.y, 16);
	t.is(widget.width, 12);
	t.is(widget.height, 8);
});


test("Padding: tuple with 2 values", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const params: FlexibleLayoutParams =
	{
		spacing: 0,
		content: [
			label({
				text: "a", height: "4w", padding: ["1w", "7px"]
			}),
			label({
				text: "a", height: "6w", padding: ["2w", "10%"]
			})
		]
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const label1 = output._widgets[0] as LabelWidget;
	t.is(label1.x, 7);
	t.is(label1.y, 4);
	t.is(label1.width, 46);
	t.is(label1.height, 8);

	const label2 = output._widgets[1] as LabelWidget;
	t.is(label2.x, 6);
	t.is(label2.y, 24);
	t.is(label2.width, 48);
	t.is(label2.height, 8);
});


test("Works without children", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 60 };
	const params: FlexibleLayoutParams =
	{
		content: []
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const widgets = output._widgets;
	t.is(widgets.length, 0);
});


test("Spacing: 10 pixels between two elements", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const params: FlexibleLayoutParams =
	{
		spacing: 10,
		content: [
			button({ text: "a" }),
			button({ text: "b" })
		]
	};
	const creator = flexible(params, Direction.Horizontal);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const widget1 = output._widgets[0];
	t.is(widget1.x, 0);
	t.is(widget1.y, 0);
	t.is(widget1.width, 25);
	t.is(widget1.height, 40);

	const widget2 = output._widgets[1];
	t.is(widget2.x, 35);
	t.is(widget2.y, 0);
	t.is(widget2.width, 25);
	t.is(widget2.height, 40);
});


test("Spacing: default space between two elements", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 7, y: 20, width: 78, height: 35 };
	const params: FlexibleLayoutParams =
	{
		content: [
			label({ text: "a" }),
			label({ text: "b" })
		]
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const label1 = output._widgets[0] as LabelWidget;
	t.is(label1.x, 7);
	t.is(label1.y, 20);
	t.is(label1.width, 78);
	t.is(label1.height, 14);

	const label2 = output._widgets[1] as LabelWidget;
	t.is(label2.x, 7);
	t.is(label2.y, 38);
	t.is(label2.width, 78);
	t.is(label2.height, 14);
});


test("Spacing: percentile space between two elements", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 5, y: 10, width: 50, height: 15 };
	const params: FlexibleLayoutParams =
	{
		spacing: "20%",
		content: [
			label({ text: "a", width: "40%" }),
			label({ text: "b", width: "40%" })
		]
	};
	const creator = flexible(params, Direction.Horizontal);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const label1 = output._widgets[0] as LabelWidget;
	t.is(label1.x, 5);
	t.is(label1.y, 10);
	t.is(label1.width, 20);
	t.is(label1.height, 14);

	const label2 = output._widgets[1] as LabelWidget;
	t.is(label2.x, 35);
	t.is(label2.y, 10);
	t.is(label2.width, 20);
	t.is(label2.height, 14);
});


test("Spacing: weighted space between two elements", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 5, y: 0, width: 30, height: 15 };
	const params: FlexibleLayoutParams =
	{
		spacing: "1w",
		content: [
			label({ text: "a", width: "1w" }),
			label({ text: "b", width: "1w" })
		]
	};
	const creator = flexible(params, Direction.Horizontal);
	const control = creator.create(output);
	control.layout(createWidgetMap(output._widgets), rect);

	const label1 = output._widgets[0] as LabelWidget;
	t.is(label1.x, 5);
	t.is(label1.y, 0);
	t.is(label1.width, 10);
	t.is(label1.height, 14);

	const label2 = output._widgets[1] as LabelWidget;
	t.is(label2.x, 25);
	t.is(label2.y, 0);
	t.is(label2.width, 10);
	t.is(label2.height, 14);
});


test("Absolute children make parent absolutely sized", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const params: FlexibleLayoutParams =
	{
		content: [
			label({ text: "a", width: 20, height: "12px" }),
			label({ text: "b", width: 15, height: "5px" })
		]
	};
	const creator = flexible(params, Direction.Horizontal);
	creator.create(output); // todo: create() should not required for this to work
	const pos = creator.params;

	t.is(pos.width, 35);
	t.is(pos.height, 12);
});


test("Absolute children make all parents absolutely sized", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const params: FlexibleLayoutContainer =
	[
		flexible([
			label({ text: "a", width: 20, height: "12px" }),
			label({ text: "b", width: 15, height: "5px" })
		], Direction.Vertical),
		flexible([
			label({ text: "c", width: "33px", height: 11 }),
			label({ text: "d", width: 8, height: "51px" })
		], Direction.Horizontal)
	];
	const creator = flexible(params, Direction.Horizontal);
	creator.create(output); // todo: create() should not required for this to work
	const pos = creator.params;

	t.is(pos.width, 61);
	t.is(pos.height, 51);
});


test("Single non-absolute child makes parents size unknown", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const params: FlexibleLayoutContainer =
	[
		flexible([
			label({ text: "a", width: 20, height: "12px" }),
			label({ text: "b", width: "1w", height: "50%" }) // <- non-absolute
		], Direction.Vertical),
		flexible([
			label({ text: "c", width: "33px", height: 11 }),
			label({ text: "d", width: 8, height: "51px" })
		], Direction.Horizontal)
	];
	const creator = flexible(params, Direction.Horizontal);
	creator.create(output); // todo: create() should not required for this to work
	const pos = creator.params;

	t.is(pos.width, undefined);
	t.is(pos.height, undefined);
});