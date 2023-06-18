/// <reference path="../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { button } from "@src/elements/controls/button";
import { groupbox } from "@src/elements/controls/groupbox";
import { label } from "@src/elements/controls/label";
import { ElementVisibility } from "@src/elements/elementParams";
import { horizontal } from "@src/elements/layouts/flexible/flexible";
import { mutable } from "@src/utilities/mutable";
import { FrameContext } from "@src/windows/frames/frameContext";
import { window } from "@src/windows/window";
import test from "ava";
import Mock, { UiMock } from "openrct2-mocks";
import { call } from "../helpers";


test("Simple window with widgets", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: 200, height: 150 + 15,
		padding: 0, spacing: 0,

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
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.truthy(created);
	t.is(created.title, "test window");
	t.is(created.width, 200);
	t.is(created.height, 150 + 15);
	t.is(created.widgets.length, 4);

	const label1 = created.widgets[0] as LabelWidget;
	t.is(label1.type, "label");
	t.is(label1.text, "hello world");
	t.is(label1.x, 0);
	t.is(label1.y, 15 + 2);
	t.is(label1.width, 200);
	t.is(label1.height, 50);

	const button1 = created.widgets[1] as ButtonWidget;
	t.is(button1.type, "button");
	t.is(button1.text, "left button");
	t.is(button1.x, 0);
	t.is(button1.y, 50 + 15);
	t.is(button1.width, 100);
	t.is(button1.height, 50);

	const button2 = created.widgets[2] as ButtonWidget;
	t.is(button2.type, "button");
	t.is(button2.text, "right button");
	t.is(button2.x, 100);
	t.is(button2.y, 50 + 15);
	t.is(button2.width, 100);
	t.is(button2.height, 50);

	const label2 = created.widgets[3] as LabelWidget;
	t.is(label2.type, "label");
	t.is(label2.text, "big area");
	t.is(label2.textAlign, "centred");
	t.is(label2.x, 0);
	t.is(label2.y, 100 + 2 + 15);
	t.is(label2.width, 200);
	t.is(label2.height, 50);
});


test("Simple window with single widget", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: 200, height: 150 + 15, padding: 0, spacing: 0,
		content: [
			button({ text: "hello world", width: 100, height: 50 })
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.truthy(created);
	t.is(created.title, "test window");
	t.is(created.width, 200);
	t.is(created.height, 150 + 15);
	t.is(created.widgets.length, 1);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.type, "button");
	t.is(button1.text, "hello world");
	t.is(button1.x, 0);
	t.is(button1.y, 15);
	t.is(button1.width, 100);
	t.is(button1.height, 50);
});


test("Simple window with single 100% widget", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: 200, height: 150 + 15, padding: 8, spacing: 0,
		content: [
			button({ text: "hello world", width: "100%", height: "100%" })
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.truthy(created);
	t.is(created.title, "test window");
	t.is(created.width, 200);
	t.is(created.height, 150 + 15);
	t.is(created.widgets.length, 1);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.type, "button");
	t.is(button1.text, "hello world");
	t.is(button1.x, 8);
	t.is(button1.y, 8 + 15);
	t.is(button1.width, 200 - 16);
	t.is(button1.height, 150 - 16);
});


test("Simple window with default padding and spacing", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: 200, height: 75 + 15,
		content: [
			button({ text: "hello one" }),
			button({ text: "hello two" })
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.truthy(created);
	t.is(created.title, "test window");
	t.is(created.width, 200);
	t.is(created.height, 75 + 15);
	t.is(created.widgets.length, 2);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.type, "button");
	t.is(button1.text, "hello one");
	t.is(button1.x, 5);
	t.is(button1.y, 5 + 15);
	t.is(button1.width, 200 - 10);
	t.is(button1.height, 30); // rounded down from 30.5

	const button2 = created.widgets[1] as ButtonWidget;
	t.is(button2.type, "button");
	t.is(button2.text, "hello two");
	t.is(button2.x, 5);
	t.is(button2.y, 5 + 31 + 4 + 15); // 31 rounded up from 30.5
	t.is(button2.width, 200 - 10);
	t.is(button2.height, 30); // rounded down from 30.5
});


test("Window adjusts to resize", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: { value: 200, min: 100, max: 500 },
		height: { value: 150 + 15, min: 50, max: 400 },
		padding: 0, spacing: 0,

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
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created.width, 200);
	t.is(created.height, 150 + 15);
	t.is(created.minWidth, 100);
	t.is(created.minHeight, 50);
	t.is(created.maxWidth, 500);
	t.is(created.maxHeight, 400);

	created.width = 400;
	created.height = 300 + 15;
	call(created.onUpdate);

	const label1 = created.widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 15 + 2);
	t.is(label1.width, 400);
	t.is(label1.height, 100);

	const button1 = created.widgets[1] as ButtonWidget;
	t.is(button1.x, 0);
	t.is(button1.y, 100 + 15);
	t.is(button1.width, 200);
	t.is(button1.height, 100);

	const button2 = created.widgets[2] as ButtonWidget;
	t.is(button2.x, 200);
	t.is(button2.y, 100 + 15);
	t.is(button2.width, 200);
	t.is(button2.height, 100);

	const label2 = created.widgets[3] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 200 + 2 + 15);
	t.is(label2.width, 400);
	t.is(label2.height, 100);
});


test("Window does not resize if size hasn't changed", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: { value: 200, min: 100, max: 500 },
		height: { value: 150 + 15, min: 50, max: 400 },
		padding: 0, spacing: 0,

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
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	call(created.onUpdate);

	const label1 = created.widgets[0] as LabelWidget;
	t.is(label1.x, 0);
	t.is(label1.y, 15 + 2);
	t.is(label1.width, 200);
	t.is(label1.height, 50);

	const button1 = created.widgets[1] as ButtonWidget;
	t.is(button1.x, 0);
	t.is(button1.y, 50 + 15);
	t.is(button1.width, 100);
	t.is(button1.height, 50);

	const button2 = created.widgets[2] as ButtonWidget;
	t.is(button2.x, 100);
	t.is(button2.y, 50 + 15);
	t.is(button2.width, 100);
	t.is(button2.height, 50);

	const label2 = created.widgets[3] as LabelWidget;
	t.is(label2.x, 0);
	t.is(label2.y, 100 + 2 + 15);
	t.is(label2.width, 200);
	t.is(label2.height, 50);
});


test("Window does auto resizes to content", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: "auto", height: "auto", padding: 5,
		content: [
			button({ text: "hello world", width: 100, height: 30 })
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created.width, 100 + 10);
	t.is(created.height, 30 + 10 + 15);
	t.is(created.minWidth, created.width);
	t.is(created.minHeight, created.height);
	t.is(created.maxWidth, created.width);
	t.is(created.maxHeight, created.height);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.x, 5);
	t.is(button1.y, 15 + 5);
	t.is(button1.width, 100);
	t.is(button1.height, 30);
});


test("Window does auto resizes to nested content", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: "auto", height: "auto", padding: 5,
		content: [
			groupbox([
				button({ text: "hello world", width: 100, height: 30 })
			])
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created.width, 100 + 12 + 10);
	t.is(created.height, 30 + 12 + 10 + 15);

	const box1 = created.widgets[0] as GroupBoxWidget;
	t.is(box1.x, 5);
	t.is(box1.y, 15 + 5 - 4);
	t.is(box1.width, 100 + 12);
	t.is(box1.height, 30 + 12 + 4);
	const button1 = created.widgets[1] as ButtonWidget;
	t.is(button1.x, 5 + 6);
	t.is(button1.y, 15 + 6 + 5);
	t.is(button1.width, 100);
	t.is(button1.height, 30);
});


test("Window does auto resizes to body size changes", t =>
{
	globalThis.ui = Mock.ui();

	const visible = store<ElementVisibility>("visible");
	const template = window({
		title: "test window",
		width: "auto", height: "auto", padding: 5, spacing: 8,
		content: [
			button({ text: "hello world", width: 100, height: 30 }),
			button({ text: "maybe hello", width: 100, height: 30, visibility: visible }),
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created.width, 100 + 10);
	t.is(created.height, 30 + 10 + 8 + 30 + 15);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.x, 5);
	t.is(button1.y, 15 + 5);
	t.is(button1.width, 100);
	t.is(button1.height, 30);

	const button2 = created.widgets[1] as ButtonWidget;
	t.is(button2.x, 5);
	t.is(button2.y, 15 + 5 + 30 + 8);
	t.is(button2.width, 100);
	t.is(button2.height, 30);
	t.true(button2.isVisible);

	visible.set("none");
	call(created.onUpdate);
	t.is(created.width, 100 + 10);
	t.is(created.height, 30 + 10 + 15);

	t.is(button1.x, 5);
	t.is(button1.y, 15 + 5);
	t.is(button1.width, 100);
	t.is(button1.height, 30);

	t.false(button2.isVisible);
});


test("Window with auto resize errors with relative child width", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: "auto", height: 50, padding: 5,
		content: [
			button({ text: "hello world", width: "100%", height: 30 })
		]
	});

	const error = t.throws(() =>
	{
		template.open();
	});
	t.is(error?.message, "Window body width must resolve to absolute size for \"auto\" window size.");
});


test("Window with auto resize errors with relative child height", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: 100, height: "auto", padding: 5,
		content: [
			button({ text: "hello world", width: 50, height: "1w" })
		]
	});

	const error = t.throws(() =>
	{
		template.open();
	});
	t.is(error?.message, "Window body height must resolve to absolute size for \"auto\" window size.");
});


test("Window with auto resize errors with relative window padding", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: "auto", height: 50, padding: "10%",
		content: [
			button({ text: "hello world", width: 50, height: 30 })
		]
	});

	const error = t.throws(() =>
	{
		template.open();
	});
	t.is(error?.message, "Window padding must be absolute for \"auto\" window size.");
});


test("Window updates to bindings", t =>
{
	globalThis.ui = Mock.ui();

	const viewmodel = {
		labelText: store("test"),
		labelAlign: store<TextAlignment>("centred"),
		buttonText: store("click me"),
		buttonPressed: store(true)
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

	const created = (globalThis.ui as UiMock).createdWindows[0];

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


test("Window title is bindable", t =>
{
	globalThis.ui = Mock.ui();

	const viewmodel = {
		title: store("test")
	};

	const template = window({
		title: viewmodel.title, width: 100, height: 100,
		content: [
			label({ text: "some text" })
		]
	});
	template.open();

	const created1 = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created1.title, "test");

	viewmodel.title.set("blub");
	t.is(created1.title, "blub");

	template.close();
	viewmodel.title.set("bobby");
	t.is(created1.title, "blub"); // dont update on close

	template.open();
	const created2 = (globalThis.ui as UiMock).createdWindows[0];
	t.is(created1.title, "blub");
	t.is(created2.title, "bobby");
});


test("Window applies padding", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window", width: 150, height: 100,
		padding: 15,
		content: [
			button({ text: "click" })
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.x, 15);
	t.is(button1.y, 15 + 15);
	t.is(button1.width, 120);
	t.is(button1.height, 70 - 15);
});


test("Window applies padding to resizes", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window",
		width: { value: 150, min: 100, max: 500 },
		height: { value: 100, min: 50, max: 400 },
		padding: 20,
		content: [
			button({ text: "click" })
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	created.width = 250;
	created.height = 300;
	call(created.onUpdate);

	const button1 = created.widgets[0] as ButtonWidget;
	t.is(button1.x, 20);
	t.is(button1.y, 20 + 15);
	t.is(button1.width, 210);
	t.is(button1.height, 260 - 15);
});


test("Window events are triggered", t =>
{
	globalThis.ui = Mock.ui();
	const hits: [string, FrameContext][] = [];

	const template = window({
		width: 150, height: 100,
		onOpen: ((c: FrameContext) => hits.push(["open", c])) as unknown as (() => void),
		onUpdate: ((c: FrameContext) => hits.push(["update", c])) as unknown as (() => void),
		onClose: ((c: FrameContext) => hits.push(["close", c])) as unknown as (() => void),
		content: [
			button({ image: 342 }),
			label({ text: "hello"})
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows[0];
	t.is(hits.length, 1);
	t.is(hits[0][0], "open");
	t.truthy(hits[0][1]);

	call(created.onUpdate);
	t.is(hits.length, 2);
	t.is(hits[1][0], "update");
	t.truthy(hits[1][1]);

	call(created.onClose);
	t.is(hits.length, 3);
	t.is(hits[2][0], "close");
	t.truthy(hits[2][1]);
});


test("Window focuses on double open", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window", width: 150, height: 100,
		content: [
			button({ text: "click" })
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows;
	t.is(created.length, 1);
	t.is(created[0].title, "test window");
	t.true(created[0].isOpen);

	template.open();
	t.is(created.length, 1);
	t.is(created[0].title, "test window");
	t.true(created[0].isOpen);
});


test("Window can be reopened after closing", t =>
{
	globalThis.ui = Mock.ui();

	const template = window({
		title: "test window", width: 150, height: 100,
		content: [
			button({ text: "click" })
		]
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows;
	t.is(created.length, 1);
	t.is(created[0].title, "test window");

	call(created[0].onClose); // emulate click on close

	template.open();
	t.is(created.length, 2);
	t.is(created[0].title, "test window");
	t.is(created[1].title, "test window");
});


test("Window opens at unspecified default position", t =>
{
	globalThis.ui = Mock.ui({ width: 1920, height: 1080 });

	const template = window({
		title: "test window", width: 150, height: 100,
		content: []
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows;
	t.is(created.length, 1);
	t.is(created[0].title, "test window");
	t.is<number|undefined, number|undefined>(created[0].x, undefined);
	t.is<number|undefined, number|undefined>(created[0].y, undefined);
});


test("Window opens at specified default position", t =>
{
	globalThis.ui = Mock.ui({ width: 1920, height: 1080 });

	const template = window({
		title: "test window", width: 150, height: 100,
		position: "default",
		content: []
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows;
	t.is(created.length, 1);
	t.is(created[0].title, "test window");
	t.is<number|undefined, number|undefined>(created[0].x, undefined);
	t.is<number|undefined, number|undefined>(created[0].y, undefined);
});


test("Window opens at center position", t =>
{
	globalThis.ui = Mock.ui({ width: 1920, height: 1080 });

	const template = window({
		title: "test window", width: 150, height: 100,
		position: "center",
		content: []
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows;
	t.is(created.length, 1);
	t.is(created[0].title, "test window");
	t.is(created[0].x, (1920 / 2) - (150 / 2));
	t.is(created[0].y, (1080 / 2) - (100 / 2));
});


test("Window opens at specified position", t =>
{
	globalThis.ui = Mock.ui({ width: 1920, height: 1080 });

	const template = window({
		title: "test window", width: 150, height: 100,
		position: { x: 100, y: 950 },
		content: []
	});
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows;
	t.is(created.length, 1);
	t.is(created[0].title, "test window");
	t.is(created[0].x, 100);
	t.is(created[0].y, 950);
});


test("Window opens at center position after game window resize", t =>
{
	const uiMock = mutable(Mock.ui({ width: 1920, height: 1080 }));
	globalThis.ui = uiMock;

	const template = window({
		title: "test window", width: 150, height: 100,
		position: "center",
		content: []
	});
	template.open();
	template.close();

	uiMock.width = 1280;
	uiMock.height = 720;
	template.open();

	const created = (globalThis.ui as UiMock).createdWindows;
	t.is(created.length, 2);
	t.is(created[0].title, "test window");
	t.is(created[0].x, (1280 / 2) - (150 / 2));
	t.is(created[0].y, (720 / 2) - (100 / 2));
});