// This public draws 2D shapes scaled to the width of the viewport.
// It is designed to be used in conjunction with the UiShader which will project onto the front of the viewport.

window.frag.UiCamera = function () {

    const private = {
        aspectRatio: 1};

    const public = {
        worldToClipTransform: window.frag.Transform2D().identity()
    };

    public.scale = function (horizontalScale) {
        var matrix = public.worldToClipTransform.getMatrix();
        matrix[0] = 1 / horizontalScale;
        public.worldToClipTransform.setMatrix(matrix);
        private.aspectRatio = -1;
        return public;
    }

    public.setViewport = function (gl) {
        gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;

        return public.adjustToViewport(gl);
    };

    public.adjustToViewport = function (gl) {
        const aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;

        if (private.aspectRatio != aspectRatio) {
            const matrix = public.worldToClipTransform.getMatrix();
            matrix[4] = matrix[0] * aspectRatio;
            public.worldToClipTransform.setMatrix(matrix);

            private.aspectRatio = aspectRatio;
        }

        return public;
    }

    return public;
};
