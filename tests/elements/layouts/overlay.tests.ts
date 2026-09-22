/// <reference path="../../../lib/openrct2.d.ts" />

import { store } from "@src/bindings/stores/createStore";
import { read } from "@src/bindings/stores/read";
import { button } from "@src/elements/controls/button";
import { label } from "@src/elements/controls/label";
import { vertical } from "@src/elements/layouts/flexible/flexible";
import { overlay } from "@src/elements/layouts/overlay/overlay";
import { Scale } from "@src/positional/scale";
import { Visibility } from "@src/positional/visibility";
import { Event, invoke } from "@src/utilities/event";
import { noop } from "@src/utilities/noop";
import { WidgetBinder } from "@src/windows/binders/widgetBinder";
import { FrameContext } from "@src/windows/frames/frameContext";
import { FrameEvent } from "@src/windows/frames/frameEvent";
import { window } from "@src/windows/window";
import test from "ava";
import Mock from "openrct2-mocks";
import { call } from "../../helpers/call";


function createBuildOutput()
{
	return {
		widgets: new Array<Widget>(),
		binder: new WidgetBinder(),
		context: <FrameContext>{ redraw: noop },
		open: <Event>[],
		redraw: <Event>[],
		update: <Event>[],
		close: <Event>[],
		add(widget: WidgetBaseDesc): void
		{
			this.widgets.push(<Widget>widget);
		},
		on(event: FrameEvent, callback: (context: FrameContext) => void): void
		{
			this[event].push(callback);
		}
	};
}

function createFrame(output: { widgets: Widget[]; redraw: Event }): FrameContext
{
	return {
		isOpen(): boolean
		{
			return true;
		},
		getWidget(name: string): Widget | null
		{
			return output.widgets.find(w => w.name == name) || null;
		},
		redraw(): void
		{
			invoke(output.redraw);
		}
	};
}


test("All children fill the same area", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100 + 15, padding: 0,
		content: [
			overlay({
				content: [
					button({ text: "Click me!" }),
					label({ text: "Look at me!", height: "1w" })
				]
			})
		]
	});
	template.open();

	const widget1 = <ButtonWidget>mock.createdWindows[0].widgets[0];
	t.is(widget1.type, "button");
	t.is(widget1.text, "Click me!");
	t.is(widget1.x, 0);
	t.is(widget1.y, 15);
	t.is(widget1.width, 100);
	t.is(widget1.height, 100);

	const widget2 = <LabelWidget>mock.createdWindows[0].widgets[1];
	t.is(widget2.type, "label");
	t.is(widget2.text, "Look at me!");
	t.is(widget2.x, 0);
	t.is(widget2.y, 15 + 2);
	t.is(widget2.width, 100);
	t.is(widget2.height, 100);
});


test("Flat layout with widgets", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100 + 15, padding: 0,
		content: [
			overlay([
				button({ text: "Click me!" }),
				button({ text: "Click me too!" })
			])
		]
	});
	template.open();

	const widget1 = <ButtonWidget>mock.createdWindows[0].widgets[0];
	t.is(widget1.text, "Click me!");
	t.is(widget1.x, 0);
	t.is(widget1.y, 15);
	t.is(widget1.width, 100);
	t.is(widget1.height, 100);

	const widget2 = <ButtonWidget>mock.createdWindows[0].widgets[1];
	t.is(widget2.text, "Click me too!");
	t.is(widget2.x, 0);
	t.is(widget2.y, 15);
	t.is(widget2.width, 100);
	t.is(widget2.height, 100);
});


test("Children are sized and padded within the shared area", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100 + 15, padding: 0,
		content: [
			overlay([
				button({ text: "background" }),
				button({ text: "centred", width: 40, height: 20, padding: "1w" }),
				button({ text: "padded", padding: 10 }),
				button({ text: "corner", width: "50%", height: "25%", padding: ["1w", 0, 0, "1w"] })
			])
		]
	});
	template.open();

	const widgets = mock.createdWindows[0].widgets;
	t.is(widgets[0].x, 0);
	t.is(widgets[0].y, 15);
	t.is(widgets[0].width, 100);
	t.is(widgets[0].height, 100);

	t.is(widgets[1].x, 30); // (100 - 40) / 2
	t.is(widgets[1].y, 15 + 40); // (100 - 20) / 2
	t.is(widgets[1].width, 40);
	t.is(widgets[1].height, 20);

	t.is(widgets[2].x, 10);
	t.is(widgets[2].y, 15 + 10);
	t.is(widgets[2].width, 80);
	t.is(widgets[2].height, 80);

	t.is(widgets[3].x, 50); // pushed to the right by the weighted padding
	t.is(widgets[3].y, 15 + 75); // pushed to the bottom by the weighted padding
	t.is(widgets[3].width, 50);
	t.is(widgets[3].height, 25);
});


test("Children with visibility 'hidden' and 'none' are hidden, siblings are untouched", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100 + 15, padding: 0,
		content: [
			overlay([
				button({ text: "shown" }),
				button({ text: "hidden", visibility: "hidden" }),
				button({ text: "gone", visibility: "none" })
			])
		]
	});
	template.open();

	const widgets = mock.createdWindows[0].widgets;
	t.true(widgets[0].isVisible);
	t.is(widgets[0].x, 0);
	t.is(widgets[0].y, 15);
	t.is(widgets[0].width, 100);
	t.is(widgets[0].height, 100);

	t.false(widgets[1].isVisible);
	t.is(widgets[1].width, 0); // never laid out
	t.false(widgets[2].isVisible);
	t.is(widgets[2].width, 0);
});


test("Child visibility is updated by store", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const visibility = store<Visibility>("visible");
	const template = window({
		width: 100, height: 100 + 15, padding: 0,
		content: [
			overlay([
				button({ text: "a" }),
				button({ text: "b", visibility })
			])
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const a = created.widgets[0];
	const b = created.widgets[1];
	t.true(b.isVisible);
	t.is(b.x, 0);
	t.is(b.y, 15);
	t.is(b.width, 100);
	t.is(b.height, 100);

	visibility.set("none");
	call(created.onUpdate);
	t.false(b.isVisible);
	t.true(a.isVisible);
	t.is(a.width, 100);

	visibility.set("hidden");
	call(created.onUpdate);
	t.false(b.isVisible);

	visibility.set("visible");
	call(created.onUpdate);
	t.true(b.isVisible);
	t.is(b.x, 0);
	t.is(b.y, 15);
	t.is(b.width, 100);
	t.is(b.height, 100);
});


test("Child size and padding are updated by stores", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const width = store<Scale>(30);
	const height = store<Scale>(40);
	const template = window({
		width: 100, height: 100 + 15, padding: 0,
		content: [
			overlay([
				button({ text: "a", width, height, padding: "1w" }),
				button({ text: "b" })
			])
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const first = created.widgets[0];
	const second = created.widgets[1];
	t.is(first.x, 35);
	t.is(first.y, 15 + 30);
	t.is(first.width, 30);
	t.is(first.height, 40);
	t.is(second.width, 100);
	t.is(second.height, 100);

	width.set("50%");
	height.set(10);
	call(created.onUpdate);

	t.is(first.x, 25);
	t.is(first.y, 15 + 45);
	t.is(first.width, 50);
	t.is(first.height, 10);
	t.is(second.width, 100); // the sibling is unaffected
	t.is(second.height, 100);
});


test("Overlay inside a hidden container hides all its children", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0, spacing: 0,
		content: [
			vertical({
				visibility: "none",
				content: [
					overlay([
						button({ text: "a" }),
						button({ text: "b" })
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


test("Container visibility inside overlay is updated by store", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const visibility = store<Visibility>("visible");
	const template = window({
		width: 100, height: 100 + 15, padding: 0,
		content: [
			overlay([
				vertical({
					visibility,
					content: [button({ text: "inner", height: 20 })]
				})
			])
		]
	});
	template.open();

	const created = mock.createdWindows[0];
	const inner = created.widgets[0];
	t.true(inner.isVisible);
	t.is(inner.x, 0);
	t.is(inner.y, 15);
	t.is(inner.width, 100);
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
	t.is(inner.x, 0);
	t.is(inner.y, 15);
	t.is(inner.width, 100);
	t.is(inner.height, 20);
});


test("Absolute children make parent absolutely sized to the biggest child", t =>
{
	const output = createBuildOutput();
	const creator = overlay([
		label({ text: "a", width: 20, height: "12px" }),
		label({ text: "b", width: 15, height: "5px", padding: [10, 0] }),
		label({ text: "c", width: 30, height: "8px", visibility: "none" })
	]);

	creator.create(output);
	invoke(output.redraw);

	const pos = creator.position;
	t.is(pos.width, 20); // max(20, 15)
	t.is(pos.height, 25); // max(12, 5 + 10 + 10)
});


test("Non-absolute child makes inherited parent size unknown", t =>
{
	const output = createBuildOutput();
	const creator = overlay([
		label({ text: "a", width: 20, height: "12px" }),
		label({ text: "b", width: "1w", height: "5px" })
	]);

	creator.create(output);
	invoke(output.redraw);

	const pos = creator.position;
	t.is(pos.width, undefined);
	t.is(pos.height, 12);
});


test("Store-driven size affects parent inherited size", t =>
{
	globalThis.ui = Mock.ui();
	const output = createBuildOutput();
	const heightStore = store<Scale>("20px");
	const creator = overlay([
		button({ text: "a", width: 40, height: heightStore }),
		button({ text: "b", width: 30, height: "10px" })
	]);

	creator.create(output);
	const frame = createFrame(output);
	output.binder._bind(frame);

	const position = creator.position;
	t.is(read(position.width), 40);
	t.is(read(position.height), 20);

	heightStore.set("5px");
	invoke(output.redraw);
	t.is(read(position.width), 40);
	t.is(read(position.height), 10); // "b" is now the biggest

	heightStore.set("1w");
	invoke(output.redraw);
	t.is(read(position.width), 40);
	t.is(read(position.height), undefined);
});


test("Overlay takes inherited size inside a flexible container", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100 + 15, padding: 0, spacing: 0,
		content: [
			overlay([
				button({ text: "a", height: 20 }),
				label({ text: "b", height: 14 })
			]),
			button({ text: "rest" })
		]
	});
	template.open();

	const widgets = mock.createdWindows[0].widgets;
	t.is(widgets[0].y, 15);
	t.is(widgets[0].height, 20);
	t.is(widgets[1].y, 15 + 2);
	t.is(widgets[1].height, 14);
	t.is(widgets[2].y, 15 + 20); // the overlay took the height of its biggest child
	t.is(widgets[2].height, 80);
});
