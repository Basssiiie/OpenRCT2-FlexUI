/// <reference path="../../lib/openrct2.d.ts" />

import { window } from "@src/core/window";
import { box } from "@src/elements/box";
import { label } from "@src/elements/label";
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
				content: label({ text: "inside a box!" })
			})
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as GroupBoxWidget;
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 4);
	t.is(widget1.y, 4 + 15 - 4);
	t.is(widget1.width, 42);
	t.is(widget1.height, 32 + 4);

	const widget2 = mock.createdWindows[0].widgets[1] as LabelWidget;
	t.is(widget2.type, "label");
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 9);
	t.is(widget2.y, 9 + 15);
	t.is(widget2.width, 32);
	t.is(widget2.height, 22);
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
				content: label({
					padding: [ 4, 6 ],
					text: "inside a box!"
				})
			})
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as GroupBoxWidget;
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 10);
	t.is(widget1.y, 10 + 15 - 4);
	t.is(widget1.width, 80);
	t.is(widget1.height, 40 + 4);

	const widget2 = mock.createdWindows[0].widgets[1] as LabelWidget;
	t.is(widget2.type, "label");
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 19);
	t.is(widget2.y, 17 + 15);
	t.is(widget2.width, 62);
	t.is(widget2.height, 26);
});
