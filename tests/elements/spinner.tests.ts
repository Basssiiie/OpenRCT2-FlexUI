/// <reference path="../../lib/openrct2.d.ts" />

import { window } from "@src/core/window";
import { spinner } from "@src/elements/spinner";
import { observable } from "@src/observables/observable";
import test from "ava";
import Mock from "openrct2-mocks";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 45, maximum: 222, tooltip: "spin me" })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is("spinner", widget.type);
	t.is("45", widget.text);
	t.is("spin me", widget.tooltip);
});


test("Value is bindable", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const value = observable(33);
	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: value, maximum: 222 })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is(widget.text, "33");

	value.set(76);
	t.is(widget.text, "76");
});


test("Value can be incremented/decremented", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 41, increment: 4,	maximum: 222 })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is(widget.text, "41");

	widget.onIncrement?.();
	t.is(widget.text, "45");

	widget.onDecrement?.();
	t.is(widget.text, "41");
});


test("Incremented value gets clamped", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 15, increment: 10, maximum: 20, wrapMode: "clamp" })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is(widget.text, "15");

	widget.onIncrement?.();
	t.is(widget.text, "19");

	widget.onIncrement?.();
	t.is(widget.text, "19");
});


test("Decremented value gets clamped", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 15, increment: 8, minimum: 10, maximum: 20, wrapMode: "clamp" })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is(widget.text, "15");

	widget.onDecrement?.();
	t.is(widget.text, "10");

	widget.onDecrement?.();
	t.is(widget.text, "10");
});


test("Incremented value gets wrapped", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 6, increment: 8, maximum: 10, wrapMode: "wrap" })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is(widget.text, "6");

	widget.onIncrement?.();
	t.is(widget.text, "0");

	widget.onIncrement?.();
	t.is(widget.text, "8");
});


test("Decremented value gets wrapped", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 4, increment: 8, maximum: 10, wrapMode: "wrap" })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is(widget.text, "4");

	widget.onDecrement?.();
	t.is(widget.text, "9");

	widget.onDecrement?.();
	t.is(widget.text, "1");
});


test("Incremented value gets clamped then wrapped", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 6, increment: 8, maximum: 10, wrapMode: "clampThenWrap" })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is(widget.text, "6");

	widget.onIncrement?.();
	t.is(widget.text, "9");

	widget.onIncrement?.();
	t.is(widget.text, "0");
});


test("Decremented value gets clamped then wrapped", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 4, increment: 8, maximum: 10, wrapMode: "clampThenWrap" })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is(widget.text, "4");

	widget.onDecrement?.();
	t.is(widget.text, "0");

	widget.onDecrement?.();
	t.is(widget.text, "9");
});


test("Change event gets called", t =>
{
	const mock = Mock.ui();
	global.ui = mock;
	const hits: [number, number][] = [];

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ increment: 3, maximum: 8, onChange: (v, a) => hits.push([v, a]) })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	widget.onIncrement?.();
	widget.onIncrement?.();
	widget.onIncrement?.();
	widget.onDecrement?.();
	widget.onDecrement?.();

	t.deepEqual(hits, [
		[3, 3], [6, 3], [0, 3], [7, -3], [4, -3]
	]);
});


test("Spinner throws on minimum larger than maximum", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const error = t.throws(() =>
	{
		window({
			width: 100, height: 100,
			content: [
				spinner({ value: 4, minimum: 5678, maximum: 1234 })
			]
		});
	});
	t.true(error.message.includes("5678"));
	t.true(error.message.includes("1234"));
	t.true(error.message.includes("is equal to or larger than maximum"));
});