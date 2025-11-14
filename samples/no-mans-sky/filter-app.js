const filterApp = createApp({
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
  }
});
filterApp.mount('#filter')
