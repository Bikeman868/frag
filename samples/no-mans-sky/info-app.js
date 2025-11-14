// This source file displays details of ingredients and recipes when that are clicked in the 3D scene

const infoApp = Vue.createApp({
  data() {
    return {
      recipe: {},
      ingredient: {},
    }
  }
});
infoApp.mount('#info')
