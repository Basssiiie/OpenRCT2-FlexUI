/// <reference path="../../lib/openrct2.d.ts" />
import { compute } from "@src/bindings/stores/compute";
import { store } from "@src/bindings/stores/createStore";
import { isStore } from "@src/bindings/stores/isStore";
import test from "ava";


test("Compute to property", t =>
{
	const source = store({ value: 5 });

	const dependant = compute(source, s => s.value);
	t.is(dependant.get(), 5);

	source.set({ value: 88 });
	t.is(dependant.get(), 88);
});


test("Compute to nested property", t =>
{
	const source = store({
		value: { text: "hello" }
	});

	const dependant = compute(source, s => s.value.text);
	t.is(dependant.get(), "hello");

	source.set({
		value: { text: "bye" }
	});
	t.is(dependant.get(), "bye");
});


test("Compute from two stores", t =>
{
	const a = store({ value: 5 });
	const b = store(45);

	const dependant = compute(a, b, (a, b) => a.value * b);
	t.is(dependant.get(), 225);

	a.set({ value: 3 });
	t.is(dependant.get(), 135);

	b.set(80);
	t.is(dependant.get(), 240);
});


test("Compute from five stores", t =>
{
	const a = store({ value: 5 });
	const b = store(45);
	const c = store<[string, number]>(["aaa", 75]);
	const d = store("something");
	const e = store(66);

	const dependant = compute(a, b, c, d, e, (a, b, c, d, e) => a.value + b + c[1] + d.length + e);
	t.is(dependant.get(), 200);

	a.set({ value: 3 });
	t.is(dependant.get(), 198);

	b.set(80);
	t.is(dependant.get(), 233);

	c.set(["80", 129]);
	t.is(dependant.get(), 287);

	d.set("a");
	t.is(dependant.get(), 279);

	e.set(2);
	t.is(dependant.get(), 215);
});


test("Compute is one-way", t =>
{
	const source = store({ value: "hey" });

	const dependant = compute(source, s => s.value);
	t.is(dependant.get(), "hey");

	dependant.set("bye");
	t.is(dependant.get(), "bye");
	t.deepEqual(source.get(), { value: "hey" });
});


test("Computed store is valid store", t =>
{
	const source = store({ value: 5 });

	const dependant = compute(source, s => s.value);
	t.true(isStore(dependant));
});
