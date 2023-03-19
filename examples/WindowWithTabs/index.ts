/// <reference path="../../lib/openrct2.d.ts" />

import { compute, dropdown, horizontal, label, spinner, store, tab, tabwindow, toggle, twoway } from "openrct2-flexui";


const value = store(0);
const source = store("not yet changed");
value.subscribe(v => console.log(`Value now set to: ${v}`));
source.subscribe(v => console.log(`Source now set to: ${v}`));


function updateSource(updatedValue: number, sourceName: string): void
{
	source.set(sourceName);
	console.log(`Update to ${updatedValue} via ${sourceName}`);
}


const spiralSlideIcon: ImageAnimation = {
	frameBase: 5442,
	frameCount: 16,
	frameDuration: 4
};
const hangingMechanicIcon: ImageAnimation = {
	frameBase: 11469,
	frameCount: 12,
	frameDuration: 4,
	offset: { x: 21, y: 22 }
};
const explosionIcon: ImageAnimation = {
	frameBase: 22878,
	frameCount: 18,
	frameDuration: 3,
	offset: { x: 16, y: 14 }
};


const windowWithTabs = tabwindow({
	title: "Window with Tabs (fui example)",
	width: 225, maxWidth: 10_000,
	height: 175, maxHeight: 10_000,
	padding: 50,
	static: [ // shown on every tab
		label({
			text: compute(source, s => `Last updated from:\n${s}`),
			alignment: "centred"
		})
	],
	tabs: [
		tab({
			image: spiralSlideIcon,
			content: [
				spinner({
					value: twoway(value),
					minimum: 0,
					maximum: 4,
					wrapMode: "wrap",
					onChange: val => updateSource(val, "spinner, tab 1")
				})
			]
		}),
		tab({
			image: hangingMechanicIcon,
			content: [
				dropdown({
					items: [ "Zero", "One", "Two", "Three" ],
					selectedIndex: twoway(value),
					onChange: val => updateSource(val, "dropdown, tab 2")
				})
			]
		}),
		tab({
			image: explosionIcon,
			content: [
				horizontal([
					toggle({
						text: "0",
						width: "25%",
						isPressed: compute(value, val => (val === 0)),
						onChange: () => { value.set(0); updateSource(0, "button 1, tab 3"); }
					}),
					toggle({
						text: "1",
						width: "25%",
						isPressed: compute(value, val => (val === 1)),
						onChange: () => { value.set(1); updateSource(1, "button 2, tab 3"); }
					}),
					toggle({
						text: "2",
						width: "25%",
						isPressed: compute(value, val => (val === 2)),
						onChange: () => { value.set(2); updateSource(2, "button 3, tab 3"); }
					}),
					toggle({
						text: "3",
						width: "25%",
						isPressed: compute(value, val => (val === 3)),
						onChange: () => { value.set(3); updateSource(3, "button 4, tab 3"); }
					})
				])
			]
		}),
	]
});


registerPlugin({
	name: "Window with Tabs (fui-example)",
	version: "1.0",
	authors: ["Basssiiie"],
	type: "local",
	licence: "MIT",
	targetApiVersion: 70,
	main: () =>
	{
		ui.registerMenuItem("(fui) Window with Tabs", () => windowWithTabs.open());
	}
});