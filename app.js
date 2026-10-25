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
   Сводит одинаковые ингредиенты из разных рецептов в один пункт,
   складывает количества в правильных единицах, показывает,
   сколько пакетов брать в магазине.
   ---------------------------------------------------------- */

function findIngredient(rawName) {
  const db = typeof INGREDIENTS === "undefined" ? null : INGREDIENTS;
  if (!db) return null;
  const normalized = norm(rawName);
  let found = db.ingredients.find((i) => norm(i.name) === normalized);
  if (found) return found;
  found = db.ingredients.find((i) => i.aliases.some((a) => norm(a) === normalized));
  return found || null;
}

function scaleAmount(amount, factor) {
  const num = parseFloat(String(amount).replace(",", "."));
  if (isNaN(num)) return null;
  return num * factor;
}

function convertAmount(amount, fromUnit, toUnit, db) {
  const units = (typeof INGREDIENTS === "undefined" || !INGREDIENTS) ? {} : INGREDIENTS.units;
  const fromDef = units[fromUnit];
  const toDef = units[toUnit];
  if (!fromDef || !toDef) return null;
  if (fromDef.base === toDef.base) {
    return amount * fromDef.factor / toDef.factor;
  }
  // шт ↔ г через вес штуки
  if (db && db.gramsPerUnit) {
    if (fromUnit === "шт" && toDef.base === "г") {
      return (amount * db.gramsPerUnit) / toDef.factor;
    }
    if (toUnit === "шт" && fromDef.base === "г") {
      return (amount * fromDef.factor) / db.gramsPerUnit;
    }
  }
  return null;
}

function baseToHuman(amount, baseUnit) {
  if (baseUnit === "г") {
    if (amount >= 1000) {
      return { amount: Math.round((amount / 1000) * 10) / 10, unit: "кг" };
    }
    return { amount: Math.round(amount), unit: "г" };
  }
  if (baseUnit === "мл") {
    if (amount >= 1000) {
      return { amount: Math.round((amount / 1000) * 10) / 10, unit: "л" };
    }
    return { amount: Math.round(amount), unit: "мл" };
  }
  return { amount: Math.max(1, Math.round(amount)), unit: baseUnit };
}

function pluralizePack(unit, n) {
  const forms = {
    "упаковка": ["упаковка", "упаковки", "упаковок"],
    "десяток":  ["десяток", "десятка", "десятков"],
    "бутылка":  ["бутылка", "бутылки", "бутылок"],
    "банка":    ["банка", "банки", "банок"],
  };
  const f = forms[unit];
  if (!f) return unit;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return f[2];
  if (mod10 === 1) return f[0];
  if (mod10 >= 2 && mod10 <= 4) return f[1];
  return f[2];
}

function mergeIngredients(checkedRecipes) {
  const map = new Map();

  for (const recipe of checkedRecipes) {
    const scale = 2 / (recipe.servings || 2);
    for (const ing of recipe.ingredients) {
      const db = findIngredient(ing.name);
      const key = db ? "id:" + db.id : "unknown:" + norm(ing.name);
      if (!map.has(key)) {
        map.set(key, {
          db,
          name: db ? db.name : ing.name,
          category: db ? db.category : "Прочее",
          convertible: [],
          textLines: [],
        });
      }
      const entry = map.get(key);

      const amount = String(ing.amount).trim();
      const unit = String(ing.unit || "").trim();
      const scaled = scaleAmount(amount, scale);
      const units = (typeof INGREDIENTS === "undefined" || !INGREDIENTS) ? {} : INGREDIENTS.units;
      const unitDef = units[unit];

      if (scaled === null || !unitDef) {
        entry.textLines.push((scaled === null ? amount : scaled) + (unit ? " " + unit : ""));
      } else {
        entry.convertible.push({ amount: scaled, unit });
      }
    }
  }

  // Решаем базовую единицу и складываем
  for (const entry of map.values()) {
    if (!entry.convertible.length) {
      entry.hasConvertible = false;
      entry.baseTotal = 0;
      entry.baseUnit = null;
      continue;
    }
    const units = (typeof INGREDIENTS === "undefined" || !INGREDIENTS) ? {} : INGREDIENTS.units;

    const hasGrams = entry.convertible.some((c) => units[c.unit].base === "г") ||
      (entry.db && entry.db.gramsPerUnit && entry.convertible.some((c) => c.unit === "шт"));
    const hasMl = entry.convertible.some((c) => units[c.unit].base === "мл");

    let baseUnit;
    if (hasGrams && entry.db && entry.db.gramsPerUnit) baseUnit = "г";
    else if (hasGrams && entry.convertible.some((c) => units[c.unit].base === "г")) baseUnit = "г";
    else if (hasMl) baseUnit = "мл";
    else baseUnit = units[entry.convertible[0].unit].base;

    let total = 0;
    let ok = true;
    for (const c of entry.convertible) {
      const converted = convertAmount(c.amount, c.unit, baseUnit, entry.db);
      if (converted === null) { ok = false; break; }
      total += converted;
    }

    if (!ok) {
      entry.convertible.forEach((c) => entry.textLines.push(c.amount + " " + c.unit));
      entry.convertible = [];
      entry.hasConvertible = false;
      entry.baseTotal = 0;
      entry.baseUnit = null;
    } else {
      entry.hasConvertible = true;
      entry.baseTotal = total;
      entry.baseUnit = baseUnit;
    }
  }

  return map;
}

function renderShoppingItem(entry) {
  const li = document.createElement("li");
  const key = entry.db ? "id:" + entry.db.id : "unknown:" + norm(entry.name);

  // Количество в «натуральной» единице: для продуктов с весом штуки
  // (яйца, лук) показываем штуки, а не граммы.
  let naturalAmount = entry.baseTotal;
  let naturalUnit = entry.baseUnit;
  if (entry.db && entry.db.gramsPerUnit && entry.baseUnit === "г") {
    naturalAmount = entry.baseTotal / entry.db.gramsPerUnit;
    naturalUnit = "шт";
  }

  let amountStr = "";
  if (entry.hasConvertible) {
    const human = baseToHuman(naturalAmount, naturalUnit);
    amountStr = human.amount + " " + human.unit;
  }

  // Текстовые количества (без дублей)
  const uniqueText = [...new Set(entry.textLines)];
  const amountDisplay = [amountStr, ...uniqueText].filter(Boolean).join("; ") || "—";

  // Сколько пакетов брать
  let packStr = "";
  if (entry.db && entry.db.pack && entry.hasConvertible) {
    const packs = Math.ceil(naturalAmount / entry.db.pack.size);
    if (packs >= 1) {
      const plural = pluralizePack(entry.db.pack.unit, packs);
      const packHuman = baseToHuman(entry.db.pack.size, naturalUnit);
      packStr = packs + " " + plural + " по " + packHuman.amount + " " + packHuman.unit;
    }
  }

  li.innerHTML = `
    <input type="checkbox" id="buy-${key}" data-key="${key}">
    <label for="buy-${key}">${esc(entry.name)}</label>
    <div class="shopping__right">
      <span class="ingredients__amount">${esc(amountDisplay)}</span>
      ${packStr ? `<span class="shopping__pack">${esc(packStr)}</span>` : ""}
    </div>
  `;

  const box = li.querySelector("input");
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

  return li;
}

function renderShoppingList() {
  const list = document.getElementById("shopping-list");
  const empty = document.getElementById("shopping-empty");
  list.innerHTML = "";

  const chosen = state.current
    .map(getRecipe)
    .filter((recipe) => recipe && state.checked.includes(recipe.id));

  const merged = mergeIngredients(chosen);

  const pantryItems = [];
  const normalItems = [];
  const unknownItems = [];

  for (const entry of merged.values()) {
    if (entry.db && entry.db.pantry) pantryItems.push(entry);
    else if (!entry.db) unknownItems.push(entry);
    else normalItems.push(entry);
  }

  const sortByName = (a, b) => a.name.localeCompare(b.name, "ru");
  normalItems.sort(sortByName);
  unknownItems.sort(sortByName);

  // Группируем обычные по категории
  const groups = new Map();
  for (const entry of normalItems) {
    if (!groups.has(entry.category)) groups.set(entry.category, []);
    groups.get(entry.category).push(entry);
  }

  let count = 0;

  // 1. Блок «Уже есть дома» — сверху, мелким шрифтом
  if (pantryItems.length) {
    const li = document.createElement("li");
    li.className = "shopping__pantry";
    li.innerHTML =
      '<span class="shopping__pantry-label">Уже есть дома:</span> ' +
      pantryItems.map((e) => esc(e.name)).join(", ");
    list.appendChild(li);
  }

  // 2. Группы по категориям
  for (const [cat, items] of groups) {
    const header = document.createElement("li");
    header.className = "shopping__group";
    header.textContent = cat;
    list.appendChild(header);
    for (const entry of items) {
      list.appendChild(renderShoppingItem(entry));
      count++;
    }
  }

  // 3. Не найденные в справочнике — подсвечены
  if (unknownItems.length) {
    const header = document.createElement("li");
    header.className = "shopping__group";
    header.textContent = "Не найдено в справочнике";
    list.appendChild(header);
    for (const entry of unknownItems) {
      const item = renderShoppingItem(entry);
      item.classList.add("is-unknown");
      list.appendChild(item);
      count++;
    }
  }

  empty.hidden = count > 0 || pantryItems.length > 0;
  list.hidden = count === 0 && pantryItems.length === 0;
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
