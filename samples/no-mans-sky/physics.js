function updateIngredientPositions() {
  const Vector = frag.Vector;

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
      const aMinusB = Vector.sub(ingredientA.position, ingredientB.position);
      const distance = Vector.length(aMinusB);
      const direction = Vector.normalize(aMinusB);
      let repulsionMagnitude =
        (ingredientB.repulsion * Math.exp(-repulsionDecay * distance)) /
        (distance * distance);
      if (ingredientA.family == ingredientB.family) repulsionMagnitude *= 0.5;
      if (ingredientA.isSelected || ingredientB.isSelected) repulsionMagnitude *= 5;
      const repulsionForce = Vector.mult(direction, repulsionMagnitude);
      forces[i] = Vector.add(forces[i], repulsionForce);
      forces[j] = Vector.sub(forces[j], repulsionForce);
    }
  }

  // All Ingredients are attracted to the origin
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    if (ingredient.sceneObject.isDisabled()) continue
    const origin = ingredient.isSelected ? [0, 0, -80] : [0, 0, 0];
    const vectorFromOrigin = Vector.sub(ingredient.position, origin);
    const distanceFromOrigin = Vector.length(vectorFromOrigin);
    const direction = Vector.normalize(vectorFromOrigin);
    let attractionMagnitude = -originAttractionStrength * distanceFromOrigin;
    if (ingredient.isSelected) attractionMagnitude *= 3000;
    const attractionForce = Vector.mult(direction, attractionMagnitude);
    forces[i] = Vector.add(forces[i], attractionForce);
  }

  // Ingredients that are connected by a recipe are attracted to each other
  for (let i = 0; i < recipies.length; i++) {
    const recipe = recipies[i];
    const outputIngredient = recipe.output.ingredient;
    if (outputIngredient.sceneObject.isDisabled()) continue;
    for (let j = 0; j < recipe.inputs.length; j++) {
      const inputIngredient = recipe.inputs[j].ingredient;
      if (inputIngredient.sceneObject.isDisabled()) continue;
      const aMinusB = Vector.sub(outputIngredient.position, inputIngredient.position);
      const distance = Vector.length(aMinusB);
      const direction = Vector.normalize(aMinusB);
      let attractionMagnitude = -distance * (outputIngredient.recipeAttraction + inputIngredient.recipeAttraction);
      if (outputIngredient.isSelected) attractionMagnitude *= 5;
      const attractionForce = Vector.mult(direction, attractionMagnitude);
      forces[outputIngredient.index] = Vector.add(forces[outputIngredient.index], attractionForce);
      forces[inputIngredient.index] = Vector.sub(forces[inputIngredient.index], attractionForce);
    }
  }

  // Try to keep ingredients within the scena clipping region
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    if (ingredient.sceneObject.isDisabled()) continue;
    const z = ingredient.position[2];
    let magnitude = 0
    if (z > 80) {
      magnitude = -((z - 80) * (z - 80))
    } else if (z < -80) {
      magnitude = (z + 80) * (z + 80)
    }
    if (magnitude != 0) {
      const force = [0, 0, magnitude * boundaryRepulsionStrength]
      forces[i] = Vector.add(forces[i], force);
    }
  }

  // Update velocities and positions of ingredients
  elapsedTime = tickInterval / 100;
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    if (ingredient.sceneObject.isDisabled()) continue
    const force = forces[i];
    const acceleration = Vector.div(force, ingredient.mass);

    ingredient.velocity = Vector.mult(Vector.add(ingredient.velocity, acceleration), velocityDamping);
    ingredient.position = Vector.add(ingredient.position, Vector.mult(ingredient.velocity, elapsedTime));

    ingredient.sceneObject.getPosition().location(ingredient.position);
  }
}

function updateRecipePositions() {
  const Vector = frag.Vector;

  for (let i = 0; i < recipies.length; i++) {
    const recipe = recipies[i];

    let sum = recipe.output.ingredient.position;
    for (let j = 0; j < recipe.inputs.length; j++)
      sum = Vector.add(sum, recipe.inputs[j].ingredient.position);

    recipe.position = Vector.div(sum, recipe.inputs.length + 1);
    recipe.sceneObject.getPosition().location(recipe.position);
  }
}

function updatePipePositions() {
  const Vector = frag.Vector;

  for (let i = 0; i < recipies.length; i++) {
    const recipe = recipies[i];
    for (let j = 0; j < recipe.pipes.length; j++) {
      const pipe = recipe.pipes[j];
      const ingredient = pipe.ingredient;

      const direction = Vector.sub(ingredient.position, recipe.position);
      const distance = Vector.length(direction);
      const pipeLength = distance - ingredientRadius - recipeRadius;

      if (distance > 0.01) {
        const ratioToMidpoint = (recipeRadius + (pipeLength / 2)) / distance;
        const midpoint = frag.Vector.add(recipe.position, frag.Vector.mult(direction, ratioToMidpoint));

        // TODO: Fix the heading function - it should work for this use case
        // const heading = Vector.heading(direction);
        // pipe.sceneObject.getPosition().rotate(heading).location(midpoint).scaleZ(pipeLength / 2);

        const dir = Vector.normalize(direction);
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

// Run the physics simulation continuously
const physicsAnimation = frag.Animation(engine).repeatTicks(simulatePhysics, tickInterval).start();
