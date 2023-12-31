import * as model from "../models/models.ai.js";
import { validationResult } from "express-validator";
import { Configuration, OpenAIApi } from "openai";
import { config } from "dotenv";
config();

//this function just does the math and replaces any fractions
  //sanitizing data for slashes
  const sanitizeContent = (content) => {
      const fraction = /\b(\d+)\/(\d+)\b/g;
    return content.replace(fraction, (match, numerator, denominator) => {
        return numerator / denominator
  })
}
export const getRecipe = async (req, res) => {
  try {
    const input = req.body.meal;
    const creatorId = req.body.creatorId
    const openai = new OpenAIApi(
      new Configuration({
        apiKey: process.env.API_KEY,
      })
    );

  const prompt = `Provide a meal recipe that best fits this prompt: "${input}" give it this JSON format with all measure numbers in decimal format, do not use any '/', no fractions allowed:

  { "recipeName": "",
  "recipeDescription": "",
  "recipeSteps": ["1. ...", ...],
  "servingSize": number,
  "nutritionFacts": {
    "calories": number,
    "totalFat": number,
    "saturatedFat": number,
    "cholesterol": number,
    "sodium": number,
    "carbohydrates": number,
    "fiber": number,
    "sugars": number,
    "protein": number
  },
  "ingredients": [

       ["number(0.0)", "measurement", "ingredient"]

  ]}`;

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    max_tokens: 1000,
    messages: [
      { "role": "system", "content": prompt }
    ]
  });


  console.log(response.data.choices[0].message.content)
  const content = response.data.choices[0].message.content;
  const sanitized = sanitizeContent(content);
  console.log("SANITIZED CONTENT",sanitized)
  const recipeData = JSON.parse(sanitized);

    // console.log(prompt)
    // const response = await openai.createChatCompletion({
    //   model: "gpt-3.5-turbo",
    //   max_tokens: 1000,
    //   messages: [
    //     { "role": "system", "content": prompt }
    //   ]
    // });
    //parse the recipe received from OpenAI

    /* USER NEEDS TO BE CHANGED TO GUY WHO ACTUALLY REACTED IT LATER!!!!!!!!!!____!_!_!__!_!_!_!__!_!_!__!__!_!_!__!_!_!_!__!*/

  const saveRecipe = await model.saveRecipe(recipeData, creatorId);
  const mealId = saveRecipe.id
  console.log(response.data);
  res.json({recipe:recipeData, mealID:mealId});
  } catch (err) {
    console.log("all hail the meatball man", err);
    res.status(500).send(err);
  }
};

export const likeRecipe = async (req, res) => {
  try {
    console.log('TRYING TO LIKE RECIPE', req.body)
    const recipeId = req.body.recipeId;
    const userId = req.body.userId; // This should come from the authenticated user session
    await model.saveRecipetoUser(recipeId, userId);
    res.status(200).send({ message: "Recipe liked" });
  } catch (err) {
    // console.error(err);
    res.status(500).send(err.body);
  }
};

export const unlikeRecipe = async (req, res) => {
  try {
    console.log('TRYING TO UNLIKE RECIPE', req.body)
    const recipeId = req.body.recipeId;
    const userId = req.body.userId;
    await model.unsaveRecipetoUser(recipeId, userId);
    res.status(200).send({ message: "Recipe unliked" });
  } catch (err) {
    // console.error(err);
    res.status(500).send(err);
  }
};
