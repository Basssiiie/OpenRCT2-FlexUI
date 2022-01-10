/// <reference path="../../../lib/openrct2.d.ts" />

import { window } from "@src/building/window";
import { box } from "@src/elements/controls/box";
import { button } from "@src/elements/controls/button";
import test from "ava";
import Mock from "openrct2-mocks";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 50, height: 40 + 15, padding: "4px",
		content: [
			box({
				padding: "7px",
				content: button({
					text: "inside a box!"
				})
			})
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as GroupBoxWidget;
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 4 + 7);
	t.is(widget1.y, 4 + 7 + 15 - 4); // - default top pad
	t.is(widget1.width, 28);
	t.is(widget1.height, 18 + 4); // + default top pad

	const widget2 = mock.createdWindows[0].widgets[1] as LabelWidget;
	t.is(widget2.type, "button");
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 4 + 7 + 6); // incl. 6px default padding
	t.is(widget2.y, 4 + 7 + 6 + 15);
	t.is(widget2.width, 16);
	t.is(widget2.height, 6);
});


test("Applies padding", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 60 + 15, padding: 10,
		content: [
			box({
				padding: 3,
				content: button({
					padding: [ 4, 6 ],
					text: "inside a box!"
				})
			})
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as GroupBoxWidget;
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 10 + 3);
	t.is(widget1.y, 10 + 3 + 15 - 4); // - default top pad
	t.is(widget1.width, 74);
	t.is(widget1.height, 34 + 4); // + default top pad

	const widget2 = mock.createdWindows[0].widgets[1] as LabelWidget;
	t.is(widget2.type, "button");
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 10 + 3 + 6);
	t.is(widget2.y, 10 + 3 + 4 + 15);
	t.is(widget2.width, 62);
	t.is(widget2.height, 26);
});


test("Box takes size of absolute child", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 500, height: 400 + 15, padding: 10,
		content: [
			box({
				padding: "0px",
				content: button({
					width: 120, height: 70, padding: 12,
					text: "inside a box!"
				})
			})
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as GroupBoxWidget;
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 10);
	t.is(widget1.y, 10 + 15 - 4); // - default top pad
	t.is(widget1.width, 120 + 24);
	t.is(widget1.height, 70 + 24 + 4); // + default top pad

	const widget2 = mock.createdWindows[0].widgets[1] as LabelWidget;
	t.is(widget2.type, "button");
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 10 + 12);
	t.is(widget2.y, 10 + 12 + 15);
	t.is(widget2.width, 120);
	t.is(widget2.height, 70);
});


test("Box can center child", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 500, height: 400 + 15, padding: 40,
		content: [
			box(
				button({
					width: 100, height: 200, padding: [ "50%", 0 ],
					text: "inside a box!"
				})
			)
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as GroupBoxWidget;
	t.is(widget1.x, 40);
	t.is(widget1.y, 40 + 15 - 4);
	t.is(widget1.width, 100);
	t.is(widget1.height, 320 + 4);

	const widget2 = mock.createdWindows[0].widgets[1] as LabelWidget;
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 40);
	t.is(widget2.y, 40 + 60 + 15);
	t.is(widget2.width, 100);
	t.is(widget2.height, 200);
});