/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { window } from "@src/windows/window";
import { spinner } from "@src/elements/controls/spinner";
import test from "ava";
import Mock from "openrct2-mocks";
import { call } from "tests/helpers";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 45, tooltip: "spin me" })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerWidget;
	t.is(widget.type, "spinner");
	t.is(widget.text, "45", );
	t.is(widget.tooltip, "spin me");
});


test("Value is bindable", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const value = store(33);
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
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 41, step: 4, minimum: 0, maximum: 222 })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	t.is(widget.text, "41");

	call(widget.onIncrement);
	t.is(widget.text, "45");

	call(widget.onDecrement);
	t.is(widget.text, "41");
});


test("Incremented value gets clamped", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 15, step: 10, minimum: 0, maximum: 20, wrapMode: "clamp" })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	t.is(widget.text, "15");

	call(widget.onIncrement);
	t.is(widget.text, "20");

	call(widget.onIncrement);
	t.is(widget.text, "20");
});


test("Decremented value gets clamped", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 15, step: 8, minimum: 10, maximum: 20, wrapMode: "clamp" })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	t.is(widget.text, "15");

	call(widget.onDecrement);
	t.is(widget.text, "10");

	call(widget.onDecrement);
	t.is(widget.text, "10");
});


test("Incremented value gets wrapped", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 6, step: 8, minimum: 0, maximum: 10, wrapMode: "wrap" })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	t.is(widget.text, "6");

	call(widget.onIncrement);
	t.is(widget.text, "0");

	call(widget.onIncrement);
	t.is(widget.text, "8");
});


test("Decremented value gets wrapped", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 4, step: 8, minimum: 0, maximum: 10, wrapMode: "wrap" })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	t.is(widget.text, "4");

	call(widget.onDecrement);
	t.is(widget.text, "10");

	call(widget.onDecrement);
	t.is(widget.text, "2");
});


test("Incremented value gets clamped then wrapped", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 6, step: 8, minimum: 0, maximum: 10, wrapMode: "clampThenWrap" })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	t.is(widget.text, "6");

	call(widget.onIncrement);
	t.is(widget.text, "10");

	call(widget.onIncrement);
	t.is(widget.text, "0");

	call(widget.onIncrement);
	t.is(widget.text, "8");
});


test("Decremented value gets clamped then wrapped", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 4, step: 8, minimum: 0, maximum: 10, wrapMode: "clampThenWrap" })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	t.is(widget.text, "4");

	call(widget.onDecrement);
	t.is(widget.text, "0");

	call(widget.onDecrement);
	t.is(widget.text, "10");
});


test("Change event gets called", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;
	const hits: [number, number][] = [];

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ step: 3, minimum: 0, maximum: 7, wrapMode: "wrap", onChange: (v, a) => hits.push([v, a]) })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	call(widget.onIncrement);
	call(widget.onIncrement);
	call(widget.onIncrement);
	call(widget.onDecrement);
	call(widget.onDecrement);

	t.deepEqual(hits, [
		[3, 3], [6, 3], [0, 3], [7, -3], [4, -3]
	]);
});


test("Throw error on minimum larger than maximum", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const error = t.throws(() =>
	{
		window({
			width: 100, height: 100,
			content: [
				spinner({ value: 4, minimum: 5678, maximum: 1234, wrapMode: "wrap" })
			]
		});
	});
	t.truthy(error);
	t.not(error?.message.indexOf("5678"), -1);
	t.not(error?.message.indexOf("1234"), -1);
	t.not(error?.message.indexOf("is larger than maximum"), -1);
});


test("Minimum equal to maximum does nothing", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 4, minimum: 10, maximum: 10, wrapMode: "wrap", onChange: () => t.fail() })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	call(widget.onIncrement);
	call(widget.onDecrement);
	t.pass();
});


test("Step is bindable", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const step = store(1);
	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ step, minimum: 0, maximum: 1000, wrapMode: "wrap" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	call(widget.onIncrement);
	t.is(widget.text, "1");

	step.set(4);
	call(widget.onIncrement);
	t.is(widget.text, "5");

	step.set(16);
	call(widget.onIncrement);
	t.is(widget.text, "21");

	step.set(18);
	call(widget.onDecrement);
	t.is(widget.text, "3");
});


test("Minimum is bindable", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const minimum = store(0);
	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ minimum, maximum: 10, wrapMode: "wrap" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	call(widget.onDecrement);
	t.is(widget.text, "10");

	minimum.set(8);
	call(widget.onDecrement);
	t.is(widget.text, "9");
	call(widget.onDecrement);
	t.is(widget.text, "8");
	call(widget.onDecrement);
	t.is(widget.text, "10");
});


test("Maximum is bindable", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const maximum = store(2);
	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ minimum: 0, maximum, wrapMode: "wrap" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	call(widget.onIncrement);
	t.is(widget.text, "1");
	call(widget.onIncrement);
	t.is(widget.text, "2");
	call(widget.onIncrement);
	t.is(widget.text, "0");

	maximum.set(4);
	call(widget.onIncrement);
	t.is(widget.text, "1");
	call(widget.onIncrement);
	t.is(widget.text, "2");
	call(widget.onIncrement);
	t.is(widget.text, "3");
	call(widget.onIncrement);
	t.is(widget.text, "4");
	call(widget.onIncrement);
	t.is(widget.text, "0");
});


test("Disabled message shows on disabled", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const disabled = store(false);
	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ disabled, disabledMessage: "I won't do anything!", minimum: 0, maximum: 10, wrapMode: "wrap" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	call(widget.onIncrement);
	t.is(widget.text, "1");

	disabled.set(true);
	t.is(widget.text, "I won't do anything!");
	call(widget.onIncrement);
	t.is(widget.text, "I won't do anything!");
	call(widget.onDecrement);
	t.is(widget.text, "I won't do anything!");

	disabled.set(false);
	t.is(widget.text, "1");
	call(widget.onIncrement);
	t.is(widget.text, "2");
	call(widget.onIncrement);
	t.is(widget.text, "3");
});


test("Default minimum is clamped at smallest 32-bit signed integer", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 1, step: 3_000_000_000 })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	t.is(widget.type, "spinner");

	widget.onDecrement?.();
	t.is(widget.text, "-2147483648");
});


test("Default maximum is clamped at largest 32-bit signed integer", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			spinner({ value: 1, step: 3_000_000_000 })
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	t.is(widget.type, "spinner");

	widget.onIncrement?.();
	t.is(widget.text, "2147483647");
});


test("Update maximum clamps value", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const maximum = store(100);
	const hits: number[] = [];
	const template = window({
		width: 100, height: 100,
		content: [
			spinner({
				value: 65,
				maximum,
				onChange: v => hits.push(v)
			})
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	t.is(widget.type, "spinner");
	t.is(widget.text, "65");

	maximum.set(80);
	t.is(widget.text, "65");
	t.deepEqual(hits, []); // no change necessary

	maximum.set(50);
	t.is(widget.text, "50");
	t.deepEqual(hits, [ 50 ]);
});


test("Update minimum clamps value", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const minimum = store(10);
	const hits: number[] = [];
	const template = window({
		width: 100, height: 100,
		content: [
			spinner({
				value: 65,
				minimum,
				onChange: v => hits.push(v)
			})
		]
	});

	template.open();

	const widget = mock.createdWindows[0].widgets[0] as SpinnerDesc;
	t.is(widget.type, "spinner");
	t.is(widget.text, "65");

	minimum.set(40);
	t.is(widget.text, "65");
	t.deepEqual(hits, []); // no change necessary

	minimum.set(80);
	t.is(widget.text, "80");
	t.deepEqual(hits, [ 80 ]);
});