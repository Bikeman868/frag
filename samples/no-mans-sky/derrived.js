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
  recipe[0] = lookupIngredient(recipe[0])
  recipe[0].recipeCount++
  for (let j = 0; j < recipe[1].length; j++) {
    recipe[1][j] = lookupIngredient(recipe[1][j])
    recipe[1][j].recipeCount++
  }
}

for (let i = 0; i < ingredients.length; i++) {
  const ingredient = ingredients[i];
  ingredient.mass = 1000 + ingredient.recipeCount * 100;
  ingredient.attraction = ingredient.recipeCount ? recipeAttractionStrength / ingredient.recipeCount : 0;
}
