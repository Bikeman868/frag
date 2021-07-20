// Provides a mechanism to execute another animation action a specific
// number of times
window.frag.RepeatAnimationAction = function (engine, action, count) {
    return {
        duration: action.duration * count,
        interval: action.interval,
        start: action.start,
        stop: action.stop,
        action: action.action,
        dispose: function () {}    
    };
}
