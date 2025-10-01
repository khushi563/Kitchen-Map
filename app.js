const recipeList = document.getElementById("recipeList");
const searchInput = document.getElementById("searchInput");
const loading = document.getElementById("loading");
const modal = document.getElementById("recipeModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const favoriteList = document.getElementById("favoriteList");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Display recipes
function displayRecipes(recipes) {
  recipeList.innerHTML = "";
  if (!recipes) {
    recipeList.innerHTML = "<p style='text-align:center;'>No recipes found 😢</p>";
    return;
  }
  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.classList.add("recipe-card");
    card.innerHTML = `
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
      <div class="recipe-info">
        <h3>${recipe.strMeal}</h3>
        <p>${recipe.strInstructions.substring(0, 100)}...</p>
      </div>
    `;
    card.addEventListener("click", () => showRecipeDetails(recipe));
    recipeList.appendChild(card);
  });
}

// Fetch recipes
async function fetchRecipes(query) {
  loading.textContent = "🔎 Searching recipes...";
  recipeList.innerHTML = "";
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
    );
    const data = await response.json();
    displayRecipes(data.meals);
  } catch (error) {
    recipeList.innerHTML =
      "<p style='text-align:center;'>Error loading recipes ⚠️</p>";
  }
  loading.textContent = "";
}

// Show details
function showRecipeDetails(recipe) {
  let ingredients = "";
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      ingredients += `<li>${ingredient} - ${measure}</li>`;
    }
  }

  const isFavorite = favorites.some((fav) => fav.id === recipe.idMeal.toString());

  modalBody.innerHTML = `
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
    <h2>${recipe.strMeal}</h2>
    ${
      isFavorite
        ? `<button class="remove-btn" onclick="removeFromFavorites('${recipe.idMeal}', true)">❌ Remove from Favorites</button>`
        : `<button class="save-btn" onclick="saveToFavorites('${recipe.idMeal}', '${recipe.strMeal}', '${recipe.strMealThumb}')">❤️ Save to Favorites</button>`
    }
    <h3>Ingredients:</h3>
    <ul>${ingredients}</ul>
    <h3>Instructions:</h3>
    <p>${recipe.strInstructions}</p>
    ${
      recipe.strYoutube
        ? `<p><a href="${recipe.strYoutube}" target="_blank">▶ Watch on YouTube</a></p>`
        : ""
    }
  `;
  modal.style.display = "flex";
}

// Save to favorites
function saveToFavorites(id, name, img) {
  if (!favorites.some((fav) => fav.id === id)) {
    favorites.push({ id, name, img });
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayFavorites();
    alert("✅ Recipe saved to favorites!");
  }
}

// Remove from favorites
function removeFromFavorites(id, closeModalAfter = false) {
  favorites = favorites.filter((fav) => fav.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites();
  if (closeModalAfter) modal.style.display = "none";
}

// Clear all favorites
function clearFavorites() {
  if (confirm("Are you sure you want to clear all favorites?")) {
    favorites = [];
    localStorage.removeItem("favorites");
    displayFavorites();
  }
}

// Display favorites
function displayFavorites() {
  favoriteList.innerHTML = "";
  if (favorites.length === 0) {
    favoriteList.innerHTML =
      "<p style='text-align:center;'>No favorite recipes yet ❤️</p>";
    return;
  }
  favorites.forEach((fav) => {
    const card = document.createElement("div");
    card.classList.add("recipe-card");
    card.innerHTML = `
      <img src="${fav.img}" alt="${fav.name}">
      <div class="recipe-info">
        <h3>${fav.name}</h3>
      </div>
      <button class="remove-btn-small" onclick="removeFromFavorites('${fav.id}')">❌</button>
    `;
    favoriteList.appendChild(card);
  });
}

// Close modal
closeModal.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// Mobile navbar toggle
const mobileMenu = document.getElementById("mobile-menu");
const navLinks = document.querySelector(".nav-links");
mobileMenu.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Initial load
fetchRecipes("chicken");
displayFavorites();

// Search functionality
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (query.length > 0) {
    fetchRecipes(query);
  } else {
    recipeList.innerHTML =
      "<p style='text-align:center;'>Start typing to search for recipes 🍳</p>";
  }
});

// Search on Enter key
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    fetchRecipes(searchInput.value.trim());
  }
});
