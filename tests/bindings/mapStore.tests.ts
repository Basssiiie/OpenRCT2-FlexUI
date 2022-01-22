import { DefaultStore } from "@src/bindings/defaultStore";
import { isStore } from "@src/bindings/isStore";
import { map } from "@src/bindings/mapStore";
import test from "ava";


test("Map to property", t =>
{
	const store = new DefaultStore({ value: 5 });

	const dependant = map(store, s => s.value);
	t.is(dependant.get(), 5);

	store.set({ value: 88 });
	t.is(dependant.get(), 88);
});


test("Map to nested property", t =>
{
	const store = new DefaultStore({
		value: { text: "hello" }
	});

	const dependant = map(store, s => s.value.text);
	t.is(dependant.get(), "hello");

	store.set({
		value: { text: "bye" }
	});
	t.is(dependant.get(), "bye");
});


test("Mapping is one-way", t =>
{
	const store = new DefaultStore({ value: "hey" });

	const dependant = map(store, s => s.value);
	t.is(dependant.get(), "hey");

	dependant.set("bye");
	t.is(dependant.get(), "bye");
	t.deepEqual(store.get(), { value: "hey" });
});


test("Dependant is valid store", t =>
{
	const store = new DefaultStore({ value: 5 });

	const dependant = map(store, s => s.value);
	t.true(isStore(dependant));
});