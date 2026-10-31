# Промпт для Task-024

Сделай рефакторинг приложения «Миксер рецептов»: разложи `app.js` по файлам
и убери повторы. Поведение и внешний вид должны остаться прежними.

## Правила

- Никаких сборщиков, npm и модулей. Обычные `<script src="...">` в `index.html`.
- Порядок подключения: `recipes.js`, `ingredients.js`, `js/basics.js`,
  `js/menu.js`, `js/card.js`, `js/shopping.js`, `js/lenta.js`,
  `js/all-recipes.js`, `js/main.js`.
- `recipes.js`, `ingredients.js`, `styles.css` не менять.
- Стиль прежний: `"use strict"`, двойные кавычки, отступ 2 пробела,
  комментарии по-русски.

## Файлы

| Файл | Что внутри |
|---|---|
| `js/basics.js` | `STORAGE_KEY`, `HISTORY_DAYS`, `MAX_AVOID_DAYS`, `TARGET_SERVINGS`, `CATEGORIES`, `CATEGORY_LABEL`, `state`, `lentaVariants`, `esc`, `amountText`, `todayKey`, `norm`, `ingredientsDb`, `unitsTable`, `saveState`, `isIntArray`, `loadState` |
| `js/menu.js` | `RECIPE_INDEX`, `catalog`, `buildIndex`, `getRecipe`, `isAllowed`, `recipePool`, `recentIds`, `avoidDaysFor`, `weightOf`, `takeWeighted`, `pickForCategory`, `rememberToday`, `generateMenu`, `updateCountToggle`, `updateCuisineToggle`, `setCuisine` |
| `js/card.js` | `renderCard`, `render`, `updateHint`, `renderWarning` |
| `js/shopping.js` | `findIngredient`, `scaleAmount`, `convertAmount`, `baseToHuman`, `pluralizePack`, `mergeIngredients`, `packsFor`, `renderShoppingItem`, `renderShoppingListTo`, `renderShoppingList` |
| `js/lenta.js` | `LENTA_STORE_ID`, `fetchLentaItems`, `lentaActionButtons`, `updateLentaPrices`, `applyLentaSort`, `updateLentaTotal` |
| `js/all-recipes.js` | `allRecipesCat`, `allRecipesQuery`, `homeMode`, `populateIngredientsDatalist`, `renderExcluded`, `addExcludedIngredient`, `renderHomeChips`, `addHomeIngredient`, `clearHomeIngredients`, `homeMatch`, `renderAllRecipes`, `initAllRecipesScreen` |
| `js/main.js` | `initButtons`, `showFatal`, `init`, `DOMContentLoaded` |

## Что убрать

1. Восемь повторов `typeof INGREDIENTS === "undefined" ...` → `ingredientsDb()`.
2. Три поиска продукта по имени и синонимам → `findIngredient()`.
3. Два расчёта пакетов (в `renderShoppingItem` и `updateLentaTotal`) → `packsFor()`.
4. Перечисление кнопок Ленты по id → `lentaActionButtons()`.
5. Устаревшие комментарии про «28 рецептов».
6. Создание раздела «Выбранное» на лету в `render()` → разметка в `index.html`
   (в конце `.menu`, с `hidden` по умолчанию).

## Как проверять

Открыть страницу через локальный сервер и проверить по списку из `TASK.md`:
6 карточек, режим «3» → 9 карточек, кухни, исключённые продукты, «Все рецепты»,
«Что есть дома», список покупок и пакеты, цены Ленты и итог, «Снять отметки»,
«Сбросить всё», сохранение после перезагрузки, ширина 390 px, консоль браузера.
