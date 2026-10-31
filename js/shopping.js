/* ==========================================================
   Миксер рецептов — список покупок
   Сводит одинаковые продукты из разных рецептов в один пункт,
   складывает количества в правильных единицах и подсказывает,
   сколько упаковок брать в магазине.
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   Поиск продукта в справочнике
   ---------------------------------------------------------- */

/** Находит продукт по названию или синониму; null, если не нашёлся */
function findIngredient(rawName) {
  const db = ingredientsDb();
  if (!db) return null;

  const wanted = norm(rawName);
  const byName = db.ingredients.find((item) => norm(item.name) === wanted);
  if (byName) return byName;

  const byAlias = db.ingredients.find((item) =>
    (item.aliases || []).some((alias) => norm(alias) === wanted));
  return byAlias || null;
}

/** Приводит название к виду из справочника (или оставляет как ввёл человек) */
function canonicalName(rawName) {
  const found = findIngredient(rawName);
  return found ? found.name : rawName;
}

/* ----------------------------------------------------------
   Единицы измерения
   ---------------------------------------------------------- */

function scaleAmount(amount, factor) {
  const num = parseFloat(String(amount).replace(",", "."));
  if (isNaN(num)) return null;
  return num * factor;
}

function convertAmount(amount, fromUnit, toUnit, db) {
  const units = unitsTable();
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

/** 850 г → «850 г», 1200 г → «1.2 кг», 500 мл → «500 мл» */
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
    "банка":    ["банка", "банки", "банок"]
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

/* ----------------------------------------------------------
   Сведение продуктов
   ---------------------------------------------------------- */

/**
 * Сколько нужно купить: количество в «натуральной» единице
 * (яйца и лук — в штуках, а не в граммах) и сколько это упаковок.
 */
function packsFor(entry) {
  const info = { amount: entry.baseTotal, unit: entry.baseUnit, packs: 0, size: null };
  if (!entry.hasConvertible) return info;

  if (entry.db && entry.db.gramsPerUnit && entry.baseUnit === "г") {
    info.amount = entry.baseTotal / entry.db.gramsPerUnit;
    info.unit = "шт";
  }

  if (entry.db && entry.db.pack && entry.db.pack.size > 0) {
    info.packs = Math.ceil(info.amount / entry.db.pack.size);
    info.size = entry.db.pack.size;
  }

  return info;
}

/**
 * Складывает ингредиенты рецептов в один список.
 * Возвращает Map: ключ продукта → запись с количеством и категорией.
 */
function mergeIngredients(recipes) {
  const map = new Map();
  const units = unitsTable();

  for (const recipe of recipes) {
    const scale = TARGET_SERVINGS / (recipe.servings || TARGET_SERVINGS);

    for (const ing of recipe.ingredients) {
      const db = findIngredient(ing.name);
      const key = db ? "id:" + db.id : "unknown:" + norm(ing.name);

      if (!map.has(key)) {
        map.set(key, {
          db,
          name: db ? db.name : ing.name,
          category: db ? db.category : "Прочее",
          convertible: [],
          textLines: []
        });
      }

      const entry = map.get(key);
      const amount = String(ing.amount).trim();
      const unit = String(ing.unit || "").trim();
      const scaled = scaleAmount(amount, scale);

      if (scaled === null || !units[unit]) {
        entry.textLines.push((scaled === null ? amount : scaled) + (unit ? " " + unit : ""));
      } else {
        entry.convertible.push({ amount: scaled, unit });
      }
    }
  }

  // Выбираем базовую единицу и складываем
  for (const entry of map.values()) {
    if (!entry.convertible.length) {
      entry.hasConvertible = false;
      entry.baseTotal = 0;
      entry.baseUnit = null;
      continue;
    }

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

/* ----------------------------------------------------------
   Отрисовка списка
   ---------------------------------------------------------- */

function renderShoppingItem(entry, suffix) {
  suffix = suffix || "";
  const li = document.createElement("li");
  const key = entry.db ? "id:" + entry.db.id : "unknown:" + norm(entry.name);

  const natural = packsFor(entry);

  let amountStr = "";
  if (entry.hasConvertible) {
    const human = baseToHuman(natural.amount, natural.unit);
    amountStr = human.amount + " " + human.unit;
  }

  // Текстовые количества («по вкусу») — без дублей
  const uniqueText = [...new Set(entry.textLines)];
  const amountDisplay = [amountStr, ...uniqueText].filter(Boolean).join("; ") || "—";

  // Сколько упаковок брать
  let packStr = "";
  if (entry.db && entry.db.pack && entry.hasConvertible && natural.packs >= 1) {
    const plural = pluralizePack(entry.db.pack.unit, natural.packs);
    const packHuman = baseToHuman(natural.size, natural.unit);
    packStr = natural.packs + " " + plural + " по " + packHuman.amount + " " + packHuman.unit;
  }

  // Цена из Ленты
  const variants = lentaVariants[norm(entry.name)] || [];
  const selected = state.lentaPrices[norm(entry.name)] || null;
  let priceHtml = "";
  if (variants.length) {
    const opts = variants.map((item) => {
      const priceRub = (item.prices.price / 100).toFixed(2);
      const sel = selected && selected.id === item.id ? " selected" : "";
      return `<option value="${item.id}"${sel}>${esc(item.name)} — ${priceRub} ₽</option>`;
    }).join("");
    priceHtml = `<select class="shopping__price-select" data-name="${esc(entry.name)}">
      <option value="">— цена —</option>
      ${opts}
    </select>`;
  }
  if (selected) {
    priceHtml += ` <span class="shopping__price">${selected.price.toFixed(2)} ₽</span>`;
  }

  li.innerHTML = `
    <input type="checkbox" id="buy-${suffix}-${key}" data-key="${key}">
    <label for="buy-${suffix}-${key}">${esc(entry.name)}</label>
    <div class="shopping__right">
      <span class="ingredients__amount">${esc(amountDisplay)}</span>
      ${packStr ? `<span class="shopping__pack">${esc(packStr)}</span>` : ""}
      ${priceHtml}
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

  const priceSelect = li.querySelector(".shopping__price-select");
  if (priceSelect) {
    priceSelect.addEventListener("change", () => {
      const id = Number(priceSelect.value);
      if (!id) {
        delete state.lentaPrices[norm(entry.name)];
        saveState();
        renderShoppingList();
        return;
      }
      const item = variants.find((it) => it.id === id);
      if (item) {
        state.lentaPrices[norm(entry.name)] = {
          id: item.id,
          name: item.name,
          price: item.prices.price / 100
        };
        saveState();
        renderShoppingList();
      }
    });
  }

  return li;
}

/** Рисует один список: "" — на главной, "-all" — на экране «Все рецепты» */
function renderShoppingListTo(suffix) {
  suffix = suffix || "";
  const list = document.getElementById("shopping-list" + suffix);
  const empty = document.getElementById("shopping-empty" + suffix);
  if (!list) return;
  list.innerHTML = "";

  // Корзина собирается из всех отмеченных рецептов (и с главной, и из «Все рецепты»)
  const merged = mergeIngredients(recipesById(state.checked));

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
      list.appendChild(renderShoppingItem(entry, suffix));
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
      const item = renderShoppingItem(entry, suffix);
      item.classList.add("is-unknown");
      list.appendChild(item);
      count++;
    }
  }

  if (empty) empty.hidden = count > 0 || pantryItems.length > 0;
  list.hidden = count === 0 && pantryItems.length === 0;

  updateLentaTotal();

  // Кнопки Ленты имеют смысл только когда список не пуст
  const hasItems = count > 0;
  lentaActionButtons().forEach((btn) => { btn.disabled = !hasItems; });
}

function renderShoppingList() {
  renderShoppingListTo("");
  renderShoppingListTo("-all");
}
