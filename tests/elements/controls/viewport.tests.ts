/// <reference path="../../../lib/openrct2.d.ts" />

import { window } from "@src/building/window";
import { viewport, ViewportFlags } from "@src/elements/controls/viewport";
import test from "ava";
import Mock from "openrct2-mocks";


test("Standard properties are set", t =>
{
	const mock = Mock.ui();
	global.ui = mock;

	const template = window({
		width: 100, height: 100,
		content: [
			viewport({
				target: { x: 22, y: 88, z: 123 },
				rotation: 3,
				zoom: -2,
				visibilityFlags: ViewportFlags.Gridlines | ViewportFlags.InvisiblePeeps,
				tooltip: "view this"
			})
		]
	});
	template.open();

	const widget = mock.createdWindows[0].widgets[0] as ViewportWidget;
	t.is(widget.type, "viewport");
	t.is(widget.tooltip, "view this");
	const vp = widget.viewport;
	t.is(vp?.rotation, 3);
	t.is(vp?.zoom, -2);
	t.is(vp?.visibilityFlags, ViewportFlags.Gridlines | ViewportFlags.InvisiblePeeps);
	t.truthy(vp?.left);
	t.truthy(vp?.top);
});
