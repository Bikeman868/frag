const filterApp = Vue.createApp({
  data() {
    return {
      minProfitFilterEnabled: true,
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
  methods: {
    onFilterChanged() {
      window.filter(
        true,
        true,
        true,
        this.minProfitFilterEnabled ? this.minProfitFilter : undefined,
        this.enabledFamilies,
        this.enabledIngredients,
      );
    }
  },
  watch: {
    minProfitFilterEnabled() {
      this.onFilterChanged();
    },
    minProfitFilter() {
      this.onFilterChanged();
    },
    enabledFamilies() {
      this.onFilterChanged();
    },
    enabledIngredients() {
      this.onFilterChanged();
    },
  },
});

filterApp.mount('#filter')
