window.frag = window.frag || {};
window.frag.gl = (function () {
    const canvas = document.getElementById("c");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        alert('No WebGL');
        return null;
    }

    gl.clearColor(1, 1, 1, 1);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    if (window.fragInit) window.fragInit(gl);

    return gl;
})();

// Framework config

window.frag.renderInterval = 15;
window.frag.gameTickMs = 10;

// Debug options

window.frag.debugMaterialLoader = false;
window.frag.debugModelLoader = false;
window.frag.debugShaderBuilder = false;
window.frag.debugAnimations = true;

// Texture unit allocation

window.frag.maxTextureUnits = window.frag.gl.getParameter(window.frag.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
window.frag.nextTextureUnit = 0;
window.frag.allocateTextureUnit = function () {
    const result = window.frag.nextTextureUnit;
    window.frag.nextTextureUnit = (window.frag.nextTextureUnit + 1) % window.frag.maxTextureUnits;
    return result;
};
