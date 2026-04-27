/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { twoway } from "@src/bindings/twoway/twoway";
import { textbox } from "@src/elements/controls/textbox";
import { window } from "@src/windows/window";
import test from "ava";
import Mock from "openrct2-mocks";
import { call } from "../../helpers/call";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			textbox({ text: "Hello world", maxLength: 50, tooltip: "Enter text" })
		]
	});
	template.open();

	const widget = <TextBoxDesc>mock.createdWindows[0].widgets[0];
	t.is(widget.type, "textbox");
	t.is(widget.text, "Hello world");
	t.is(widget.maxLength, 50);
	t.is(widget.tooltip, "Enter text");
});


test("Text is bindable", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const text = store("initial");
	const template = window({
		width: 100, height: 100,
		content: [
			textbox({ text })
		]
	});
	template.open();

	const widget = <TextBoxDesc>mock.createdWindows[0].widgets[0];
	t.is(widget.text, "initial");

	text.set("updated");
	t.is(widget.text, "updated");

	text.set("");
	t.is(widget.text, "");
});


test("Maximum length is bindable", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const maxLen = store(10);
	const template = window({
		width: 100, height: 100,
		content: [
			textbox({ maxLength: maxLen })
		]
	});
	template.open();

	const widget = <TextBoxDesc>mock.createdWindows[0].widgets[0];
	t.is(widget.maxLength, 10);

	maxLen.set(100);
	t.is(widget.maxLength, 100);
});


test("Change event gets called", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const hits: string[] = [];
	const template = window({
		width: 100, height: 100,
		content: [
			textbox({ onChange: v => hits.push(v) })
		]
	});
	template.open();

	const widget = <TextBoxDesc>mock.createdWindows[0].widgets[0];
	call(widget.onChange, "abc");
	call(widget.onChange, "def");
	call(widget.onChange, "");

	t.deepEqual(hits, ["abc", "def", ""]);
});


test("One-way text binding does not attach onChange", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const text = store("bound");
	const template = window({
		width: 100, height: 100,
		content: [
			textbox({ text })
		]
	});
	template.open();

	const widget = <TextBoxDesc>mock.createdWindows[0].widgets[0];
	t.is(widget.text, "bound");
	t.falsy(widget.onChange);

	text.set("changed");
	t.is(widget.text, "changed");
});


test("Two-way bindings update textbox", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const text = store("start");
	const hits: string[] = [];

	const template = window({
		width: 100, height: 100,
		content: [
			textbox({
				text: twoway(text),
				onChange: v => hits.push(v)
			})
		]
	});
	template.open();

	const widget = <TextBoxDesc>mock.createdWindows[0].widgets[0];
	t.is(widget.text, "start");
	t.is(text.get(), "start");
	t.deepEqual(hits, []);

	// Store update: updates widget silently (no onChange)
	text.set("from store");
	t.is(widget.text, "from store");
	t.is(text.get(), "from store");
	t.deepEqual(hits, []);

	// Widget interaction: updates both widget and store, fires onChange
	call(widget.onChange, "from widget");
	t.is(widget.text, "from widget");
	t.is(text.get(), "from widget");
	t.deepEqual(hits, ["from widget"]);

	// Another widget interaction
	call(widget.onChange, "again");
	t.is(widget.text, "again");
	t.is(text.get(), "again");
	t.deepEqual(hits, ["from widget", "again"]);
});
