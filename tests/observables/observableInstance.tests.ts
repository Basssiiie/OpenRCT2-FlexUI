import { ObservableInstance } from "@src/observables/observableInstance";
import test from "ava";


test("get() returns string from constructor", t =>
{
	const observable = new ObservableInstance("Bob");
	t.is(observable.get(), "Bob");
});


test("get() returns number from constructor", t =>
{
	const observable = new ObservableInstance(10.54);
	t.is(observable.get(), 10.54);
});


test("set() changes get() value", t =>
{
	const observable = new ObservableInstance("Cheese");
	observable.set("Pineapple");
	t.is(observable.get(), "Pineapple");
});


test("set() triggers subscription", t =>
{
	const events: string[] = [];

	const observable = new ObservableInstance("Cheese");
	observable.subscribe(() =>
	{
		events.push("hit");
	});
	observable.set("Pineapple");

	t.deepEqual(events, [ "hit" ]);
});


test("subscription receives new value", t =>
{
	const events: string[] = [];

	const observable = new ObservableInstance("Cheese");
	observable.subscribe(value =>
	{
		events.push(value);
	});
	observable.set("Pineapple");

	t.deepEqual(events, [ "Pineapple" ]);
});


test("set() triggers multiple subscriptions", t =>
{
	t.plan(4);
	let first = false, second = false;

	const observable = new ObservableInstance("Cheese");
	observable.subscribe(v =>
	{
		// First
		t.is(v, "Pineapple");
		t.false(first);
		first = true;
	});
	observable.subscribe(v =>
	{
		// Second
		t.is(v, "Pineapple");
		t.false(second);
		second = true;
	});
	observable.set("Pineapple");
});