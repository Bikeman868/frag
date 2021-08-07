(function() {
    window._frag = {};
    for (let i = 0; i < window.frag.classes.length; i++) {
        const classname = window.frag.classes[i];
        window._frag[classname] = window.frag[classname];
        window.frag[classname] = function(engine) {
            if (engine && engine.isEngine) {
                if (!engine.isRendering)  {
                    if (!(['Transform', 'Transform3D', 'Transform2D', `Location`, 'Observable'].includes(classname)))
                        console.log(classname, arguments);
                }
                return window._frag[classname].apply(null, arguments)
            } else {
                console.error('You must pass the Frag engine as the first parameter to window.frag.' + classname, arguments);
            }
        }
    }
})();
