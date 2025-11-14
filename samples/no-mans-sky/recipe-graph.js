// Helper functions

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

// Create a parent object representing the recipe graph so that we can rotate it within the scene
const recipeGraph = frag.SceneObject(engine);
scene.addObject(recipeGraph);

// Define a shared ingredient elements
const ingredientShader = frag.Shader(engine).diffuseTexture().directionalLightGrey().compile().lightDirection(lightDirection);

let ingredientMesh;
switch (ingredientShape) {
  case 'disc':
    ingredientMesh = frag.Disc(engine, 16);
    break;
  case 'hemisphere':
    ingredientMesh = frag.Sphere(engine, 16, {
      longitudeFacets: 16,
      longitudeStart: Math.PI * 0.5,
      longitudeLength: Math.PI,
      longitudeTextureStart: Math.PI * 0.7,
      longitudeTextureEnd: Math.PI * 1.5,
      latitudeTextureStart: Math.PI * 0.1,
      latitudeTextureEnd: Math.PI * 0.9,
    })
    break;
  case 'sphere':
    ingredientMesh = frag.Sphere(engine, 16, {
      latitudeTextureStart: Math.PI * 0.2,
      latitudeTextureEnd: Math.PI * 0.8,
      longitudeTextureRepeat: 3,
    })
    break;
}

// Augment each ingredient with additional information needed to animate it
for (let i = 0; i < ingredients.length; i++) {
  const ingredient = ingredients[i];

  ingredient.position = [
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 40,
  ];
  ingredient.velocity = [0, 0, 0];

  let diffuseTexture
  if (ingredient.textureUrl)
    diffuseTexture = frag.Texture(engine).dataFormat(engine.gl.RGBA).fromUrl(0, ingredient.textureUrl, '');
  else if (ingredient.color) {
    if (ingredient.color.length == 4)
      diffuseTexture = frag.Texture(engine).dataFormat(engine.gl.RGBA).fromArrayBuffer(0, new Uint8Array(frag.Vector.mult(ingredient.color, 255)), 0, 1, 1);
    else
      diffuseTexture = frag.Texture(engine).dataFormat(engine.gl.RGB).fromArrayBuffer(0, new Uint8Array(frag.Vector.mult(ingredient.color, 255)), 0, 1, 1);
  }
  else 
    diffuseTexture = frag.Texture(engine).dataFormat(engine.gl.RGB).fromArrayBuffer(0, new Uint8Array([randomInt(100, 255), randomInt(100, 255), randomInt(100, 255)]), 0, 1, 1);

  const material = frag.Material(engine)
    .setTexture('diffuse', diffuseTexture);

  ingredient.sceneObject = frag.SceneObject(engine, 
    frag.Model(engine)
      .mesh(ingredientMesh)
      .material(material)
      .shader(ingredientShader)
  );

  ingredient.sceneObject.getPosition()
    .scale(ingredientRadius)
    .location(ingredient.position);

  switch (ingredientShape) {
    case 'sphere':
    case 'hemisphere':
      ingredient.sceneObject.getPosition().rotateY(Math.PI * -0.5)
  }
  recipeGraph.addObject(ingredient.sceneObject);
}

// Define a shared recipe elements

const recipeShader = frag.Shader(engine).colorsRGB().directionalLightGrey().compile().lightDirection(lightDirection);
const recipeModel = frag.Model(engine).mesh(frag.Sphere(engine, 8, { color: [1, 1, 1] }).shadeSmooth()).shader(recipeShader);

// Augment each recipe with with additional information needed to animate it

for (let i = 0; i < recipies.length; i++) {
  const recipe = recipies[i];
  recipe.position = [0, 0, 0];
  recipe.sceneObject = frag.SceneObject(engine, recipeModel);

  recipe.sceneObject.getPosition()
    .scale(recipeRadius)
    .location(recipe.position);

  recipeGraph.addObject(recipe.sceneObject);
}

// Define shared pipe elements

const pipeShader = frag.Shader(engine).colorsRGB().directionalLightGrey().compile().lightDirection(lightDirection);
const inputPipeMesh = frag.Cylinder(engine, 8, { color: [0.3, 0.3, 1] }).shadeSmooth();
const outputPipeMesh = frag.Cylinder(engine, 8, { color: [1, 0.3, 0.3] }).shadeSmooth();

// Add pipes to recipe inputs and outputs to connect to the ingredients
for (let i = 0; i < recipies.length; i++) {
  const recipe = recipies[i];

  recipe.pipes = [{
    ingredient: recipe.output.ingredient,
    mesh: outputPipeMesh,
  }];

  for (let j = 0; j < recipe.inputs.length; j++) {
    recipe.pipes.push({
      ingredient: recipe.inputs[j].ingredient,
      mesh: inputPipeMesh,
    });
  }

  for (let j = 0; j < recipe.pipes.length; j++) {
    const pipe = recipe.pipes[j];
    pipe.sceneObject = frag.SceneObject(engine, frag.Model(engine).mesh(pipe.mesh).shader(pipeShader).shadeSmooth());
    pipe.sceneObject.getPosition().scaleXYZ(pipeRadius, pipeRadius, 1);
    recipeGraph.addObject(pipe.sceneObject);
  }
}

function updateIngredientPositions() {
  // Start from all ingredeints having no force applied to them
  const forces = [];
  for (let i = 0; i < ingredients.length; i++) forces[i] = [0, 0, 0];

  // All ingredients repel each other
  for (let i = 0; i < ingredients.length; i++) {
    const ingredientA = ingredients[i];
    if (ingredientA.sceneObject.isDisabled()) continue
    for (let j = i + 1; j < ingredients.length; j++) {
      const ingredientB = ingredients[j];
      if (ingredientB.sceneObject.isDisabled()) continue
      const aMinusB = frag.Vector.sub(ingredientA.position, ingredientB.position);
      const distance = frag.Vector.length(aMinusB);
      const direction = frag.Vector.normalize(aMinusB);
      let repulsionMagnitude =
        (ingredientB.repulsion * Math.exp(-repulsionDecay * distance)) /
        (distance * distance);
      if (ingredientA.family == ingredientB.family) repulsionMagnitude *= 0.5
      const repulsionForce = frag.Vector.mult(direction, repulsionMagnitude);
      forces[i] = frag.Vector.add(forces[i], repulsionForce);
      forces[j] = frag.Vector.sub(forces[j], repulsionForce);
    }
  }

  // All Ingredients are attracted to the origin
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    if (ingredient.sceneObject.isDisabled()) continue
    const distanceFromOrigin = frag.Vector.length(ingredient.position);
    const direction = frag.Vector.normalize(ingredient.position);
    const attractionMagnitude = -originAttractionStrength * distanceFromOrigin;
    const attractionForce = frag.Vector.mult(direction, attractionMagnitude);
    forces[i] = frag.Vector.add(forces[i], attractionForce);
  }

  // Ingredients that are connected by a recipe are attracted to each other
  for (let i = 0; i < recipies.length; i++) {
    const recipe = recipies[i];
    const outputIngredient = recipe.output.ingredient;
    if (outputIngredient.sceneObject.isDisabled()) continue
    for (let j = 0; j < recipe.inputs.length; j++) {
      const inputIngredient = recipe.inputs[j].ingredient;
      if (inputIngredient.sceneObject.isDisabled()) continue
      const aMinusB = frag.Vector.sub(outputIngredient.position, inputIngredient.position);
      const distance = frag.Vector.length(aMinusB);
      const direction = frag.Vector.normalize(aMinusB);
      const attractionMagnitude = -distance * (outputIngredient.recipeAttraction + inputIngredient.recipeAttraction);
      const attractionForce = frag.Vector.mult(direction, attractionMagnitude);
      forces[outputIngredient.index] = frag.Vector.add(forces[outputIngredient.index], attractionForce);
      forces[inputIngredient.index] = frag.Vector.sub(forces[inputIngredient.index], attractionForce);
    }
  }

  // Update velocities and positions of ingredients
  elapsedTime = tickInterval / 100;
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    if (ingredient.sceneObject.isDisabled()) continue
    const force = forces[i];
    const acceleration = frag.Vector.div(force, ingredient.mass);

    ingredient.velocity = frag.Vector.mult(frag.Vector.add(ingredient.velocity, acceleration), velocityDamping);
    ingredient.position = frag.Vector.add(ingredient.position, frag.Vector.mult(ingredient.velocity, elapsedTime));

    ingredient.sceneObject.getPosition().location(ingredient.position);
  }
}

function updateRecipePositions() {
  for (let i = 0; i < recipies.length; i++) {
    const recipe = recipies[i];

    let sum = recipe.output.ingredient.position;
    for (let j = 0; j < recipe.inputs.length; j++)
      sum = frag.Vector.add(sum, recipe.inputs[j].ingredient.position);

    recipe.position = frag.Vector.div(sum, recipe.inputs.length + 1);
    recipe.sceneObject.getPosition().location(recipe.position);
  }
}

function updatePipePositions() {
  for (let i = 0; i < recipies.length; i++) {
    const recipe = recipies[i];
    for (let j = 0; j < recipe.pipes.length; j++) {
      const pipe = recipe.pipes[j];
      const ingredient = pipe.ingredient;

      const direction = frag.Vector.sub(ingredient.position, recipe.position);
      const distance = frag.Vector.length(direction);
      const pipeLength = distance - ingredientRadius - recipeRadius;

      if (distance > 0.01) {
        const ratioToMidpoint = (recipeRadius + (pipeLength / 2)) / distance;
        const midpoint = frag.Vector.add(recipe.position, frag.Vector.mult(direction, ratioToMidpoint));

        // TODO: Fix the heading function - it should work for this use case
        // const heading = frag.Vector.heading(direction);
        // pipe.sceneObject.getPosition().rotate(heading).location(midpoint).scaleZ(pipeLength / 2);

        const dir = frag.Vector.normalize(direction);
        pipe.sceneObject.getPosition()
          .scaleZ(pipeLength / 2)
          .location(midpoint)
          .rotateX(Math.atan2(-dir[1], dir[2]))
          .rotateY(Math.asin(dir[0]));
      }
    }
  }
}

function simulatePhysics() {
  updateIngredientPositions();
  updateRecipePositions();
  updatePipePositions();
}

function filter(oneIngredient, twoIngredients, threeIngredients, minProfit, enabledFamilies, enabledIngredients ) {
  if (oneIngredient == undefined) oneIngredient = true
  if (twoIngredients == undefined) twoIngredients = false
  if (threeIngredients == undefined) threeIngredients = false

  const ingredientEnabled = [];
  const recipeEnabled = [];

  for (let i = 0; i < ingredients.length; i++) {
    ingredientEnabled[i] = true;
  }

  for (let i = 0; i < recipies.length; i++) {
    recipeEnabled[i] = true;
  }

  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    if (enabledIngredients && !enabledIngredients.includes(ingredient.name)) ingredientEnabled[i] = false;
    else if (enabledFamilies && !enabledFamilies.includes(ingredient.family)) ingredientEnabled[i] = false;
  }

  let changed = true
  while (changed) {
    changed = false;

    const recipeCount = [];
    for (let i = 0; i < ingredients.length; i++) {
      recipeCount[i] = 0;
    }

    for (let i = 0; i < recipies.length; i++) {
      const recipe = recipies[i];

      if (recipeEnabled[i]) {
        if (recipe.inputs.length == 1 && !oneIngredient) recipeEnabled[i] = false;
        else if (recipe.inputs.length == 2 && !twoIngredients) recipeEnabled[i] = false;
        else if (recipe.inputs.length == 3 && !threeIngredients) recipeEnabled[i] = false;
        else if (minProfit != undefined && recipe.profit < minProfit) recipeEnabled[i] = false;

        if (!ingredientEnabled[recipe.output.ingredient.index]) recipeEnabled[i] = false;
        for (var j = 0; j < recipe.inputs.length; j++) {
          if (!ingredientEnabled[recipe.inputs[j].ingredient.index]) recipeEnabled[i] = false;
        }

        if (!recipeEnabled[i]) changed = true;
      }

      if (recipeEnabled[i]) {
        recipeCount[recipe.output.ingredient.index]++;
        for (var j = 0; j < recipe.inputs.length; j++) {
          recipeCount[recipe.inputs[j].ingredient.index]++;
        }
      }
    }

    for (let i = 0; i < ingredients.length; i++) {
      if (ingredientEnabled[i] && recipeCount[i] == 0) {
        ingredientEnabled[i] = false;
        changed = true;
      }
    }
  }

  for (let i = 0; i < ingredients.length; i++) {
    if (ingredientEnabled[i]) ingredients[i].sceneObject.enable();
    else ingredients[i].sceneObject.disable();
  }

  for (let i = 0; i < recipies.length; i++) {
    const recipe = recipies[i];
    if (recipeEnabled[i]) {
      recipe.sceneObject.enable();
      for (var j = 0; j < recipe.pipes.length; j++) {
        recipe.pipes[j].sceneObject.enable();
      }
    } else {
      recipe.sceneObject.disable();
      for (var j = 0; j < recipe.pipes.length; j++) {
        recipe.pipes[j].sceneObject.disable();
      }
    }
  }
}

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

// Run the physics simulation continuously
const physicsAnimation = frag.Animation(engine).repeatTicks(simulatePhysics, tickInterval).start();
