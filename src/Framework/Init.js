/* To customize Frag for your application, set properties of the
   frag object before calling `window.frag.init()` as illustrated 
   by the following example:

window.frag.canvas = document.getElementById("my-canvas");
window.frag.config = function(frag) {
    frag.gl.clearColor(0, 0, 0, 1);
    frag.debugShaderBuilder = true;
    frag.renderInterval = 10;
    frag.gameTickMs = 50;
}
window.frag.init();
*/

window.frag = window.frag || {};

window.frag.startFunctions = [];

window.frag.init = function () {
    const frag = window.frag;
    frag.canvas = frag.canvas || document.getElementById("scene");
    if (!frag.canvas){
        console.error('No canvas with id of "scene" in the page');
        return null;
    }

    const gl = frag.canvas.getContext("webgl");
    if (!gl) {
        alert("WebGL is not available");
        return null;
    }
    frag.gl = gl;

    frag.canvas.addEventListener('contextmenu', event => event.preventDefault());

    gl.clearColor(1, 1, 1, 1);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    frag.renderInterval = 15;
    frag.gameTickMs = 10;

    frag.debugPackageLoader = false;
    frag.debugShaderBuilder = false;
    frag.debugAnimations = false;
    frag.debugMeshes = false;
    frag.debugInputs = false;

    frag.maxTextureUnits = frag.gl.getParameter(frag.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    frag.nextTextureUnit = 0;
    frag.allocateTextureUnit = function () {
        const result = frag.nextTextureUnit;
        frag.nextTextureUnit = (frag.nextTextureUnit + 1) % frag.maxTextureUnits;
        return result;
    };

    if (frag.config) frag.config(frag);

    for (var i = 0; i < frag.startFunctions.length; i++)
        frag.startFunctions[i](frag);

    return frag;
};
