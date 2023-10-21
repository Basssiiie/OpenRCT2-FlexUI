/// <reference path="../../lib/openrct2.d.ts" />
import { store } from "@src/bindings/stores/createStore";
import test from "ava";


test("get() returns string from constructor", t =>
{
	const source = store("Bob");
	t.is(source.get(), "Bob");
});


test("get() returns number from constructor", t =>
{
	const source = store(10.54);
	t.is(source.get(), 10.54);
});


test("set() changes get() value", t =>
{
	const source = store("Cheese");
	source.set("Pineapple");
	t.is(source.get(), "Pineapple");
});


test("set() triggers subscription", t =>
{
	const events: string[] = [];

	const source = store("Cheese");
	source.subscribe(() =>
	{
		events.push("hit");
	});
	source.set("Pineapple");

	t.deepEqual(events, [ "hit" ]);
});


test("subscription receives new value", t =>
{
	const events: string[] = [];

	const source = store("Cheese");
	source.subscribe(value =>
	{
		events.push(value);
	});
	source.set("Pineapple");

	t.deepEqual(events, [ "Pineapple" ]);
});


test("set() triggers multiple subscriptions", t =>
{
	t.plan(6);
	let first = false, second = false;

	const source = store("Cheese");
	source.subscribe(v =>
	{
		// First
		t.is(v, "Pineapple");
		t.false(first);
		first = true;
	});
	source.subscribe(v =>
	{
		// Second
		t.is(v, "Pineapple");
		t.false(second);
		second = true;
	});
	source.set("Pineapple");

	t.true(first);
	t.true(second);
});
