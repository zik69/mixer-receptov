/* ==========================================================
   Миксер рецептов — карточка рецепта и главный экран
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   Карточка рецепта
   ---------------------------------------------------------- */

/**
 * Ингредиенты рецепта в количестве на 2 человек.
 * В каталоге рецепты бывают на 3–6 порций, а готовим мы всегда на 2.
 */
function ingredientsForCard(recipe) {
  const factor = TARGET_SERVINGS / (recipe.servings || TARGET_SERVINGS);
  return recipe.ingredients.map((ing) => ({
    name: ing.name,
    unit: ing.unit,
    amount: amountForServings(ing.amount, factor, ing.unit)
  }));
}

function renderCard(recipe) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.id = recipe.id;

  const badgeClass = CATEGORY_BADGE[recipe.category] || "badge--dinner";

  const ingredients = ingredientsForCard(recipe)
    .map((ing) => `
        <li>
          <span class="ingredients__name">${esc(ing.name)}</span>
          <span class="ingredients__amount">${esc(amountText(ing))}</span>
        </li>`)
    .join("");

  const steps = recipe.steps
    .map((step) => `<li>${esc(step)}</li>`)
    .join("");

  const stepsHidden = expanded.has(recipe.id) ? "" : " hidden";

  card.innerHTML = `
    <div class="card__meta">
      <span class="badge ${badgeClass}">${esc(CATEGORY_LABEL[recipe.category] || recipe.category)}</span>
      <span class="card__meta-text">${esc(recipe.time)} мин · на ${TARGET_SERVINGS} человек</span>
    </div>

    <h3 class="card__title">${esc(recipe.title)}</h3>

    <div class="card__body">
      <p class="card__label">Ингредиенты</p>
      <ul class="ingredients">${ingredients}</ul>
    </div>

    <div class="steps-wrap" data-steps ${stepsHidden}>
      <p class="card__label">Как готовить</p>
      <ol class="card__steps">${steps}</ol>
    </div>

    <div class="card__actions">
      <button type="button" class="btn btn--toggle" data-action="toggle">Показать рецепт</button>
    </div>

    <label class="check">
      <input type="checkbox" data-action="add-to-shopping">
      <span class="check__text">Добавлю в покупки</span>
    </label>
  `;

  const toggleBtn = card.querySelector('[data-action="toggle"]');
  const stepsBox = card.querySelector("[data-steps]");
  const checkbox = card.querySelector('[data-action="add-to-shopping"]');
  const check = card.querySelector(".check");

  if (expanded.has(recipe.id)) toggleBtn.textContent = "Свернуть";

  if (state.checked.includes(recipe.id)) {
    checkbox.checked = true;
    check.classList.add("check--done");
  }

  toggleBtn.addEventListener("click", () => {
    const isOpen = !stepsBox.hasAttribute("hidden");
    if (isOpen) {
      stepsBox.setAttribute("hidden", "");
      toggleBtn.textContent = "Показать рецепт";
      expanded.delete(recipe.id);
    } else {
      stepsBox.removeAttribute("hidden");
      toggleBtn.textContent = "Свернуть";
      expanded.add(recipe.id);
    }
  });

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      if (!state.checked.includes(recipe.id)) state.checked.push(recipe.id);
      check.classList.add("check--done");
    } else {
      state.checked = state.checked.filter((id) => id !== recipe.id);
      check.classList.remove("check--done");
    }
    saveState();
    // перерисовываем, чтобы выбранные карточки ушли вниз
    render();
  });

  return card;
}

/* ----------------------------------------------------------
   Главный экран
   ---------------------------------------------------------- */

/** Отмеченные рецепты уезжают в отдельный раздел «Выбранное» */
function renderSelected() {
  const box = document.getElementById("selected-cards");
  if (!box) return;

  const section = box.parentElement;
  box.innerHTML = "";

  const selected = state.current
    .map(getRecipe)
    .filter((recipe) => recipe && state.checked.includes(recipe.id));

  selected.forEach((recipe) => box.appendChild(renderCard(recipe)));
  if (section) section.hidden = selected.length === 0;
}

function render() {
  renderSelected();

  for (const cat of CATEGORIES) {
    const box = document.getElementById(cat.target);
    if (!box) continue;
    box.innerHTML = "";

    // Выбранные рецепты убираем из категорий (они в разделе «Выбранное»)
    const items = state.current
      .map(getRecipe)
      .filter((recipe) => recipe && recipe.category === cat.key && !state.checked.includes(recipe.id));

    if (!items.length) {
      const note = document.createElement("p");
      note.className = "cards-empty";
      note.textContent = "Нет подходящих рецептов";
      box.appendChild(note);
      continue;
    }

    for (const recipe of items) box.appendChild(renderCard(recipe));
  }

  renderShoppingList();
  updateHint();
  renderWarning();
}

function updateHint() {
  const n = state.perCategory;
  document.getElementById("mix-hint").textContent =
    n + " завтрака · " + n + " обеда · " + n + " ужина";
}

function renderWarning() {
  const el = document.getElementById("mix-warn");
  const repeats = recipesById(state.repeats);

  if (!repeats.length) {
    el.hidden = true;
    el.textContent = "";
    return;
  }

  el.textContent = "Мало новых рецептов — пришлось повторить: " +
    repeats.map((r) => r.title).join(", ");
  el.hidden = false;
}
