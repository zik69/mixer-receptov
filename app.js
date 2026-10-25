/* ==========================================================
   Миксер рецептов — логика
   Каталог берётся из recipes.js (28 рецептов).
   Меню на день: 2 завтрака + 2 обеда + 2 ужина.
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   Настройки
   ---------------------------------------------------------- */

const STORAGE_KEY = "mixer-state-v1";
const HISTORY_DAYS = 7;      // сколько дней истории держим
const MAX_AVOID_DAYS = 3;    // не повторять рецепты из последних N дней

const CATEGORIES = [
  { key: "завтрак", target: "breakfast-cards" },
  { key: "обед",    target: "lunch-cards" },
  { key: "ужин",    target: "dinner-cards" }
];

const CATEGORY_LABEL = { завтрак: "Завтрак", обед: "Обед", ужин: "Ужин" };

/* ----------------------------------------------------------
   Состояние
   ---------------------------------------------------------- */

const state = {
  version: 1,
  today: null,        // 'YYYY-MM-DD'
  current: [],        // id рецептов на сегодня
  history: [],        // [{ date, ids }] — новые сверху
  repeats: [],        // id рецептов, которые пришлось повторить
  favorites: [],      // id любимых
  excluded: [],       // названия исключённых продуктов
  checked: [],        // id рецептов «Добавлю в покупки»
  bought: [],         // ключи купленных продуктов
  perCategory: 2      // сколько рецептов в каждой категории
};

const expanded = new Set();  // id рецептов с раскрытыми шагами (не сохраняем)

/* ----------------------------------------------------------
   Помощники
   ---------------------------------------------------------- */

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** «4» + «шт» → «4 шт», «по вкусу» + «» → «по вкусу» */
function amountText(ingredient) {
  const amount = String(ingredient.amount).trim();
  const unit = String(ingredient.unit || "").trim();
  if (!amount) return unit;
  if (!unit) return amount;
  return amount + " " + unit;
}

function todayKey() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}

function norm(text) {
  return String(text).toLowerCase().replace(/ё/g, "е").trim();
}

/* ----------------------------------------------------------
   Каталог
   ---------------------------------------------------------- */

const RECIPE_INDEX = new Map();

function catalog() {
  return typeof RECIPES === "undefined" ? [] : RECIPES;
}

function buildIndex() {
  RECIPE_INDEX.clear();
  catalog().forEach((recipe) => RECIPE_INDEX.set(recipe.id, recipe));
}

function getRecipe(id) {
  return RECIPE_INDEX.get(id) || null;
}

function isAllowed(recipe) {
  if (!state.excluded.length) return true;
  const banned = state.excluded.map(norm);
  return !recipe.ingredients.some((ing) => banned.includes(norm(ing.name)));
}

function recipePool(category) {
  return catalog().filter((r) => r.category === category && isAllowed(r));
}

/* ----------------------------------------------------------
   Выбор рецептов
   ---------------------------------------------------------- */

/** id рецептов, которые показывали за последние `days` дней (без сегодняшнего) */
function recentIds(days) {
  const set = new Set();
  const past = state.history.filter((h) => h.date !== state.today).slice(0, days);
  past.forEach((day) => day.ids.forEach((id) => set.add(id)));
  return set;
}

/**
 * Сколько дней назад стоит избегать повторов.
 * Берём максимум, при котором в категории остаётся достаточно свежих рецептов.
 * Учитываем также текущий набор (его тоже не хотим повторять при «Мешать»).
 */
function avoidDaysFor(category, count, extraAvoid) {
  const pool = recipePool(category);
  const extra = extraAvoid || new Set();
  for (let days = MAX_AVOID_DAYS; days >= 1; days--) {
    const recent = recentIds(days);
    const excluded = new Set([...recent, ...extra]);
    if (pool.filter((r) => !excluded.has(r.id)).length >= count) return days;
  }
  return 0;
}

/** Взвешенная выборка без повторов: любимые весят больше */
function weightOf(recipe) {
  return state.favorites.includes(recipe.id) ? 3 : 1;
}

function takeWeighted(list, count) {
  const pool = list.map((recipe) => ({ recipe, weight: weightOf(recipe) }));
  const out = [];
  while (out.length < count && pool.length) {
    const total = pool.reduce((sum, item) => sum + item.weight, 0);
    let point = Math.random() * total;
    let index = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      point -= pool[i].weight;
      if (point <= 0) { index = i; break; }
    }
    out.push(pool[index].recipe);
    pool.splice(index, 1);
  }
  return out;
}

/** 2 рецепта из категории: сначала свежие, потом — с повтором */
function pickForCategory(category, count, extraAvoid) {
  const pool = recipePool(category);
  const days = avoidDaysFor(category, count, extraAvoid);
  const recent = days > 0 ? recentIds(days) : new Set();
  const excluded = new Set([...recent, ...(extraAvoid || [])]);

  const fresh = [];
  const stale = [];
  for (const recipe of pool) {
    (excluded.has(recipe.id) ? stale : fresh).push(recipe);
  }

  const picked = takeWeighted(fresh, Math.min(count, fresh.length));
  const repeats = [];

  if (picked.length < count) {
    const extra = takeWeighted(stale, count - picked.length);
    extra.forEach((recipe) => {
      picked.push(recipe);
      repeats.push(recipe);
    });
  }

  return { recipes: picked, repeats };
}

function rememberToday(ids) {
  state.history = state.history.filter((h) => h.date !== state.today);
  state.history.unshift({ date: state.today, ids: ids.slice() });
  state.history = state.history.slice(0, HISTORY_DAYS);
}

function generateMenu(excludeCurrent) {
  state.today = todayKey();

  const extraAvoid = excludeCurrent ? new Set(state.current) : new Set();

  const picked = [];
  const repeats = [];

  for (const cat of CATEGORIES) {
    const result = pickForCategory(cat.key, state.perCategory, extraAvoid);
    result.recipes.forEach((recipe) => picked.push(recipe));
    result.repeats.forEach((recipe) => repeats.push(recipe));
  }

  state.current = picked.map((recipe) => recipe.id);
  state.repeats = repeats.map((recipe) => recipe.id);
  rememberToday(state.current);

  // отметки рецептов, которых больше нет в меню, убираем
  state.checked = state.checked.filter((id) => state.current.includes(id));

  saveState();
  render();
}

/* ----------------------------------------------------------
   Сохранение в браузере
   ---------------------------------------------------------- */

let saveTimer = null;

function saveState() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      /* хранилище может быть недоступно — работаем без него */
    }
  }, 250);
}

function isIntArray(value) {
  return Array.isArray(value) && value.every(Number.isInteger);
}

function loadState() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return;
  }
  if (!raw) return;

  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    return;
  }
  if (!data || data.version !== 1) return;

  if (typeof data.today === "string") state.today = data.today;
  if (isIntArray(data.current)) state.current = data.current;
  if (isIntArray(data.repeats)) state.repeats = data.repeats;
  if (isIntArray(data.favorites)) state.favorites = data.favorites;
  if (isIntArray(data.checked)) state.checked = data.checked;
  if (Array.isArray(data.bought)) state.bought = data.bought.filter((x) => typeof x === "string");
  if (Array.isArray(data.excluded)) state.excluded = data.excluded.filter((x) => typeof x === "string");

  if (Array.isArray(data.history)) {
    state.history = data.history
      .filter((day) => day && typeof day.date === "string" && isIntArray(day.ids))
      .slice(0, HISTORY_DAYS);
  }

  if (data.perCategory === 2 || data.perCategory === 3) state.perCategory = data.perCategory;
}

/* ----------------------------------------------------------
   Карточка рецепта
   ---------------------------------------------------------- */

function renderCard(recipe) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.id = recipe.id;

  const badgeClass =
    recipe.category === "завтрак" ? "badge--breakfast"
    : recipe.category === "обед"   ? "badge--lunch"
    : "badge--dinner";

  const ingredients = recipe.ingredients
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
      <span class="card__meta-text">${esc(recipe.time)} мин · ${esc(recipe.servings)} порции</span>
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

  if (expanded.has(recipe.id)) toggleBtn.textContent = "Свернуть";

  if (state.checked.includes(recipe.id)) {
    checkbox.checked = true;
    card.querySelector(".check").classList.add("check--done");
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
      card.querySelector(".check").classList.add("check--done");
    } else {
      state.checked = state.checked.filter((id) => id !== recipe.id);
      card.querySelector(".check").classList.remove("check--done");
    }
    saveState();
    renderShoppingList();
  });

  return card;
}

/* ----------------------------------------------------------
   Отрисовка
   ---------------------------------------------------------- */

function render() {
  for (const cat of CATEGORIES) {
    const box = document.getElementById(cat.target);
    box.innerHTML = "";

    const items = state.current
      .map(getRecipe)
      .filter((recipe) => recipe && recipe.category === cat.key);

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
  const repeats = state.repeats.map(getRecipe).filter(Boolean);

  if (!repeats.length) {
    el.hidden = true;
    el.textContent = "";
    return;
  }

  el.textContent = "Мало новых рецептов — пришлось повторить: " +
    repeats.map((r) => r.title).join(", ");
  el.hidden = false;
}

/* ----------------------------------------------------------
   Список покупок
   Пока простой: каждый ингредиент отдельной строкой.
   Сведение и группировка — Task-005.
   ---------------------------------------------------------- */

function renderShoppingList() {
  const list = document.getElementById("shopping-list");
  const empty = document.getElementById("shopping-empty");
  list.innerHTML = "";

  const chosen = state.current
    .map(getRecipe)
    .filter((recipe) => recipe && state.checked.includes(recipe.id));

  let count = 0;

  for (const recipe of chosen) {
    recipe.ingredients.forEach((ing, index) => {
      const key = recipe.id + ":" + index;
      const li = document.createElement("li");
      li.innerHTML = `
        <input type="checkbox" id="buy-${key}" data-key="${key}">
        <label for="buy-${key}">${esc(ing.name)}</label>
        <span class="ingredients__amount">${esc(amountText(ing))}</span>
      `;
      const box = li.querySelector("input");
      const label = li.querySelector("label");

      if (state.bought.includes(key)) {
        box.checked = true;
        li.classList.add("is-bought");
      }

      box.addEventListener("change", () => {
        if (box.checked) {
          if (!state.bought.includes(key)) state.bought.push(key);
          li.classList.add("is-bought");
        } else {
          state.bought = state.bought.filter((k) => k !== key);
          li.classList.remove("is-bought");
        }
        saveState();
      });

      list.appendChild(li);
      count++;
    });
  }

  empty.hidden = count > 0;
  list.hidden = count === 0;
}

/* ----------------------------------------------------------
   Кнопки
   ---------------------------------------------------------- */

function updateCountToggle() {
  document.querySelectorAll(".count-toggle__btn").forEach((btn) => {
    const active = Number(btn.dataset.count) === state.perCategory;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function initButtons() {
  document.getElementById("mix-btn").addEventListener("click", () => generateMenu(true));

  document.querySelectorAll(".count-toggle__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = Number(btn.dataset.count);
      if (value === state.perCategory) return;
      state.perCategory = value;
      updateCountToggle();
      generateMenu(true);
    });
  });

  document.getElementById("clear-btn").addEventListener("click", () => {
    state.bought = [];
    saveState();
    renderShoppingList();
  });
}

/* ----------------------------------------------------------
   Старт
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
  initButtons();

  const validCurrent = state.current.filter((id) => getRecipe(id));
  const dayChanged = state.today !== todayKey();

  if (dayChanged || validCurrent.length === 0) {
    generateMenu();
  } else {
    state.current = validCurrent;
    state.checked = state.checked.filter((id) => state.current.includes(id));
    render();
  }
}

document.addEventListener("DOMContentLoaded", init);
