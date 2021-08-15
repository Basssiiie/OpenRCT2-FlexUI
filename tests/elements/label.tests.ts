/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import fui from "../../src/fui";


test("Static values are set", t =>
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
	t.is("label", label.type);
	t.is("static", label.text);
	t.is("centred", label.textAlign);
	t.is("tip", label.tooltip);
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
	t.is("Hello", label1.text);

	text.set("Bye");
	t.is("Bye", label1.text);

	template.close();
	text.set("Still there");
	template.open();

	const label2 = mock.createdWindows[1].widgets[0] as LabelWidget;
	t.is("Still there", label2.text);
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
	t.is("centred", label1.textAlign);

	alignment.set("left");
	t.is("left", label1.textAlign);

	template.close();
	alignment.set("centred");
	template.open();

	const label2 = mock.createdWindows[1].widgets[0] as LabelWidget;
	t.is("centred", label2.textAlign);
});