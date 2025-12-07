/// <reference path="../../../lib/openrct2.d.ts" />

import { button } from "@src/elements/controls/button";
import { label } from "@src/elements/controls/label";
import { grid } from "@src/elements/layouts/grid/grid";
import { window } from "@src/windows/window";
import test from "ava";
import Mock from "openrct2-mocks";


test("Simple layout with widgets", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const template = window({
		width: 100, height: 100, padding: 0,
		content: [
			grid({
				columns: 2,
				rows: 2,
				content: [
					label({
						column: 0,
						row: 0,
						text: "Look at me!"
					}),
					button({
						column: 1,
						row: 0,
						text: "Click me!"
					}),
					button({
						column: 0,
						row: 1,
						text: "Click me too!"
					}),
					label({
						column: 1,
						row: 1,
						text: "Look at me again!"
					})
				]
			})
		]
	});
	template.open();

	const widget1 = <LabelWidget>mock.createdWindows[0].widgets[0];
	t.is(widget1.type, "label");
	t.is(widget1.text, "Look at me!");
	t.is(widget1.x, 5);
	t.is(widget1.y, 5 + 15);
	t.is(widget1.width, 40);
	t.is(widget1.height, 40);

	const widget2 = <ButtonWidget>mock.createdWindows[0].widgets[1];
	t.is(widget2.type, "button");
	t.is(widget2.text, "Click me!");
	t.is(widget2.x, 45);
	t.is(widget2.y, 5 + 15);
	t.is(widget1.width, 40);
	t.is(widget1.height, 40);

	const widget3 = <ButtonWidget>mock.createdWindows[0].widgets[2];
	t.is(widget3.type, "button");
	t.is(widget3.text, "Click me too!");
	t.is(widget3.x, 45);
	t.is(widget3.y, 5 + 15);
	t.is(widget3.width, 40);
	t.is(widget3.height, 40);

	const widget4 = <LabelWidget>mock.createdWindows[0].widgets[3];
	t.is(widget4.type, "label");
	t.is(widget4.text, "Look at me again!");
	t.is(widget4.x, 5);
	t.is(widget4.y, 5 + 15);
	t.is(widget4.width, 40);
	t.is(widget4.height, 40);
});
