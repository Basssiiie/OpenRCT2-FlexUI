/// <reference path="../../lib/openrct2.d.ts" />

import { BuildContainer } from "@src/core/buildContainer";
import { createWidgetMap } from "@src/core/widgetMap";
import { button } from "@src/elements/button";
import { flexible, FlexibleLayoutParams, horizontal } from "@src/elements/flexible";
import { label } from "@src/elements/label";
import { Direction } from "@src/positional/direction";
import { Rectangle } from "@src/positional/rectangle";
import test from "ava";


test("Simple layouts with widgets", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 200, height: 150 };
	const creator = flexible({
		padding: 0,
		content: [
			label({ text: "hello world" }),
			horizontal({
				padding: 0,
				content: [
					button({ text: "left button" }),
					button({ text: "right button" })
				]
			}),
			label({ text: "big area", alignment: "centred" })
		]
	}, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output.widgets), rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.type, "label");
	t.is(label1.text, "hello world");
	t.is(label1.x, 0);
	t.is(label1.y, 0);
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
	control.layout(createWidgetMap(output.widgets), rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 0);
	t.is(label1.width, 40);
	t.is(label1.height, 25);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 25);
	t.is(label2.width, 30);
	t.is(label2.height, 10);

	const label3 = output.widgets[2] as LabelWidget;
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
	control.layout(createWidgetMap(output.widgets), rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 0);
	t.is(label1.width, 30);
	t.is(label1.height, 12);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 12);
	t.is(label2.width, 6);
	t.is(label2.height, 27);

	const label3 = output.widgets[2] as LabelWidget;
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
	control.layout(createWidgetMap(output.widgets), rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 0);
	t.is(label1.width, 60);
	t.is(label1.height, 18);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 18);
	t.is(label2.width, 60);
	t.is(label2.height, 7);

	const label3 = output.widgets[2] as LabelWidget;
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
	control.layout(createWidgetMap(output.widgets), rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.y, 0);
	t.is(label1.height, 15);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.y, 15);
	t.is(label2.height, 65);
});


test("Relative weight fills leftover space", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 60 };
	const params: FlexibleLayoutParams =
	{
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
	control.layout(createWidgetMap(output.widgets), rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.y, 0);
	t.is(label1.height, 43);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.y, 43);
	t.is(label2.height, 17);
});


test("Padding: single number value", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const params: FlexibleLayoutParams =
	{
		content: [
			label({
				text: "a", padding: 5
			})
		]
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output.widgets), rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 5);
	t.is(label1.y, 5);
	t.is(label1.width, 50);
	t.is(label1.height, 30);
});


test("Padding: single pixel value", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const params: FlexibleLayoutParams =
	{
		content: [
			label({
				text: "a", padding: "5px"
			})
		]
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output.widgets), rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 5);
	t.is(label1.y, 5);
	t.is(label1.width, 50);
	t.is(label1.height, 30);
});


test("Padding: single percentage value", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const params: FlexibleLayoutParams =
	{
		content: [
			label({
				text: "a", padding: "20%"
			})
		]
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output.widgets), rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 12);
	t.is(label1.y, 8);
	t.is(label1.width, 36);
	t.is(label1.height, 24);
});


test("Padding: single weighted value", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const params: FlexibleLayoutParams =
	{
		content: [
			label({
				text: "a", padding: "5w"
			})
		]
	};
	const creator = flexible(params, Direction.Vertical);
	const control = creator.create(output);
	control.layout(createWidgetMap(output.widgets), rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 5);
	t.is(label1.y, 5);
	t.is(label1.width, 50);
	t.is(label1.height, 30);
});


test("Padding: tuple with 2 values", t =>
{
	const output: BuildContainer = new BuildContainer({} as WindowDesc);
	const rect: Rectangle = { x: 0, y: 0, width: 60, height: 40 };
	const params: FlexibleLayoutParams =
	{
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
	control.layout(createWidgetMap(output.widgets), rect);

	const label1 = output.widgets[0] as LabelWidget;
	t.is(label1.x, 7);
	t.is(label1.y, 4);
	t.is(label1.width, 46);
	t.is(label1.height, 8);

	const label2 = output.widgets[1] as LabelWidget;
	t.is(label2.x, 6);
	t.is(label2.y, 24);
	t.is(label2.width, 48);
	t.is(label2.height, 8);
});