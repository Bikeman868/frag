// Allow the user to translate the scene by dragging with the left mouse
let sceneLocationX, sceneLocationY
function updateSceneLocation() {
  recipeGraph.getPosition().locationXYZ(sceneLocationX.value, sceneLocationY.value, 0);
};

sceneLocationX = engine.AnalogState(updateSceneLocation, { value: 0, minValue: -100, maxValue: 100 });
sceneLocationY = engine.AnalogState(updateSceneLocation, { value: 0, minValue: -100, maxValue: 100 });

engine.AnalogInput("left-pointer", sceneLocationX).enable();
engine.AnalogInput("left-pointer-vertical-inverted", sceneLocationY).enable();

// Allow the user to rotate the scene by dragging with the right mouse
let sceneRotationX, sceneRotationY
function updateSceneRotation() {
  recipeGraph.getPosition().rotateXYZ(sceneRotationX.value, sceneRotationY.value, 0);
};

sceneRotationX = engine.AnalogState(updateSceneRotation, { value: 0, minValue: -90 * degToRad, maxValue: 90 * degToRad });
sceneRotationY = engine.AnalogState(updateSceneRotation, { value: 0, minValue: -90 * degToRad, maxValue: 90 * degToRad });

engine.AnalogInput("right-pointer-vertical-inverted", sceneRotationX).enable();
engine.AnalogInput("right-pointer-inverted", sceneRotationY).enable();

