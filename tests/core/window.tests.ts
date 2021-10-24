/// <reference path="../../lib/openrct2.d.ts" />

import { window } from "@src/core/window";
import { button } from "@src/elements/button";
import { horizontal } from "@src/elements/flexibleLayout";
import { label } from "@src/elements/label";
import { observable } from "@src/observables/observable";
import test from "ava";
import Mock, { UiMock } from "openrct2-mocks";


test("Simple window with widgets", t =>
{
	global.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: 200, height: 150 + 16,

		content: [
			label({ text: "hello world" }),
			horizontal([
				button({ text: "left button" }),
				button({ text: "right button" })
			]),
			label({
				text: "big area",
				alignment: "centred"
			})
		]
	});
	template.open();

	const created = (global.ui as UiMock).createdWindows[0];
	t.truthy(created);
	t.is(created.title, "test window");
	t.is(created.width, 200);
	t.is(created.height, 166);
	t.is(created.widgets.length, 4);

	const label1 = created.widgets[0] as LabelWidget;
	t.is(label1.type, "label");
	t.is(label1.text, "hello world");
	t.is(label1.x, 0);
	t.is(label1.y, 16);
	t.is(label1.width, 200);
	t.is(label1.height, 50);

	const button1 = created.widgets[1] as ButtonWidget;
	t.is(button1.type, "button");
	t.is(button1.text, "left button");
	t.is(button1.x, 0);
	t.is(button1.y, 66);
	t.is(button1.width, 100);
	t.is(button1.height, 50);

	const button2 = created.widgets[2] as ButtonWidget;
	t.is(button2.type, "button");
	t.is(button2.text, "right button");
	t.is(button2.x, 100);
	t.is(button2.y, 66);
	t.is(button2.width, 100);
	t.is(button2.height, 50);

	const label2 = created.widgets[3] as LabelWidget;
	t.is(label2.type, "label");
	t.is(label2.text, "big area");
	t.is(label2.textAlign, "centred");
	t.is(label2.x, 0);
	t.is(label2.y, 116);
	t.is(label2.width, 200);
	t.is(label2.height, 50);
});


test("Window adjusts to resize", t =>
{
	global.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: 200, height: 150 + 16,
		minWidth: 100, minHeight: 50,
		maxWidth: 500, maxHeight: 400,

		content: [
			label({ text: "hello world" }),
			horizontal([
				button({ text: "left button" }),
				button({ text: "right button" })
			]),
			label({
				text: "big area",
				alignment: "centred"
			})
		]
	});
	template.open();

	const created = (global.ui as UiMock).createdWindows[0];
	created.width = 400;
	created.height = 316;
	created.onUpdate?.();

	const label1 = created.widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 16);
	t.is(label1.width, 400);
	t.is(label1.height, 100);

	const button1 = created.widgets[1] as ButtonWidget;
	t.is(button1.x, 0);
	t.is(button1.y, 116);
	t.is(button1.width, 200);
	t.is(button1.height, 100);

	const button2 = created.widgets[2] as ButtonWidget;
	t.is(button2.x, 200);
	t.is(button2.y, 116);
	t.is(button2.width, 200);
	t.is(button2.height, 100);

	const label2 = created.widgets[3] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 216);
	t.is(label2.width, 400);
	t.is(label2.height, 100);
});


test("Window does not resize if size hasn't changed", t =>
{
	global.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: 200, height: 150 + 16,
		minWidth: 100, minHeight: 50,
		maxWidth: 500, maxHeight: 400,

		content: [
			label({ text: "hello world" }),
			horizontal([
				button({ text: "left button" }),
				button({ text: "right button" })
			]),
			label({
				text: "big area",
				alignment: "centred"
			})
		]
	});
	template.open();

	const created = (global.ui as UiMock).createdWindows[0];
	created.onUpdate?.();

	const label1 = created.widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 16);
	t.is(label1.width, 200);
	t.is(label1.height, 50);

	const button1 = created.widgets[1] as ButtonWidget;
	t.is(button1.x, 0);
	t.is(button1.y, 66);
	t.is(button1.width, 100);
	t.is(button1.height, 50);

	const button2 = created.widgets[2] as ButtonWidget;
	t.is(button2.x, 100);
	t.is(button2.y, 66);
	t.is(button2.width, 100);
	t.is(button2.height, 50);

	const label2 = created.widgets[3] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 116);
	t.is(label2.width, 200);
	t.is(label2.height, 50);
});


test("Window updates to bindings", t =>
{
	global.ui = Mock.ui();

	const viewmodel = {
		labelText: observable("test"),
		labelAlign: observable<TextAlignment>("centred"),
		buttonText: observable("click me"),
		buttonPressed: observable(true)
	};

	const template = window({
		title: "test window", width: 100, height: 100,
		content: [
			label({
				text: viewmodel.labelText,
				alignment: viewmodel.labelAlign
			}),
			button({
				text: viewmodel.buttonText,
				isPressed: viewmodel.buttonPressed
			})
		]
	});
	template.open();

	const created = (global.ui as UiMock).createdWindows[0];

	const label1 = created.widgets[0] as LabelWidget;
	t.is(label1.text, "test");
	t.is(label1.textAlign, "centred");
	const button1 = created.widgets[1] as ButtonWidget;
	t.is(button1.text, "click me");
	t.true(button1.isPressed);

	viewmodel.labelText.set("blub");
	viewmodel.labelAlign.set("left");
	viewmodel.buttonText.set("clicked!");
	viewmodel.buttonPressed.set(false);

	t.is(label1.text, "blub");
	t.is(label1.textAlign, "left");
	t.is(button1.text, "clicked!");
	t.false(button1.isPressed);
});


test("Window applies padding", t =>
{
	global.ui = Mock.ui();

	const template = window({
		title: "test window", width: 150, height: 100,
		padding: 15,
		content: [
			button({ text: "click"	})
		]
	});
	template.open();

	const created = (global.ui as UiMock).createdWindows[0];

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.x, 15);
	t.is(button1.y, 15 + 16);
	t.is(button1.width, 120);
	t.is(button1.height, 70 - 16);
});


test("Window applies padding to resizes", t =>
{
	global.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: 150, height: 100,
		minWidth: 100, minHeight: 50,
		maxWidth: 500, maxHeight: 400,
		padding: 20,
		content: [
			button({ text: "click" })
		]
	});
	template.open();

	const created = (global.ui as UiMock).createdWindows[0];
	created.width = 250;
	created.height = 300;
	created.onUpdate?.();

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.x, 20);
	t.is(button1.y, 20 + 16);
	t.is(button1.width, 210);
	t.is(button1.height, 260 - 16);
});