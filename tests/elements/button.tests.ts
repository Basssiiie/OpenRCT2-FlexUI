/// <reference path="../../lib/openrct2.d.ts" />

import { window } from "@src/core/window";
import { button } from "@src/elements/button";
import { observable } from "@src/observables/observableConstructor";
import test from "ava";
import Mock from "openrct2-mocks";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			button({ text: "Click me!", image: 123, isPressed: true, tooltip: "clickable" })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ButtonWidget;
	t.is(widget.type, "button");
	t.is(widget.text, "Click me!");
	t.true(widget.isPressed);
	t.is(widget.tooltip, "clickable");
});


test("Text is bindable", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const text = observable("bonjour");
	const template = window({
		width: 100, height: 100,
		content: [
			button({ text: text })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ButtonWidget;
	t.is(widget.text, "bonjour");

	text.set("annyeong");
	t.is(widget.text, "annyeong");
});


test("Image is bindable", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const image = observable(334);
	const template = window({
		width: 100, height: 100,
		content: [
			button({ image: image })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ButtonWidget;
	t.is(widget.image, 334);

	image.set(543);
	t.is(widget.image, 543);
});


test("Is pressed is bindable", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const pressed = observable(false);
	const template = window({
		width: 100, height: 100,
		content: [
			button({ isPressed: pressed })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ButtonWidget;
	t.false(widget.isPressed);

	pressed.set(true);
	t.true(widget.isPressed);
});


test("Click event gets called", t =>
{
	const mock = Mock.ui();
	global.ui = mock;
	let count = 0;

	const template = window({
		width: 100, height: 100,
		content: [
			button({ onClick: () => count++ })
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ButtonWidget;
	t.is(count, 0);

	widget.onClick?.();
	t.is(count, 1);

	widget.onClick?.();
	t.is(count, 2);

	widget.onClick?.();
	t.is(count, 3);
});
