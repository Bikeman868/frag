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
  const output = lookupIngredient(recipe[0])
  recipe[0] = output
  output.recipeCount++
  recipe.profit = output.price * recipe[2]

  for (let j = 0; j < recipe[1].length; j++) {
    const input = lookupIngredient(recipe[1][j])
    recipe[1][j] = input
    input.recipeCount++
    recipe.profit -= input.price * recipe[3][j]
  }
}

for (let i = 0; i < ingredients.length; i++) {
  const ingredient = ingredients[i];
  const recipeWeight = Math.sqrt(ingredient.recipeCount + 1);
  ingredient.mass = 1000 + ingredient.recipeCount * 500;
  ingredient.repulsion = repulsionStrength * recipeWeight;
  ingredient.recipeAttraction = recipeAttractionStrength / recipeWeight;
}
