/// <reference path="../../lib/openrct2.d.ts" />

import { box, button, compute, dropdownSpinner, horizontal, label, store, twoway, viewport, window } from "openrct2-flexui";


class ViewModel
{
	allDucks = store<Entity[]>([]);
	selectedDuckIndex = store<number>(0);
	selectedDuck = store<Entity | null>(null);
	duckLocationText = store<string>("");

	constructor()
	{
		this.selectedDuckIndex.subscribe(index =>
		{
			// Update the selected duck when a new index is selected in the dropdown.
			const ducks = this.allDucks.get();
			this.selectedDuck.set(ducks[index]);
		});
	}
}

const birdStalker = window<ViewModel>(model =>
({
	title: "Bird Stalker (fui example)",
	width: { value: 350, min: 220, max: 500 },
	height: { value: 300, min: 220, max: 400 },
	position: "center",
	padding: 8,
	onOpen: () =>
	{
		const ducks = map.getAllEntities("duck");
		model.allDucks.set(ducks);
		model.selectedDuckIndex.set(0);
	},
	onUpdate: () =>
	{
		// Update location tracker text
		const selectedDuck = model.selectedDuck.get();
		const text = (selectedDuck)
			? `Located at (${selectedDuck.x}, ${selectedDuck.y}, ${selectedDuck.z})`
			: "Location unknown";

		model.duckLocationText.set(text);
	},
	content: [
		box({
			text: "Duck-o-cam",
			content: viewport({
				target: compute(model.selectedDuck, duck => (duck) ? duck.id : null)
			})
		}),
		label({
			text: model.duckLocationText,
			alignment: "centred"
		}),
		horizontal([
			button({
				text: "Go to duck",
				disabled: compute(model.selectedDuck, duck => !duck),
				height: 14,
				onClick: () =>
				{
					const duck = model.selectedDuck.get();
					if (duck !== null)
					{
						ui.mainViewport.scrollTo({ x: duck.x, y: duck.y, z: duck.z });
					}
				}
			}),
			dropdownSpinner({
				items: compute(model.allDucks, v => v.map(d => `Duck #${d.id}`)),
				selectedIndex: twoway(model.selectedDuckIndex),
				disabled: compute(model.allDucks, v => v.length === 0),
				disabledMessage: "Duck not found"
			}),
			button({
				text: "Random duck",
				disabled: compute(model.allDucks, v => v.length === 0),
				height: 14,
				onClick: () =>
				{
					const ducks = model.allDucks.get();
					if (ducks.length === 0)
						return;

					// Ensure the random number generator does not select the already selected duck.
					const currentSelectedIndex = model.selectedDuckIndex.get();
					let randomIndex;
					do
					{
						randomIndex = Math.floor(ducks.length * Math.random());
					}
					while (randomIndex === currentSelectedIndex);
					model.selectedDuckIndex.set(randomIndex);
				}
			})
		])
	]
}));


registerPlugin({
	name: "Bird Stalker (fui-example)",
	version: "1.0",
	authors: ["Basssiiie"],
	type: "local",
	licence: "MIT",
	targetApiVersion: 70,
	main: () =>
	{
		ui.registerMenuItem("(fui) Bird Stalker", () =>
		{
			const model = new ViewModel();
			birdStalker.open(model);
		});
	}
});
