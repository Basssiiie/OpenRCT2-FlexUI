/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock, { UiMock } from "openrct2-mocks";
import { WindowFactory } from "../../src/core/window";
import fui from "../../src/fui";


test("Simple window with widgets", t =>
{
	global.ui = Mock.ui();

	const template = WindowFactory({
		title: "test window",
		width: 200, height: 150 + 16,

		content: wb => wb
			.label({ text: "hello world" })
			.horizontal({
				content: sb => sb
					.button({ text: "left button" })
					.button({ text: "right button" })
			})
			.label({
				text: "big area",
				alignment: "centred"
			})
	});
	template.open();

	const window = (global.ui as UiMock).createdWindows[0];
	t.truthy(window);
	t.is(window.title, "test window");
	t.is(window.width, 200);
	t.is(window.height, 166);
	t.is(window.widgets.length, 4);

	const label1 = window.widgets[0] as LabelWidget;
	t.is(label1.type, "label");
	t.is(label1.text, "hello world");
	t.is(label1.x, 0);
	t.is(label1.y, 16);
	t.is(label1.width, 200);
	t.is(label1.height, 50);

	const button1 = window.widgets[1] as ButtonWidget;
	t.is(button1.type, "button");
	t.is(button1.text, "left button");
	t.is(button1.x, 0);
	t.is(button1.y, 66);
	t.is(button1.width, 100);
	t.is(button1.height, 50);

	const button2 = window.widgets[2] as ButtonWidget;
	t.is(button2.type, "button");
	t.is(button2.text, "right button");
	t.is(button2.x, 100);
	t.is(button2.y, 66);
	t.is(button2.width, 100);
	t.is(button2.height, 50);

	const label2 = window.widgets[3] as LabelWidget;
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

	const template = WindowFactory({
		title: "test window",
		width: 200, height: 150 + 16,
		minWidth: 100, minHeight: 50,
		maxWidth: 500, maxHeight: 400,

		content: wb => wb
			.label({ text: "hello world" })
			.horizontal({
				content: sb => sb
					.button({ text: "left button" })
					.button({ text: "right button" })
			})
			.label({
				text: "big area",
				alignment: "centred"
			})
	});
	template.open();

	const window = (global.ui as UiMock).createdWindows[0];
	window.width = 400;
	window.height = 316;
	window.onUpdate?.();

	const label1 = window.widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 16);
	t.is(label1.width, 400);
	t.is(label1.height, 100);

	const button1 = window.widgets[1] as ButtonWidget;
	t.is(button1.x, 0);
	t.is(button1.y, 116);
	t.is(button1.width, 200);
	t.is(button1.height, 100);

	const button2 = window.widgets[2] as ButtonWidget;
	t.is(button2.x, 200);
	t.is(button2.y, 116);
	t.is(button2.width, 200);
	t.is(button2.height, 100);

	const label2 = window.widgets[3] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 216);
	t.is(label2.width, 400);
	t.is(label2.height, 100);
});


test("Window does not resize if size hasn't changed", t =>
{
	global.ui = Mock.ui();

	const template = WindowFactory({
		title: "test window",
		width: 200, height: 150 + 16,
		minWidth: 100, minHeight: 50,
		maxWidth: 500, maxHeight: 400,

		content: wb => wb
			.label({ text: "hello world" })
			.horizontal({
				content: sb => sb
					.button({ text: "left button" })
					.button({ text: "right button" })
			})
			.label({
				text: "big area",
				alignment: "centred"
			})
	});
	template.open();

	const window = (global.ui as UiMock).createdWindows[0];
	window.onUpdate?.();

	const label1 = window.widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 16);
	t.is(label1.width, 200);
	t.is(label1.height, 50);

	const button1 = window.widgets[1] as ButtonWidget;
	t.is(button1.x, 0);
	t.is(button1.y, 66);
	t.is(button1.width, 100);
	t.is(button1.height, 50);

	const button2 = window.widgets[2] as ButtonWidget;
	t.is(button2.x, 100);
	t.is(button2.y, 66);
	t.is(button2.width, 100);
	t.is(button2.height, 50);

	const label2 = window.widgets[3] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 116);
	t.is(label2.width, 200);
	t.is(label2.height, 50);
});


test("Window updates to bindings", t =>
{
	global.ui = Mock.ui();

	const viewmodel = {
		labelText: fui.observable("test"),
		labelAlign: fui.observable<TextAlignment>("centred"),
		buttonText: fui.observable("click me"),
		buttonPressed: fui.observable(true)
	};

	const template = WindowFactory({
		title: "test window", width: 100, height: 100,
		content: wb => wb
			.label({
				text: viewmodel.labelText,
				alignment: viewmodel.labelAlign
			})
			.button({
				text: viewmodel.buttonText,
				isPressed: viewmodel.buttonPressed
			})
	});
	template.open();

	const window = (global.ui as UiMock).createdWindows[0];

	const label = window.widgets[0] as LabelWidget;
	t.is(label.text, "test");
	t.is(label.textAlign, "centred");
	const button = window.widgets[1] as ButtonWidget;
	t.is(button.text, "click me");
	t.true(button.isPressed);

	viewmodel.labelText.set("blub");
	viewmodel.labelAlign.set("left");
	viewmodel.buttonText.set("clicked!");
	viewmodel.buttonPressed.set(false);

	t.is(label.text, "blub");
	t.is(label.textAlign, "left");
	t.is(button.text, "clicked!");
	t.false(button.isPressed);
});


test("Window applies padding", t =>
{
	global.ui = Mock.ui();

	const template = WindowFactory({
		title: "test window", width: 150, height: 100,
		padding: 15,
		content: wb => wb
			.button({ text: "click"	})
	});
	template.open();

	const window = (global.ui as UiMock).createdWindows[0];

	const button = window.widgets[0] as ButtonWidget;
	t.is(button.x, 15);
	t.is(button.y, 15 + 16);
	t.is(button.width, 120);
	t.is(button.height, 70 - 16);
});


test("Window applies padding to resizes", t =>
{
	global.ui = Mock.ui();

	const template = WindowFactory({
		title: "test window",
		width: 150, height: 100,
		minWidth: 100, minHeight: 50,
		maxWidth: 500, maxHeight: 400,
		padding: 20,
		content: wb => wb
			.button({ text: "click"	})
	});
	template.open();

	const window = (global.ui as UiMock).createdWindows[0];
	window.width = 250;
	window.height = 300;
	window.onUpdate?.();

	const button = window.widgets[0] as ButtonWidget;
	t.is(button.x, 20);
	t.is(button.y, 20 + 16);
	t.is(button.width, 210);
	t.is(button.height, 260 - 16);
});