// priority: 1900

const SDBF = {
    modInstalled: (modId) => {
        return Platform.getMods().containsKey(modId);
    },
    getRecipeHelper: () => $RecipeRemovalHelper,

}
