// Add derived properties to raw ingredient and recipe data

function lookupIngredient(name) {
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient  = ingredients[i]
    if (ingredient.name == name) return ingredient
  }
  console.error(`Ingredient "` + name + '" is not defined')
}

for (let i = 0; i < ingredients.length; i++) {
  const ingredient = ingredients[i];
  ingredient.index = i;
  ingredient.recipeCount = 0
}

for (let i = 0; i < recipies.length; i++) {
  const recipe = recipies[i];
  recipe.index = i;

  recipe.output = {
    ingredient: lookupIngredient(recipe[0]),
    quantity: recipe[2],
  }
  recipe.profit = recipe.output.ingredient.price * recipe[2];
  recipe.output.ingredient.recipeCount++;

  // TODO: Legacy
  recipe[0] = recipe.output.ingredient;

  recipe.inputs = [];
  for (let j = 0; j < recipe[1].length; j++) {
    const input = {
      ingredient: lookupIngredient(recipe[1][j]),
      quantity: recipe[3][j],
    }
    input.ingredient.recipeCount++
    recipe.inputs[j] = input;
    recipe.profit -= input.ingredient.price * input.quantity;

    // TODO: Legacy
    recipe[1][j] = input.ingredient;
  }
}

for (let i = 0; i < ingredients.length; i++) {
  const ingredient = ingredients[i];
  const recipeWeight = Math.sqrt(ingredient.recipeCount + 1);
  ingredient.mass = 300 + ingredient.recipeCount * 150;
  ingredient.repulsion = repulsionStrength * recipeWeight;
  ingredient.recipeAttraction = recipeAttractionStrength / recipeWeight;
}
