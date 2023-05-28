/// <reference path="../../../lib/openrct2.d.ts" />

import { compute } from "@src/bindings/stores/compute";
import { store } from "@src/bindings/stores/createStore";
import { box } from "@src/elements/controls/box";
import { button } from "@src/elements/controls/button";
import { label } from "@src/elements/controls/label";
import { horizontal } from "@src/elements/layouts/flexible/flexible";
import { window } from "@src/windows/window";
import test from "ava";
import Mock from "openrct2-mocks";
import { call } from "tests/helpers";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 50, height: 40 + 15, padding: "4px",
		content: [
			box({
				padding: "7px",
				content: button({
					text: "inside a box!"
				})
			})
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as GroupBoxWidget;
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 4 + 7);
	t.is(widget1.y, 4 + 7 + 15 - 4); // - 4px default top pad
	t.is(widget1.width, 50 - (22 + 1));
	t.is(widget1.height, (40 - (22 + 1)) + 4); // + 4px default top pad

	const widget2 = mock.createdWindows[0].widgets[1] as ButtonWidget;
	t.is(widget2.type, "button");
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 4 + 7 + 6); // incl. 6px default padding
	t.is(widget2.y, 4 + 7 + 6 + 15);
	t.is(widget2.width, (50 - (22 + 1)) - (6 + 6));
	t.is(widget2.height, (40 - (22 + 1)) - (6 + 6));
});


test("Title changes size and position", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 50, height: 80 + 15, padding: "4px",
		content: [
			box({
				text: "title",
				padding: "7px",
				content: button({
					text: "inside a box!"
				})
			})
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as GroupBoxWidget;
	t.is(widget1.type, "groupbox");
	t.is(widget1.text, "title");
	t.is(widget1.x, 4 + 7);
	t.is(widget1.y, 4 + 7 + 15);
	t.is(widget1.width, 50 - (22 + 1));
	t.is(widget1.height, 80 - (22 + 1));

	const widget2 = mock.createdWindows[0].widgets[1] as ButtonWidget;
	t.is(widget2.type, "button");
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 4 + 7 + 6); // incl. 6px default padding
	t.is(widget2.y, 4 + 7 + 15 + 15); // inc. 15px title padding
	t.is(widget2.width, (50 - (22 + 1)) - (6 + 6));
	t.is(widget2.height, (80 - (22 + 1)) - (15 + 6));
});


test("Applies padding", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 60 + 15, padding: 10,
		content: [
			box({
				padding: 3,
				content: button({
					padding: [ 4, 6 ],
					text: "inside a box!"
				})
			})
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as GroupBoxWidget;
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 10 + 3);
	t.is(widget1.y, 10 + 3 + 15 - 4); // - 4px default top pad
	t.is(widget1.width, 74 - 1);
	t.is(widget1.height, 34 + 4 - 1); // + 4px default top pad

	const widget2 = mock.createdWindows[0].widgets[1] as ButtonWidget;
	t.is(widget2.type, "button");
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 10 + 3 + 6);
	t.is(widget2.y, 10 + 3 + 4 + 15);
	t.is(widget2.width, 62 - 1);
	t.is(widget2.height, 26 - 1);
});


test("Box takes size of absolute child", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 500, height: 400 + 15, padding: 10,
		content: [
			box({
				padding: "0px",
				content: button({
					width: 120, height: 70, padding: 12,
					text: "inside a box!"
				})
			})
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as GroupBoxWidget;
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 10);
	t.is(widget1.y, 10 + 15 - 4); // - 4px default top pad
	t.is(widget1.width, 120 + 24);
	t.is(widget1.height, 70 + 24 + 4); // + 4px default top pad

	const widget2 = mock.createdWindows[0].widgets[1] as ButtonWidget;
	t.is(widget2.type, "button");
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 10 + 12);
	t.is(widget2.y, 10 + 12 + 15);
	t.is(widget2.width, 120);
	t.is(widget2.height, 70);
});


test("Box can center child", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 500, height: 400 + 15, padding: 40,
		content: [
			box(
				button({
					width: 100, height: 200, padding: [ "50%", 0 ],
					text: "inside a box!"
				})
			)
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as GroupBoxWidget;
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 40);
	t.is(widget1.y, 40 + 15 - 4);
	t.is(widget1.width, 100);
	t.is(widget1.height, 320 + 4 - 1);

	const widget2 = mock.createdWindows[0].widgets[1] as ButtonWidget;
	t.is(widget2.type, "button");
	t.is(widget2.text, "inside a box!");
	t.is(widget2.x, 40);
	t.is(widget2.y, 40 + 60 + 15);
	t.is(widget2.width, 100);
	t.is(widget2.height, 200);
});


test("Box reacts correctly to child size changes", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const model = { active: store(true) };
	const template = window({
		width: 100, height: 50 + 15, padding: 4, spacing: 5,
		content: [
			box(
				label({
					visibility: compute(model.active, (val) => (val) ? "visible" : "none"),
					text: "managing themes",
					height: 14,
				})
			),
			button({ height: 25 })
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as GroupBoxWidget;
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 4);
	t.is(widget1.y, 4 + 15 - 4); // - 4px default top pad
	t.is(widget1.width, 100 - ((2 * 4) + 1));
	t.is(widget1.height, 14 + (2 * 6) + 4); // + 4px default top pad
	t.not(false, widget1.isVisible);

	const widget2 = mock.createdWindows[0].widgets[1] as LabelWidget;
	t.is(widget2.type, "label");
	t.is(widget2.text, "managing themes");
	t.is(widget2.x, 4 + 6);
	t.is(widget2.y, 4 + 2 + 6 + 15);
	t.is(widget2.width, 100 - ((2 * (4 + 6)) + 1));
	t.is(widget2.height, 14);
	t.true(widget2.isVisible);

	model.active.set(false);
	call(mock.createdWindows[0].onUpdate); // redraw

	t.not(false, widget1.isVisible);
	t.false(widget2.isVisible);

	model.active.set(true);
	call(mock.createdWindows[0].onUpdate); // redraw

	t.is(widget1.x, 4);
	t.is(widget1.y, 4 + 15 - 4); // - 4px default top pad
	t.is(widget1.width, 100 - ((2 * 4) + 1));
	t.is(widget1.height, 14 + (2 * 6) + 4); // + 4px default top pad
	t.not(false, widget1.isVisible);

	t.is(widget2.x, 4 + 6);
	t.is(widget2.y, 4 + 2 + 6 + 15);
	t.is(widget2.width, 100 - ((2 * (4 + 6)) + 1));
	t.is(widget2.height, 14);
	t.true(widget2.isVisible);
});


test("Box reacts correctly to nested child size changes", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const model = { active: store(true) };
	const template = window({
		width: 300, height: 200 + 15, padding: 20, spacing: 4,
		content: [
			box({
				visibility: compute(model.active, (val) => (val) ? "visible" : "none" ),
				content: horizontal({
					padding: 6,
					content: [
						label({
							visibility: compute(model.active, (val) => (val) ? "visible" : "none"),
							text: "managing themes",
							height: 14,
						}),
					],
				}),
			}),
			button({ height: 25 })
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as GroupBoxWidget;
	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 20);
	t.is(widget1.y, 20 + 15 - 4); // - 4px default top pad
	t.is(widget1.width, 300 - ((2 * 20) + 1));
	t.is(widget1.height, 14 + (2 * 6) + 4); // + 4px default top pad
	t.true(widget1.isVisible);

	const widget2 = mock.createdWindows[0].widgets[1] as LabelWidget;
	t.is(widget2.type, "label");
	t.is(widget2.text, "managing themes");
	t.is(widget2.x, 20 + 6);
	t.is(widget2.y, 20 + 2 + 6 + 15);
	t.is(widget2.width, 300 - ((2 * 26) + 1));
	t.is(widget2.height, 14);
	t.true(widget2.isVisible);

	const widget3 = mock.createdWindows[0].widgets[2] as ButtonWidget;
	t.is(widget3.type, "button");
	t.is(widget3.x, 20);
	t.is(widget3.y, 20 + (2 * 6) + 4 + 14 + 15);
	t.is(widget3.width, 300 - ((2 * 20) + 1));
	t.is(widget3.height, 25);

	model.active.set(false);
	call(mock.createdWindows[0].onUpdate); // redraw

	t.false(widget1.isVisible);
	t.false(widget2.isVisible);

	t.is(widget3.x, 20);
	t.is(widget3.y, 20 + 15);
	t.is(widget3.width, 300 - ((2 * 20) + 1));
	t.is(widget3.height, 25);

	model.active.set(true);
	call(mock.createdWindows[0].onUpdate); // redraw

	t.is(widget1.x, 20);
	t.is(widget1.y, 20 + 15 - 4); // - 4px default top pad
	t.is(widget1.width, 300 - ((2 * 20) + 1));
	t.is(widget1.height, 14 + (2 * 6) + 4); // + 4px default top pad
	t.true(widget1.isVisible);

	t.is(widget2.x, 20 + 6);
	t.is(widget2.y, 20 + 2 + 6 + 15);
	t.is(widget2.width, 300 - ((2 * 26) + 1));
	t.is(widget2.height, 14);
	t.true(widget2.isVisible);

	t.is(widget3.x, 20);
	t.is(widget3.y, 20 + (2 * 6) + 4 + 14 + 15);
	t.is(widget1.width, 300 - ((2 * 20) + 1));
	t.is(widget3.height, 25);
});


test("Box does not take space if it starts hidden", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const model = { active: store(false) };
	const template = window({
		width: 300, height: 200 + 15, padding: 20, spacing: 4,
		content: [
			box({
				visibility: compute(model.active, (val) => (val) ? "visible" : "none" ),
				content: horizontal({
					padding: 6,
					content: [
						label({
							visibility: compute(model.active, (val) => (val) ? "visible" : "none"),
							text: "managing themes",
							height: 14,
						}),
					],
				}),
			}),
			button({ height: 25 })
		]
	});
	template.open();

	const widget1 = mock.createdWindows[0].widgets[0] as GroupBoxWidget;
	const widget2 = mock.createdWindows[0].widgets[1] as LabelWidget;
	const widget3 = mock.createdWindows[0].widgets[2] as ButtonWidget;

	t.false(widget1.isVisible);
	t.false(widget2.isVisible);

	t.is(widget3.x, 20);
	t.is(widget3.y, 20 + 15);
	t.is(widget3.width, 300 - ((2 * 20) + 1));
	t.is(widget3.height, 25);

	model.active.set(true);
	call(mock.createdWindows[0].onUpdate); // redraw

	t.is(widget1.type, "groupbox");
	t.is(widget1.x, 20);
	t.is(widget1.y, 20 + 15 - 4); // - 4px default top pad
	t.is(widget1.width, 300 - ((2 * 20) + 1));
	t.is(widget1.height, 14 + (2 * 6) + 4); // + 4px default top pad
	t.true(widget1.isVisible);

	t.is(widget2.type, "label");
	t.is(widget2.text, "managing themes");
	t.is(widget2.x, 20 + 6);
	t.is(widget2.y, 20 + 2 + 6 + 15);
	t.is(widget2.width, 300 - ((2 * 26) + 1));
	t.is(widget2.height, 14);
	t.true(widget2.isVisible);

	t.is(widget3.type, "button");
	t.is(widget3.x, 20);
	t.is(widget3.y, 20 + (2 * 6) + 4 + 14 + 15);
	t.is(widget3.width, 300 - ((2 * 20) + 1));
	t.is(widget3.height, 25);
});