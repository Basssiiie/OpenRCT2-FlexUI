/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { isObservable } from "@src/bindings/isObservable";
import { ObservableInstance } from "@src/bindings/observableInstance";
import test from "ava";


test("Observable string is true", t =>
{
	const observable = new ObservableInstance("Bob");
	t.true(isObservable(observable));
});


test("Observable number is true", t =>
{
	const observable = new ObservableInstance(54);
	t.true(isObservable(observable));
});


test("Null is false", t =>
{
	t.false(isObservable(null));
});


test("Undefined is false", t =>
{
	t.false(isObservable(undefined));
});


test("Object is false", t =>
{
	t.false(isObservable({ observable: true }));
});


test("String is false", t =>
{
	t.false(isObservable("observable"));
});


test("Number is false", t =>
{
	t.false(isObservable(12345));
});


test("Observable contract is true", t =>
{
	const observable =
	{
		get: () => t.fail("Calling get is not allowed"),
		set: () => t.fail("Calling set is not allowed"),
		subscribe: () => t.fail("Calling subscribe is not allowed"),
	};
	t.true(isObservable(observable));
});


test("Observable contract without get() is false", t =>
{
	const observable =
	{
		set: () => t.fail("Calling set is not allowed"),
		subscribe: () => t.fail("Calling subscribe is not allowed"),
	};
	t.false(isObservable(observable));
});


test("Observable contract without set() is false", t =>
{
	const observable =
	{
		get: () => t.fail("Calling get is not allowed"),
		subscribe: () => t.fail("Calling subscribe is not allowed"),
	};
	t.false(isObservable(observable));
});


test("Observable contract without subscribe() is false", t =>
{
	const observable =
	{
		get: () => t.fail("Calling get is not allowed"),
		set: () => t.fail("Calling set is not allowed"),
	};
	t.false(isObservable(observable));
});