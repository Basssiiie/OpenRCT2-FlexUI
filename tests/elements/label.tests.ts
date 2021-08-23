/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import fui from "@src/fui";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.label({
			text: "static",
			alignment: "centred",
			tooltip: "tip"
		})
	});

	template.open();

	const label = mock.createdWindows[0].widgets[0] as LabelWidget;
	t.is(label.type, "label");
	t.is(label.text, "static");
	t.is(label.textAlign, "centred");
	t.is(label.tooltip, "tip");
});


test("Text is bindable", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const text = fui.observable("Hello");
	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.label({ text: text })
	});

	template.open();

	const label1 = mock.createdWindows[0].widgets[0] as LabelWidget;
	t.is(label1.text, "Hello");

	text.set("Bye");
	t.is(label1.text, "Bye");

	template.close();
	text.set("Still there");
	template.open();

	const label2 = mock.createdWindows[1].widgets[0] as LabelWidget;
	t.is(label2.text, "Still there");
});


test("Alignment is bindable", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const alignment = fui.observable<TextAlignment>("centred");
	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.label({ text: "test", alignment: alignment })
	});

	template.open();

	const label1 = mock.createdWindows[0].widgets[0] as LabelWidget;
	t.is(label1.textAlign, "centred");

	alignment.set("left");
	t.is(label1.textAlign, "left");

	template.close();
	alignment.set("centred");
	template.open();

	const label2 = mock.createdWindows[1].widgets[0] as LabelWidget;
	t.is(label2.textAlign, "centred");
});