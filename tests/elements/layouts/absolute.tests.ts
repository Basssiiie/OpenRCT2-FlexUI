/// <reference path="../../../lib/openrct2.d.ts" />

import { window } from "@src/windows/window";
import { button } from "@src/elements/controls/button";
import { label } from "@src/elements/controls/label";
import { absolute } from "@src/elements/layouts/absolute/absolute";
import test from "ava";
import Mock from "openrct2-mocks";


test("Simple layout with widgets", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			absolute({
				content: [
					label({
						x: 21, y: 34, width: 43, height: 19,
						text: "Look at me!"
					}),
					button({
						x: 42, y: 11, width: 32, height: 68,
						text: "Click me!"
					})
				]
			})
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as LabelWidget;
	t.is(widget1.type, "label");
	t.is(widget1.text, "Look at me!");
	t.is(widget1.x, 21);
	t.is(widget1.y, 34 + 2 + 15);
	t.is(widget1.width, 43);
	t.is(widget1.height, 19);

	const widget2 = mock.createdWindows[0].widgets[1] as ButtonWidget;
	t.is(widget2.type, "button");
	t.is(widget2.text, "Click me!");
	t.is(widget2.x, 42);
	t.is(widget2.y, 11 + 15);
	t.is(widget2.width, 32);
	t.is(widget2.height, 68);
});


test("Flat layout with widgets", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			absolute([
				button({
					x: 43, y: 12, width: 33, height: 70,
					text: "Click me!"
				}),
				label({
					x: 22, y: 35, width: 44, height: 20,
					text: "Look at me!"
				})
			])
		]
	});
	template.open();

	const widget2 = mock.createdWindows[0].widgets[0] as ButtonWidget;
	t.is(widget2.type, "button");
	t.is(widget2.text, "Click me!");
	t.is(widget2.x, 43);
	t.is(widget2.y, 12 + 15);
	t.is(widget2.width, 33);
	t.is(widget2.height, 70);

	const widget1 = mock.createdWindows[0].widgets[1] as LabelWidget;
	t.is(widget1.type, "label");
	t.is(widget1.text, "Look at me!");
	t.is(widget1.x, 22);
	t.is(widget1.y, 35 + 2 + 15);
	t.is(widget1.width, 44);
	t.is(widget1.height, 20);
});