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
        break;
      case 'recipe':
        selectedRecipe.value = recipies[hit.sceneObject.objectIndex];
        selectedIngredient.value = null;
        break;
      }
   }
});
