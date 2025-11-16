// This source file displays details of ingredients and recipes when that are clicked in the 3D scene

const selectedIngredient = Vue.ref(null);
const selectedRecipe = Vue.ref(null);

const infoApp = Vue.createApp({
  data() {
    return {
      ingredient: selectedIngredient,
      recipe: selectedRecipe,
    }
  },
  methods: {
    selectRecipe(recipe) {
      selectedRecipe.value = recipe;
      selectedIngredient.value = null;
    },
    selectIngredient(ingredient) {
      selectedRecipe.value = null;
      selectedIngredient.value = ingredient;
    },
  }
});
infoApp.mount('#info')

engine.canvas.addEventListener('click', function(event) {
  const rect = engine.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const hit = engine.hitTest(x, y);
  if (hit) {
    switch (hit.sceneObject.objectType) {
      case 'ingredient':
        selectedIngredient.value = ingredients[hit.sceneObject.objectIndex];
        selectedRecipe.value = null;
        for (var i = 0; i < ingredients.length; i++) {
          const ingredient = ingredients[i];
          ingredient.isSelected = ingredient.index == selectedIngredient.value.index;
        }
        return;
      case 'recipe':
        const recipe = recipies[hit.sceneObject.objectIndex]
        selectedRecipe.value = recipe;
        selectedIngredient.value = null;
        for (var i = 0; i < ingredients.length; i++) {
          ingredients[i].isSelected = false;
        }
        recipe.output.ingredient.isSelected = true;
        for (var i= 0; i < recipe.inputs; i++)
          recipe.inputs[i].ingredient.selected = true;
        return;
      }
   }
   selectedRecipe.value = null;
   selectedIngredient.value = null;
   for (var i = 0; i < ingredients.length; i++) {
    ingredients[i].isSelected = false;
  }
});
