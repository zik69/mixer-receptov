/* ==========================================================
   Миксер рецептов — экран «Все рецепты»
   Поиск, фильтр по категории и «что есть дома».
   Здесь же — исключённые продукты.
   ========================================================== */

"use strict";

let allRecipesCat = "all";   // текущий фильтр по категории
let allRecipesCuisine = "all"; // текущий фильтр по кухне
let allRecipesQuery = "";    // текущий поисковый запрос
let homeMode = "strict";     // режим фильтра «что есть дома»

/* ----------------------------------------------------------
   Исключённые продукты
   ---------------------------------------------------------- */

function populateIngredientsDatalist() {
  const dl = document.getElementById("ingredients-list");
  if (!dl) return;
  dl.innerHTML = "";

  const db = ingredientsDb();
  if (!db) return;

  const names = new Set(db.ingredients.map((item) => item.name));
  names.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    dl.appendChild(opt);
  });
}

function renderExcluded() {
  const list = document.getElementById("excluded-list");
  if (!list) return;
  list.innerHTML = "";

  state.excluded.forEach((name) => {
    const li = document.createElement("li");
    li.className = "excluded__chip";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "×";
    btn.setAttribute("aria-label", "Убрать " + name);
    btn.addEventListener("click", () => {
      state.excluded = state.excluded.filter((x) => norm(x) !== norm(name));
      saveState();
      renderExcluded();
    });

    li.textContent = name + " ";
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function addExcludedIngredient() {
  const input = document.getElementById("excluded-input");
  if (!input) return;

  const raw = String(input.value || "").trim();
  if (!raw) return;

  const name = canonicalName(raw);
  if (!state.excluded.some((x) => norm(x) === norm(name))) {
    state.excluded.push(name);
    saveState();
    renderExcluded();
    generateMenu(true);
  }
  input.value = "";
}

/* ----------------------------------------------------------
   «Что есть дома»
   ---------------------------------------------------------- */

function renderHomeChips() {
  const box = document.getElementById("home-chips");
  if (!box) return;
  box.innerHTML = "";

  state.homeIngredients.forEach((name) => {
    const chip = document.createElement("span");
    chip.className = "excluded__chip";
    chip.textContent = name + " ";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "×";
    btn.addEventListener("click", () => {
      state.homeIngredients = state.homeIngredients.filter((x) => norm(x) !== norm(name));
      saveState();
      renderHomeChips();
      renderAllRecipes();
    });

    chip.appendChild(btn);
    box.appendChild(chip);
  });
}

function addHomeIngredient() {
  const input = document.getElementById("home-input");
  if (!input) return;

  const raw = String(input.value || "").trim();
  if (!raw) return;

  const name = canonicalName(raw);
  if (!state.homeIngredients.some((x) => norm(x) === norm(name))) {
    state.homeIngredients.push(name);
    saveState();
    renderHomeChips();
    renderAllRecipes();
  }
  input.value = "";
}

function clearHomeIngredients() {
  state.homeIngredients = [];
  saveState();
  renderHomeChips();
  renderAllRecipes();
}

function homeMatch(recipe) {
  if (!state.homeIngredients.length) return { ok: true, pct: 1 };

  const have = new Set(state.homeIngredients.map(norm));
  const ings = recipe.ingredients.map((ing) => norm(ing.name));
  const present = ings.filter((n) => have.has(n)).length;
  const pct = ings.length ? present / ings.length : 1;

  if (homeMode === "strict") {
    return { ok: present === ings.length, pct };
  }
  return { ok: true, pct };
}

/* ----------------------------------------------------------
   Список всех рецептов
   ---------------------------------------------------------- */

function renderAllRecipes() {
  const container = document.getElementById("all-recipes-cards");
  if (!container) return;
  container.innerHTML = "";

  const query = allRecipesQuery.trim().toLowerCase();
  const cat = allRecipesCat;

  const filtered = catalog().filter((recipe) => {
    if (cat !== "all" && recipe.category !== cat) return false;
    if (allRecipesCuisine !== "all" && recipe.cuisine !== allRecipesCuisine) return false;
    if (query && !recipe.title.toLowerCase().includes(query)) return false;
    if (state.homeIngredients.length) {
      const m = homeMatch(recipe);
      if (homeMode === "strict" && !m.ok) return false;
    }
    return true;
  });

  // В мягком режиме сортируем по совпадению (больше — выше)
  if (state.homeIngredients.length && homeMode === "soft") {
    filtered.sort((a, b) => homeMatch(b).pct - homeMatch(a).pct);
  }

  // Выбранные рецепты — в отдельный раздел «Выбранное»
  const selectedEl = document.getElementById("selected-all-cards");
  const selectedSection = document.getElementById("selected-all-section");
  const selected = filtered.filter((r) => state.checked.includes(r.id));

  if (selectedEl && selectedSection) {
    selectedEl.innerHTML = "";
    selectedSection.hidden = selected.length === 0;
    selected.forEach((r) => selectedEl.appendChild(renderCard(r)));
  }

  const nonSelected = filtered.filter((r) => !state.checked.includes(r.id));

  if (nonSelected.length === 0 && selected.length === 0) {
    container.innerHTML = '<p class="cards-empty">Ничего не найдено.</p>';
    return;
  }

  nonSelected.forEach((recipe) => container.appendChild(renderCard(recipe)));
}

function initAllRecipesScreen() {
  const btn = document.getElementById("all-recipes-btn");
  const screen = document.getElementById("all-recipes-screen");
  const backBtn = document.getElementById("all-recipes-back");
  const searchInput = document.getElementById("recipe-search");
  const catButtons = document.querySelectorAll(".all-recipes-screen__cat[data-cat]");
  const cuisineButtons = document.querySelectorAll(".all-recipes-screen__cat[data-cuisine]");

  if (!btn || !screen) return;

  btn.addEventListener("click", () => {
    screen.hidden = false;
    document.body.style.overflow = "hidden";
    allRecipesCat = "all";
    allRecipesCuisine = "all";
    allRecipesQuery = "";
    if (searchInput) searchInput.value = "";
    catButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.cat === "all"));
    cuisineButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.cuisine === "all"));
    renderAllRecipes();
    renderShoppingList();
    renderHomeChips();
  });

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      screen.hidden = true;
      document.body.style.overflow = "";
    });
  }

  const scrollCartBtn = document.getElementById("scroll-to-cart-btn");
  if (scrollCartBtn) {
    scrollCartBtn.addEventListener("click", () => {
      const sec = document.querySelector(".shopping--in-all");
      if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const lentaAllBtn = document.getElementById("lenta-update-btn-all");
  if (lentaAllBtn) lentaAllBtn.addEventListener("click", () => { updateLentaPrices(); });
  const cheapestAllBtn = document.getElementById("lenta-cheapest-btn-all");
  if (cheapestAllBtn) cheapestAllBtn.addEventListener("click", () => { applyLentaSort("cheapest"); });
  const priciestAllBtn = document.getElementById("lenta-priciest-btn-all");
  if (priciestAllBtn) priciestAllBtn.addEventListener("click", () => { applyLentaSort("priciest"); });
  const discountAllBtn = document.getElementById("lenta-discount-btn-all");
  if (discountAllBtn) discountAllBtn.addEventListener("click", () => { applyLentaSort("discount"); });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      allRecipesQuery = searchInput.value;
      renderAllRecipes();
    });
  }

  const homeToggle = document.getElementById("home-toggle");
  const homePanel = document.getElementById("home-panel");
  if (homeToggle && homePanel) {
    homeToggle.addEventListener("click", () => {
      homePanel.hidden = !homePanel.hidden;
      homeToggle.textContent = homePanel.hidden ? "Что есть дома ▾" : "Что есть дома ▴";
    });
  }

  const homeAdd = document.getElementById("home-add");
  if (homeAdd) homeAdd.addEventListener("click", addHomeIngredient);

  const homeInput = document.getElementById("home-input");
  if (homeInput) {
    homeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); addHomeIngredient(); }
    });
  }

  const homeClear = document.getElementById("home-clear");
  if (homeClear) homeClear.addEventListener("click", clearHomeIngredients);

  document.querySelectorAll('input[name="home-mode"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      homeMode = radio.value;
      renderAllRecipes();
    });
  });

  catButtons.forEach((catBtn) => {
    catBtn.addEventListener("click", () => {
      allRecipesCat = catBtn.dataset.cat;
      catButtons.forEach((b) => b.classList.toggle("is-active", b === catBtn));
      renderAllRecipes();
    });
  });

  cuisineButtons.forEach((cuisineBtn) => {
    cuisineBtn.addEventListener("click", () => {
      allRecipesCuisine = cuisineBtn.dataset.cuisine;
      cuisineButtons.forEach((b) => b.classList.toggle("is-active", b === cuisineBtn));
      renderAllRecipes();
    });
  });
}
