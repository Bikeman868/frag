// This source file allows filtering of recipes and ingredients

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

const filterApp = Vue.createApp({
  data() {
    return {
      oneIngredientEnabled: true,
      twoIngredienstEnabled: false,
      threeIngredientsEnabled: false,
      minProfitFilterEnabled: true,
      enableAllIngredients: true,
      enableAllFamilies: true,
      minProfitFilter: 0,
      families: [
        { id: 'carbon-family', name:'Carbon' },
        { id: 'ferrite-family', name:'Ferrite' },
        { id: 'gasses-family', name:'Gasses' },
        { id: 'metals-family', name:'Metals' },
        { id: 'minerals-family', name:'Minerals' },
        { id: 'misc-family', name:'Misc' },
        { id: 'sodium-family', name:'Sodium' },
      ],
      enabledFamilies: ['Carbon', 'Ferrite', 'Gasses', 'Metals', 'Minerals', 'Misc', 'Sodium'],
      ingredients: ingredients,
      enabledIngredients: ingredients.map((i) => i.name),
    }
  },
  computed: {
    filter() {
      return {
        oneIngredientEnabled: this.oneIngredientEnabled,
        twoIngredienstEnabled: this.twoIngredienstEnabled,
        threeIngredientsEnabled: this.threeIngredientsEnabled,
        minProfitFilterEnabled: this.minProfitFilterEnabled,
        minProfitFilter: this.minProfitFilter,
        enabledFamilies: this.enabledFamilies,
        enabledIngredients: this.enabledIngredients,
      }
    },
  },
  watch: {
    filter: {
      handler(f) {
        window.filter(
          f.oneIngredientEnabled,
          f.twoIngredienstEnabled,
          f.threeIngredientsEnabled,
          f.minProfitFilterEnabled ? f.minProfitFilter : undefined,
          f.enabledFamilies,
          f.enabledIngredients,
        );
      },
      immediate: true,
    },
    enableAllIngredients: {
      handler(value) {
        if (value) this.enabledIngredients = ingredients.map((i) => i.name);
        else this.enabledIngredients = [];
      }
    },
    enableAllFamilies: {
      handler(value) {
        if (value) this.enabledFamilies = this.families.map((i) => i.name);
        else this.enabledFamilies = [];
      }
    },
  },
});

filterApp.mount('#filter')
