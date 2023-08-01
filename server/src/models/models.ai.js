import { db } from "../utils/db.server.js";

export const saveRecipe = async (recipeData) => {
  const {
    recipeName,
    recipeDescription,
    recipeSteps,
    servingSize,
    nutritionFacts,
    ingredients,
  } = recipeData;

  return await db.recipe.create({
    data: {
      recipeName,
      recipeDescription,
      recipeSteps,
      servingSize,
      nutritionFacts,
      ingredients,
      creatorId: 1,
    },
  });
};
