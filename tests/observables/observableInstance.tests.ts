import test from "ava";
import { ObservableInstance } from "@src/observables/observableInstance";


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


test.cb("set() triggers subscription", t =>
{
	const observable = new ObservableInstance("Cheese");
	observable.subscribe(() => t.end());
	observable.set("Pineapple");
});


test.cb("subscription receives new value", t =>
{
	const observable = new ObservableInstance("Cheese");
	observable.subscribe(v =>
	{
		t.is(v, "Pineapple");
		t.end();
	});
	observable.set("Pineapple");
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