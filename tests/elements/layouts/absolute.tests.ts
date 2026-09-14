/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { button } from "@src/elements/controls/button";
import { label } from "@src/elements/controls/label";
import { absolute } from "@src/elements/layouts/absolute/absolute";
import { vertical } from "@src/elements/layouts/flexible/flexible";
import { Scale } from "@src/positional/scale";
import { Visibility } from "@src/positional/visibility";
import { window } from "@src/windows/window";
import test from "ava";
import Mock from "openrct2-mocks";
import { call } from "../../helpers/call";


test("Simple layout with widgets", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			absolute({
				content: [
					label({
						x: 21, y: 34, width: 43, height: 19,
						text: "Look at me!"
					}),
					button({
						x: 42, y: 11, width: 32, height: 68,
						text: "Click me!"
					})
				]
			})
		]
	});
	template.open();

	const widget1 = <LabelWidget>mock.createdWindows[0].widgets[0];
	t.is(widget1.type, "label");
	t.is(widget1.text, "Look at me!");
	t.is(widget1.x, 21);
	t.is(widget1.y, 34 + 2 + 15);
	t.is(widget1.width, 43);
	t.is(widget1.height, 19);

	const widget2 = <ButtonWidget>mock.createdWindows[0].widgets[1];
	t.is(widget2.type, "button");
	t.is(widget2.text, "Click me!");
	t.is(widget2.x, 42);
	t.is(widget2.y, 11 + 15);
	t.is(widget2.width, 32);
	t.is(widget2.height, 68);
});


test("Flat layout with widgets", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			absolute([
				button({
					x: 43, y: 12, width: 33, height: 70,
					text: "Click me!"
				}),
				label({
					x: 22, y: 35, width: 44, height: 20,
					text: "Look at me!"
				})
			])
		]
	});
	template.open();

	const widget2 = <ButtonWidget>mock.createdWindows[0].widgets[0];
	t.is(widget2.type, "button");
	t.is(widget2.text, "Click me!");
	t.is(widget2.x, 43);
	t.is(widget2.y, 12 + 15);
	t.is(widget2.width, 33);
	t.is(widget2.height, 70);

	const widget1 = <LabelWidget>mock.createdWindows[0].widgets[1];
	t.is(widget1.type, "label");
	t.is(widget1.text, "Look at me!");
	t.is(widget1.x, 22);
	t.is(widget1.y, 35 + 2 + 15);
	t.is(widget1.width, 44);
	t.is(widget1.height, 20);
});


test("Child with visibility none is hidden and skipped in layout", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			absolute([
				button({ x: 10, y: 10, width: 30, height: 30, text: "shown" }),
				label({ x: 20, y: 20, width: 40, height: 40, text: "gone", visibility: "none" })
			])
		]
	});
	template.open();

	const shown = mock.createdWindows[0].widgets[0];
	const gone = mock.createdWindows[0].widgets[1];

	t.is(shown.x, 10);
	t.is(shown.width, 30);
	t.false(gone.isVisible);
	// The "none" child is skipped, so its geometry is never set by the layout pass.
	t.is(gone.width, 0);
	t.is(gone.height, 0);
});


test("Child visibility in absolute layout is updated by store", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const visibility = store<Visibility>("visible");
	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			absolute([
				button({ x: 10, y: 10, width: 30, height: 30, text: "a" }),
				button({ x: 20, y: 20, width: 40, height: 40, text: "b", visibility })
			])
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const a = created.widgets[0];
	const b = created.widgets[1];
	t.true(b.isVisible);
	t.is(b.x, 20);
	t.is(b.y, 15 + 20);
	t.is(b.width, 40);

	visibility.set("none");
	call(created.onUpdate);
	t.false(b.isVisible);
	t.true(a.isVisible); // siblings are untouched
	t.is(a.x, 10);

	visibility.set("visible");
	call(created.onUpdate);
	t.true(b.isVisible);
	t.is(b.x, 20);
	t.is(b.width, 40);
});


test("Hidden child in absolute layout still counts toward weighted sizes, none does not", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	function open(visibility: Visibility): void
	{
		window({
			width: 100, height: 100 + 15, padding: 0,
			content: [
				absolute([
					button({ x: 0, y: 0, width: "1w", height: "1w", text: "a" }),
					button({ x: 0, y: 0, width: "1w", height: "1w", text: "b", visibility })
				])
			]
		}).open();
	}

	open("hidden");
	const hidden = mock.createdWindows[0].widgets;
	t.is(hidden[0].width, 50); // two weighted children share the width and height
	t.is(hidden[0].height, 50);
	t.false(hidden[1].isVisible);

	open("none");
	const none = mock.createdWindows[0].widgets;
	t.is(none[0].width, 100); // the none child is left out of the weights
	t.is(none[0].height, 100);
	t.false(none[1].isVisible);
});


test("Absolute layout inside a hidden container hides all its children", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0, spacing: 0,
		content: [
			vertical({
				visibility: "none",
				content: [
					absolute([
						button({ x: 10, y: 10, width: 30, height: 30, text: "a" }),
						button({ x: 20, y: 20, width: 40, height: 40, text: "b" })
					])
				]
			}),
			button({ text: "shown", height: 20 })
		]
	});
	template.open();

	const widgets = mock.createdWindows[0].widgets;
	t.false(widgets[0].isVisible);
	t.false(widgets[1].isVisible);
	t.true(widgets[2].isVisible);
	t.is(widgets[2].y, 15); // the hidden container took up no space
});


test("Container inside absolute layout is hidden by its own visibility", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100 + 15, padding: 0,
		content: [
			absolute([
				vertical({
					x: 10, y: 10, width: 80, height: 40, visibility: "none",
					content: [button({ text: "gone", height: 20 })]
				}),
				vertical({
					x: 10, y: 50, width: 80, height: 40, visibility: "hidden",
					content: [button({ text: "hidden", height: 20 })]
				}),
				button({ x: 10, y: 90, width: 30, height: 10, text: "shown" })
			])
		]
	});
	template.open();

	const widgets = mock.createdWindows[0].widgets;
	t.false(widgets[0].isVisible); // the none container hides its child...
	t.is(widgets[0].width, 0); // ...and never lays it out
	t.false(widgets[1].isVisible); // the hidden container hides its child as well
	t.true(widgets[2].isVisible);
	t.is(widgets[2].x, 10);
	t.is(widgets[2].y, 15 + 90);
});


test("Container visibility inside absolute layout is updated by store", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const visibility = store<Visibility>("visible");
	const template = window({
		width: 100, height: 100 + 15, padding: 0,
		content: [
			absolute([
				vertical({
					x: 10, y: 10, width: 80, height: 40, visibility,
					content: [button({ text: "inner", height: 20 })]
				})
			])
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const inner = created.widgets[0];
	t.true(inner.isVisible);
	t.is(inner.x, 10);
	t.is(inner.y, 15 + 10);
	t.is(inner.width, 80);
	t.is(inner.height, 20);

	visibility.set("hidden");
	call(created.onUpdate);
	t.false(inner.isVisible);

	visibility.set("none");
	call(created.onUpdate);
	t.false(inner.isVisible);

	visibility.set("visible");
	call(created.onUpdate);
	t.true(inner.isVisible);
	t.is(inner.x, 10);
	t.is(inner.y, 15 + 10);
	t.is(inner.width, 80);
	t.is(inner.height, 20);
});


test("Child position and size in absolute layout are updated by stores", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const x = store<Scale>(10);
	const y = store<Scale>(20);
	const width = store<Scale>(30);
	const height = store<Scale>(40);
	const template = window({
		width: 100, height: 100 + 15, padding: 0,
		content: [
			absolute([
				button({ x, y, width, height, text: "a" }),
				button({ x: 0, y: 0, width: "1w", height: 20, text: "b" })
			])
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const first = created.widgets[0];
	const second = created.widgets[1];
	t.is(first.x, 10);
	t.is(first.y, 15 + 20);
	t.is(first.width, 30);
	t.is(first.height, 40);
	t.is(second.width, 100); // the only weighted child takes all the width

	x.set(50);
	y.set("50%");
	width.set("1w");
	height.set(10);
	call(created.onUpdate);

	t.is(first.x, 50);
	t.is(first.y, 15 + 50); // 50% of the 100px body
	t.is(first.width, 50); // now shares the weighted width with "b"
	t.is(first.height, 10);
	t.is(second.width, 50);
});


test("Weighted sizes in absolute layout are recalculated when a child is toggled by store", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const visibility = store<Visibility>("visible");
	const template = window({
		width: 100, height: 100 + 15, padding: 0,
		content: [
			absolute([
				button({ x: 0, y: 0, width: "1w", height: "1w", text: "a" }),
				button({ x: 0, y: 0, width: "1w", height: "1w", text: "b", visibility })
			])
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const widget = created.widgets[0];
	t.is(widget.width, 50);
	t.is(widget.height, 50);

	visibility.set("none");
	call(created.onUpdate);
	t.is(widget.width, 100); // "b" no longer takes part in the weights
	t.is(widget.height, 100);

	visibility.set("hidden");
	call(created.onUpdate);
	t.is(widget.width, 50); // hidden takes up space again
	t.is(widget.height, 50);
});
