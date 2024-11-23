/// <reference path="../../../lib/openrct2.d.ts" />

import { widget } from "@src/elements/controls/widget";
import { window } from "@src/windows/window";
import test from "ava";
import Mock from "openrct2-mocks";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	globalThis.ui = mock;

	const callback = (): void => { /* empty */ };
	const template = window({
		width: 100, height: 100, padding: 10,
		content: [
			widget({
				type: "button",
				width: "50%",
				text: "Click me!",
				tooltip: "Best button in the world",
				isPressed: true,
				onClick: callback,
				// @ts-expect-error These properties should be skipped
				isVisible: true, x: 25, y: 3421, name: "bob", isDisabled: true
			})
		]
	});
	template.open();

	const result = <ButtonDesc>mock.createdWindows[0].widgets[0];
	t.is(result.type, "button");
	t.is(result.text, "Click me!");
	t.is(result.tooltip, "Best button in the world");
	t.is(result.x, 10);
	t.is(result.y, 25);
	t.is(result.width, 40);
	t.is(result.height, 65);
	t.is(result.onClick, callback);
	t.true(result.isPressed);

	t.not(result.name, "bob");
	t.falsy(result.isVisible);
	t.falsy(result.isDisabled);
});
