/* ==========================================================
   Миксер рецептов — основа
   Настройки, состояние приложения, мелкие помощники
   и сохранение в браузере.
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   Настройки
   ---------------------------------------------------------- */

const STORAGE_KEY = "mixer-state-v1";
const HISTORY_DAYS = 7;      // сколько дней истории держим
const MAX_AVOID_DAYS = 3;    // не повторять рецепты из последних N дней
const TARGET_SERVINGS = 2;   // на сколько человек готовим

const CUISINES = ["обычная", "китайская", "сложная"];

const CATEGORIES = [
  { key: "завтрак", target: "breakfast-cards" },
  { key: "обед",    target: "lunch-cards" },
  { key: "ужин",    target: "dinner-cards" }
];

const CATEGORY_LABEL = { завтрак: "Завтрак", обед: "Обед", ужин: "Ужин" };

const CATEGORY_BADGE = {
  завтрак: "badge--breakfast",
  обед:    "badge--lunch",
  ужин:    "badge--dinner"
};

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
  perCategory: 2,     // сколько рецептов в каждой категории
  cuisine: "обычная",  // выбранная кухня: "обычная", "китайская" или "сложная"
  lentaPrices: {},    // выбранные цены Ленты: ключ norm(имя) -> { id, name, price }
  homeIngredients: [] // ингредиенты, которые есть дома
};

// Кэш вариантов Ленты в памяти (не сохраняется): ключ norm(имя) -> массив товаров
const lentaVariants = {};

// id рецептов с раскрытыми шагами (не сохраняем)
const expanded = new Set();

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

/** Число в русском виде: 2 → «2», 0.5 → «0,5», 1.25 → «1,25» */
function formatQty(value) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(".", ",");
}

// То, что считают поштучно и ложками: округляем до половины
const HALF_STEP_UNITS = new Set([
  "шт", "ст.л.", "ч.л.", "зубчик", "зубчика", "ломтик", "ломтика",
  "лист", "листиков", "веточка", "веточки", "пучок", "стебель",
  "стебля", "головка", "банка", "уп."
]);

/** Округление «по-кухонному»: граммы до целых, штуки и ложки до половины */
function roundForCooking(value, unit) {
  if (HALF_STEP_UNITS.has(unit)) return Math.max(0.5, Math.round(value * 2) / 2);
  if (unit === "г" || unit === "мл") return Math.round(value);
  if (unit === "кг" || unit === "л") return Math.round(value * 100) / 100;
  return Math.round(value * 10) / 10;
}

/**
 * Количество продукта, пересчитанное на наше число людей.
 * «по вкусу» и «щепотку» оставляем как есть.
 */
function amountForServings(amount, factor, unit) {
  const raw = String(amount).trim();
  const num = parseFloat(raw.replace(",", "."));
  if (isNaN(num)) return raw;
  return formatQty(roundForCooking(num * factor, String(unit || "")));
}


/** Справочник продуктов; null, если он не подключён */
function ingredientsDb() {
  return typeof INGREDIENTS === "undefined" ? null : INGREDIENTS;
}

/** Таблица единиц измерения; пустая, если справочника нет */
function unitsTable() {
  const db = ingredientsDb();
  return db && db.units ? db.units : {};
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
  if (CUISINES.includes(data.cuisine)) state.cuisine = data.cuisine;
  if (data.lentaPrices && typeof data.lentaPrices === "object") state.lentaPrices = data.lentaPrices;
  if (Array.isArray(data.homeIngredients)) state.homeIngredients = data.homeIngredients.filter((x) => typeof x === "string");
}
