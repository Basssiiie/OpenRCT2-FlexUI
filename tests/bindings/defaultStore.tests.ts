import { DefaultStore } from "@src/bindings/stores/defaultStore";
import test from "ava";


test("get() returns string from constructor", t =>
{
	const store = new DefaultStore("Bob");
	t.is(store.get(), "Bob");
});


test("get() returns number from constructor", t =>
{
	const store = new DefaultStore(10.54);
	t.is(store.get(), 10.54);
});


test("set() changes get() value", t =>
{
	const store = new DefaultStore("Cheese");
	store.set("Pineapple");
	t.is(store.get(), "Pineapple");
});


test("set() triggers subscription", t =>
{
	const events: string[] = [];

	const store = new DefaultStore("Cheese");
	store.subscribe(() =>
	{
		events.push("hit");
	});
	store.set("Pineapple");

	t.deepEqual(events, [ "hit" ]);
});


test("subscription receives new value", t =>
{
	const events: string[] = [];

	const store = new DefaultStore("Cheese");
	store.subscribe(value =>
	{
		events.push(value);
	});
	store.set("Pineapple");

	t.deepEqual(events, [ "Pineapple" ]);
});


test("set() triggers multiple subscriptions", t =>
{
	t.plan(4);
	let first = false, second = false;

	const store = new DefaultStore("Cheese");
	store.subscribe(v =>
	{
		// First
		t.is(v, "Pineapple");
		t.false(first);
		first = true;
	});
	store.subscribe(v =>
	{
		// Second
		t.is(v, "Pineapple");
		t.false(second);
		second = true;
	});
	store.set("Pineapple");
});