import test from "ava";
import { ObservableInstance } from "@src/observables/observableInstance";
import { isObservable } from "@src/observables/isObservable";


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
		get: (): void => t.fail("Calling get is not allowed"),
		set: (): void => t.fail("Calling set is not allowed"),
		subscribe: (): void => t.fail("Calling subscribe is not allowed"),
	};
	t.true(isObservable(observable));
});


test("Observable contract without get() is false", t =>
{
	const observable =
	{
		set: (): void => t.fail("Calling set is not allowed"),
		subscribe: (): void => t.fail("Calling subscribe is not allowed"),
	};
	t.false(isObservable(observable));
});


test("Observable contract without set() is false", t =>
{
	const observable =
	{
		get: (): void => t.fail("Calling get is not allowed"),
		subscribe: (): void => t.fail("Calling subscribe is not allowed"),
	};
	t.false(isObservable(observable));
});


test("Observable contract without subscribe() is false", t =>
{
	const observable =
	{
		get: (): void => t.fail("Calling get is not allowed"),
		set: (): void => t.fail("Calling set is not allowed"),
	};
	t.false(isObservable(observable));
});