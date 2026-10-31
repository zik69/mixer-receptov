/* ==========================================================
   Миксер рецептов — каталог и выбор меню
   Какие рецепты есть, какие можно брать и как собирается
   набор на день: 2 завтрака + 2 обеда + 2 ужина.
   ========================================================== */

"use strict";

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

/** id → рецепты, без «пустых» записей */
function recipesById(ids) {
  return ids.map(getRecipe).filter(Boolean);
}

function isAllowed(recipe) {
  if (!state.excluded.length) return true;
  const banned = state.excluded.map(norm);
  return !recipe.ingredients.some((ing) => banned.includes(norm(ing.name)));
}

function recipePool(category) {
  return catalog().filter((r) => r.category === category && r.cuisine === state.cuisine && isAllowed(r));
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

  // отметки рецептов, которых больше нет в каталоге, убираем
  state.checked = state.checked.filter((id) => getRecipe(id));

  saveState();
  render();
}

/* ----------------------------------------------------------
   Переключатели «сколько» и «какая кухня»
   ---------------------------------------------------------- */

function updateCountToggle() {
  document.querySelectorAll(".count-toggle__btn").forEach((btn) => {
    const active = Number(btn.dataset.count) === state.perCategory;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function updateCuisineToggle() {
  document.querySelectorAll(".cuisine-toggle__btn").forEach((btn) => {
    const active = btn.dataset.cuisine === state.cuisine;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function setCuisine(value) {
  if (!CUISINES.includes(value)) return;
  if (value === state.cuisine) return;
  state.cuisine = value;
  // сброс истории при смене кухни
  state.history = [];
  state.current = [];
  state.repeats = [];
  state.checked = [];
  state.today = null;
  saveState();
  updateCuisineToggle();
  generateMenu();
}
