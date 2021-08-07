window.frag.ObservableValue = function (engine) {
    let value = null;
    const observable = frag.Observable(engine, (fn) => { fn(value); });

    const public = {};

    public.get = function () {
        return value;
    }

    public.set = function (v) {
        value = v;
        observable.notify();
    }

    public.subscribe = function (fn) {
        return observable.subscribe(fn);
    }

    public.unsubscribe = function (fn) {
        return observable.unsubscribe(fn);
    }

    return public;
};

/*
const observedValue = window.frag.ObservableValue(engine);
observedValue.set(42);

let observer1 = function (v) { console.log("Observer 1 received " + v); }
observedValue.subscribe(observer1);

observedValue.set(43);

let observer2 = function (v) { console.log("Observer 2 received " + v); }
observedValue.subscribe(observer2);

observedValue.unsubscribe(observer1);

observedValue.set(44);
*/