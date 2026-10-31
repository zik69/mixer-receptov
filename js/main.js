/* ==========================================================
   Миксер рецептов — кнопки и запуск приложения
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   Кнопки
   ---------------------------------------------------------- */

function bindClick(id, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", handler);
}

function initButtons() {
  bindClick("mix-btn", () => generateMenu(true));

  document.querySelectorAll(".count-toggle__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = Number(btn.dataset.count);
      if (value === state.perCategory) return;
      state.perCategory = value;
      updateCountToggle();
      generateMenu(true);
    });
  });

  document.querySelectorAll(".cuisine-toggle__btn").forEach((btn) => {
    btn.addEventListener("click", () => setCuisine(btn.dataset.cuisine));
  });

  bindClick("excluded-add", addExcludedIngredient);

  const excludedInput = document.getElementById("excluded-input");
  if (excludedInput) {
    excludedInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addExcludedIngredient();
      }
    });
  }

  bindClick("clear-btn", () => {
    state.bought = [];
    saveState();
    renderShoppingList();
  });

  bindClick("lenta-update-btn", () => { updateLentaPrices(); });
  bindClick("lenta-cheapest-btn", () => { applyLentaSort("cheapest"); });
  bindClick("lenta-priciest-btn", () => { applyLentaSort("priciest"); });
  bindClick("lenta-discount-btn", () => { applyLentaSort("discount"); });

  bindClick("reset-btn", () => {
    const ok = window.confirm("Сбросить всё? Набор на сегодня, история, любимые и отметки будут удалены.");
    if (!ok) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      /* игнорируем — всё равно перезагружаем */
    }
    window.location.reload();
  });
}

/* ----------------------------------------------------------
   Запуск
   ---------------------------------------------------------- */

function showFatal(message) {
  const main = document.querySelector(".main");
  if (!main) return;
  main.innerHTML = '<p class="cards-empty">' + esc(message) + "</p>";
}

function init() {
  if (typeof RECIPES === "undefined") {
    showFatal("Не загрузился каталог рецептов. Проверьте, что рядом лежит recipes.js");
    return;
  }

  buildIndex();
  loadState();
  updateCountToggle();
  updateCuisineToggle();
  populateIngredientsDatalist();
  initButtons();
  initAllRecipesScreen();
  renderExcluded();

  const validCurrent = state.current.filter((id) => {
    const recipe = getRecipe(id);
    return recipe && recipe.cuisine === state.cuisine;
  });
  const dayChanged = state.today !== todayKey();

  if (dayChanged || validCurrent.length === 0) {
    generateMenu();
  } else {
    state.current = validCurrent;
    state.checked = state.checked.filter((id) => getRecipe(id));
    render();
  }
}

document.addEventListener("DOMContentLoaded", init);
