window.frag.Observable = function (notify) {
    const private = {
        notify,
        observers: []
    }

    const public = {
        __private: private
    };

    public.subscribe = function (observer) {
        private.observers.push(observer);
        private.notify(observer);
    };

    public.unsubscribe = function (observer) {
        for (let i = 0; i < private.observers.length; i++) {
            if (private.observers[i] === observer) {
                private.observers.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    public.notify = function (fn) {
        fn = fn || private.notify || (function (observer) { observer(); });
        for (let i = 0; i < private.observers.length; i++) {
            fn(private.observers[i]);
        }
    }

    return public;
};

window.frag.ObservableValue = function () {
    let value = null;
    const observable = frag.Observable((fn) => { fn(value); });

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
const observedValue = window.frag.ObservableValue();
observedValue.set(42);

let observer1 = function (v) { console.log("Observer 1 received " + v); }
observedValue.subscribe(observer1);

observedValue.set(43);

let observer2 = function (v) { console.log("Observer 2 received " + v); }
observedValue.subscribe(observer2);

observedValue.unsubscribe(observer1);

observedValue.set(44);
*/