/* ==========================================================
   Миксер рецептов — цены и наличие в Ленте
   Подтягивает варианты товаров по названию продукта,
   позволяет выбрать цену и посчитать итог.
   ========================================================== */

"use strict";

const LENTA_STORE_ID = 144;

/** Кнопки Ленты в обоих списках: на главной и на экране «Все рецепты» */
function lentaActionButtons() {
  return [...document.querySelectorAll('[id^="lenta-"]')];
}

async function fetchLentaItems(query) {
  const url = "https://integration.api.lenta.com/catalog/v1/items?stores=" + LENTA_STORE_ID +
    "&channel=lo&retailBrand=lo&query=" + encodeURIComponent(query) + "&limit=8";
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

async function updateLentaPrices() {
  const btns = [...document.querySelectorAll('[id^="lenta-update"]')];
  btns.forEach((b) => { b.disabled = true; b.textContent = "Загрузка..."; });

  const merged = mergeIngredients(recipesById(state.checked));
  const unique = [...new Set([...merged.values()].map((entry) => entry.name))];

  const fetches = unique.map(async (name) => {
    const db = findIngredient(name);
    const query = db ? (db.lentaQuery || db.name) : name;
    try {
      lentaVariants[norm(name)] = await fetchLentaItems(query);
    } catch (error) {
      lentaVariants[norm(name)] = [];
    }
  });

  await Promise.all(fetches);

  btns.forEach((b) => { b.disabled = false; b.textContent = "Обновить цены"; });
  renderShoppingList();
}

async function applyLentaSort(mode) {
  // Сначала обновляем цены (загружаем варианты), потом применяем сортировку
  await updateLentaPrices();
  let changed = false;

  Object.keys(lentaVariants).forEach((key) => {
    const items = lentaVariants[key];
    if (!items || !items.length) return;

    let pick = items[0];
    items.forEach((item) => {
      if (mode === "cheapest" && item.prices.price < pick.prices.price) pick = item;
      if (mode === "priciest" && item.prices.price > pick.prices.price) pick = item;
      if (mode === "discount" && (item.prices.discountPercentage || 0) > (pick.prices.discountPercentage || 0)) pick = item;
    });

    state.lentaPrices[key] = {
      id: pick.id,
      name: pick.name,
      price: pick.prices.price / 100
    };
    changed = true;
  });

  if (changed) {
    saveState();
    renderShoppingList();
  }
}

function updateLentaTotal() {
  const merged = mergeIngredients(recipesById(state.checked));
  let total = 0;
  let hasAny = false;

  for (const entry of merged.values()) {
    const selected = state.lentaPrices[norm(entry.name)];
    if (!selected) continue;
    hasAny = true;
    total += selected.price * Math.max(1, packsFor(entry).packs);
  }

  ["", "-all"].forEach((suffix) => {
    const el = document.getElementById("shopping-total" + suffix);
    if (!el) return;
    if (hasAny) {
      el.textContent = "Итого (по выбранным ценам): " + total.toFixed(2) + " ₽";
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });
}
