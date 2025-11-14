const filterApp = Vue.createApp({
  data() {
    return {
      oneIngredientEnabled: true,
      twoIngredienstEnabled: false,
      threeIngredientsEnabled: false,
      minProfitFilterEnabled: true,
      enableAllIngredients: true,
      enableAllFamilies: false,
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
      enabledFamilies: ['Carbon', 'Ferrite', 'Gasses', 'Metals','Minerals', 'Sodium'],
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
