// priority: 1900

let SDBF = {
    modInstalled: (modId) => {
        return Platform.getMods().containsKey(modId);
    },
    getRecipeHelper: () => $RecipeRemovalHelper,

}
