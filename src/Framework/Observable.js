window.frag.Observable = function (engine, notify) {
    const private = {
        notify,
        observers: []
    }

    const public = {
        __private: private
    };

    public.dispose = function () {
    }

    public.subscribe = function (observer) {
        private.observers.push(observer);
        if (private.notify) private.notify(observer);
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
