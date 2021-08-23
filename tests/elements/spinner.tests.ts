/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import fui from "../../src/fui";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.spinner({ value: 45, maximum: 222, tooltip: "spin me" })
	});

	template.open();

	const spinner = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is("spinner", spinner.type);
	t.is("45", spinner.text);
	t.is("spin me", spinner.tooltip);
});


test("Value is bindable", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const value = fui.observable(33);
	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.spinner({ value: value, maximum: 222 })
	});

	template.open();

	const spinner = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is("33", spinner.text);

	value.set(76);
	t.is("76", spinner.text);
});


test("Value can be incremented/decremented", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.spinner({ value: 41, increment: 4,	maximum: 222 })
	});

	template.open();

	const spinner = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is("41", spinner.text);

	spinner.onIncrement?.();
	t.is("45", spinner.text);

	spinner.onDecrement?.();
	t.is("41", spinner.text);
});


test("Incremented value gets clamped", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.spinner({ value: 15, increment: 10, maximum: 20, wrapMode: "clamp" })
	});

	template.open();

	const spinner = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is("15", spinner.text);

	spinner.onIncrement?.();
	t.is("19", spinner.text);

	spinner.onIncrement?.();
	t.is("19", spinner.text);
});


test("Decremented value gets clamped", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.spinner({ value: 15, increment: 8, minimum: 10, maximum: 20, wrapMode: "clamp" })
	});

	template.open();

	const spinner = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is("15", spinner.text);

	spinner.onDecrement?.();
	t.is("10", spinner.text);

	spinner.onDecrement?.();
	t.is("10", spinner.text);
});


test("Incremented value gets wrapped", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.spinner({ value: 6, increment: 8, maximum: 10, wrapMode: "wrap" })
	});

	template.open();

	const spinner = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is("6", spinner.text);

	spinner.onIncrement?.();
	t.is("0", spinner.text);

	spinner.onIncrement?.();
	t.is("8", spinner.text);
});


test("Decremented value gets wrapped", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.spinner({ value: 4, increment: 8, maximum: 10, wrapMode: "wrap" })
	});

	template.open();

	const spinner = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is("4", spinner.text);

	spinner.onDecrement?.();
	t.is("9", spinner.text);

	spinner.onDecrement?.();
	t.is("1", spinner.text);
});


test("Incremented value gets clamped then wrapped", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.spinner({ value: 6, increment: 8, maximum: 10, wrapMode: "clampThenWrap" })
	});

	template.open();

	const spinner = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is("6", spinner.text);

	spinner.onIncrement?.();
	t.is("9", spinner.text);

	spinner.onIncrement?.();
	t.is("0", spinner.text);
});


test("Decremented value gets clamped then wrapped", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.spinner({ value: 4, increment: 8, maximum: 10, wrapMode: "clampThenWrap" })
	});

	template.open();

	const spinner = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is("4", spinner.text);

	spinner.onDecrement?.();
	t.is("0", spinner.text);

	spinner.onDecrement?.();
	t.is("9", spinner.text);
});


test("Change event gets called", t =>
{
	const mock = Mock.ui();
	global.ui = mock;
	const hits: [number, number][] = [];

	const template = fui.window({
		width: 100, height: 100,
		content: b => b
		.spinner({ increment: 3, maximum: 8, onChange: (v, a) => hits.push([v, a]) })
	});

	template.open();

	const spinner = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	spinner.onIncrement?.();
	spinner.onIncrement?.();
	spinner.onIncrement?.();
	spinner.onDecrement?.();
	spinner.onDecrement?.();

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
		fui.window({
			width: 100, height: 100,
			content: b => b
			.spinner({ value: 4, minimum: 5678, maximum: 1234 })
		});
	});
	t.true(error.message.includes("5678"));
	t.true(error.message.includes("1234"));
	t.true(error.message.includes("is equal to or larger than maximum"));
});