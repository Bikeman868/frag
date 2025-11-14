// This source file constructs a scene that we can draw 3D models into

const sceneCanvas = document.getElementById("scene");
const frag = window.frag;
const engine = frag
  .Engine({ canvas: sceneCanvas })
  .onStart((engine) => {
    engine.gl.clearColor(0, 0, 0, 1);
    engine.gl.disable(engine.gl.CULL_FACE); // Pipes are open at the ends and we want to see the inside surface
  });
engine.start();

const degToRad = Math.PI / 180;

// Set up the camera to view the scene
const camera = frag.FrustumCamera(engine).frustum(50, 50, 2000);
camera.getPosition().locationZ(-150);

// Create the scene
const scene = frag.Scene(engine).camera(camera);
engine.mainScene(scene);
