import { useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";

Amplify.configure(outputs);
const client = generateClient<Schema>();

function App() {
  const [ingredients, setIngredients] = useState<string>("");
  const [recipe, setRecipe] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerateRecipe = async () => {
    setLoading(true);
    setRecipe("");

    try {
      const ingredientsArray = ingredients
        .split(",")
        .map((ingredient) => ingredient.trim())
        .filter((ingredient) => ingredient.length > 0);

      const response = await client.queries.askBedrock({
        ingredients: ingredientsArray,
      });

      if (response?.data?.body) {
        setRecipe(response.data.body);
      } else if (response?.data?.error) {
        setRecipe(`Error: ${response.data.error}`);
      } else {
        setRecipe("No recipe generated. Please try again.");
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      setRecipe("An error occurred while generating the recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal <span className="highlight">Recipe AI</span>
        </h1>
        <p className="description">
          Simply type a few ingredients using the format ingredient1, ingredient2, etc., and Recipe AI
          will generate an all-new recipe on demand...
        </p>
      </div>
      
      <div className="form-container">
        <div className="search-container">
          <input
            type="text"
            className="wide-input"
            placeholder="Chicken, white rice, yellow squash, onion"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
          <button 
            className="search-button" 
            onClick={handleGenerateRecipe}
            disabled={loading || !ingredients.trim()}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      {(loading || recipe) && (
        <div className="result-container">
          {loading && (
            <div className="loader-container">
              <p>Generating your recipe...</p>
            </div>
          )}
          {recipe && (
            <div className="result">
              {recipe}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;