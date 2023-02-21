/// <reference path="../../../lib/openrct2.d.ts" />

import { Colour, colourPicker, window } from "openrct2-flexui";

const result = window({
	title: "tsc test",
	width: 100,
	height: 150,
	content: [
		colourPicker({
			colour: Colour.Aquamarine
		})
	]
});

result.open();