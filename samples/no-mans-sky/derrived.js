// This source file adds derived properties to raw ingredient and recipe data

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
  ingredient.recipes = []
}

for (let i = 0; i < recipies.length; i++) {
  const outputName = recipies[i][0];
  const inputNames = recipies[i][1];
  const outputQuantity = recipies[i][2]
  const inputQuantities = recipies[i][3]
  
  const recipe = {
    index: i,
    output: {
      ingredient: lookupIngredient(outputName),
      quantity: outputQuantity,
    },
    inputs: [],
    profit: 0,
  }
  recipies[i] = recipe;

  recipe.output.ingredient.recipes.push(recipe);
  const outputValue = recipe.output.ingredient.price * recipe.output.quantity;
  let ingredientCost = 0;

  for (let j = 0; j < inputNames.length; j++) {
    const input = {
      ingredient: lookupIngredient(inputNames[j]),
      quantity: inputQuantities[j],
    }
    if (input.ingredient.index !== recipe.output.ingredient.index)
      input.ingredient.recipes.push(recipe);
    recipe.inputs[j] = input;
    ingredientCost += input.ingredient.price * input.quantity;
  }

  recipe.profit = outputValue - ingredientCost;
  recipe.profitPercent = Math.floor(recipe.profit / ingredientCost * 100);
}

for (let i = 0; i < ingredients.length; i++) {
  const ingredient = ingredients[i];
  const recipeWeight = Math.sqrt(ingredient.recipes.length + 1);
  ingredient.mass = 300 + ingredient.recipes.length * 150;
  ingredient.repulsion = repulsionStrength * recipeWeight;
  ingredient.recipeAttraction = recipeAttractionStrength / recipeWeight;
}
