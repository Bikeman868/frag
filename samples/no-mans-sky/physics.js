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

// Run the physics simulation continuously
const physicsAnimation = frag.Animation(engine).repeatTicks(simulatePhysics, tickInterval).start();
