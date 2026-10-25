const INGREDIENTS = {
  "version": 1,
  "units": {
    "шт":      { "base": "шт",      "factor": 1 },
    "г":       { "base": "г",       "factor": 1 },
    "кг":      { "base": "г",       "factor": 1000 },
    "мл":      { "base": "мл",      "factor": 1 },
    "л":       { "base": "мл",      "factor": 1000 },
    "ст.л.":   { "base": "мл",      "factor": 15 },
    "ч.л.":    { "base": "мл",      "factor": 5 },
    "зубчик":  { "base": "зубчик",  "factor": 1 },
    "пучок":   { "base": "пучок",   "factor": 1 },
    "банка":   { "base": "банка",   "factor": 1 },
    "пачка":   { "base": "пачка",   "factor": 1 },
    "уп.":     { "base": "уп.",     "factor": 1 },
    "ломтик":  { "base": "ломтик",  "factor": 1 },
    "листик":  { "base": "лист",    "factor": 1 },
    "листов":  { "base": "лист",    "factor": 1 }
  },
  "ingredients": [
    {
      "id": "onion",
      "name": "Лук репчатый",
      "aliases": ["лук", "луковица", "репчатый лук", "лук репчатый", "луковица репчатого лука"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 100,
      "lentaQuery": "Лук репчатый",
      "pack": null
    },
    {
      "id": "red_onion",
      "name": "Лук красный",
      "aliases": ["красный лук", "лук красный", "лук салатный"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 100,
      "lentaQuery": "Лук красный",
      "pack": null
    },
    {
      "id": "garlic",
      "name": "Чеснок",
      "aliases": ["чеснок", "зубчик чеснока", "зубчики чеснока", "головка чеснока"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 5,
      "lentaQuery": "Чеснок",
      "pack": null
    },
    {
      "id": "carrot",
      "name": "Морковь",
      "aliases": ["морковь", "морковка", "морковь свежая"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 80,
      "lentaQuery": "Морковь",
      "pack": null
    },
    {
      "id": "potato",
      "name": "Картофель",
      "aliases": ["картофель", "картошка", "картофель молодой"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 120,
      "lentaQuery": "Картофель",
      "pack": null
    },
    {
      "id": "tomato",
      "name": "Помидоры",
      "aliases": ["помидор", "помидоры", "томат", "томаты"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 120,
      "lentaQuery": "Помидоры",
      "pack": null
    },
    {
      "id": "cucumber",
      "name": "Огурцы",
      "aliases": ["огурец", "огурцы", "огурец свежий", "свежий огурец"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 100,
      "lentaQuery": "Огурцы",
      "pack": null
    },
    {
      "id": "beet",
      "name": "Свёкла",
      "aliases": ["свёкла", "свекла", "свёкла свежая"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 200,
      "lentaQuery": "Свёкла",
      "pack": null
    },
    {
      "id": "cabbage",
      "name": "Капуста белокочанная",
      "aliases": ["капуста", "белокочанная капуста", "капуста свежая", "капуста белокочанная"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Капуста белокочанная",
      "pack": null
    },
    {
      "id": "bell_pepper",
      "name": "Перец болгарский",
      "aliases": ["перец болгарский", "болгарский перец", "сладкий перец", "перец сладкий"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 150,
      "lentaQuery": "Перец болгарский",
      "pack": null
    },
    {
      "id": "avocado",
      "name": "Авокадо",
      "aliases": ["авокадо"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 200,
      "lentaQuery": "Авокадо",
      "pack": null
    },
    {
      "id": "lettuce",
      "name": "Салат листовой",
      "aliases": ["салат листовой", "листья салата", "листовой салат", "салат"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Салат листовой",
      "pack": null
    },
    {
      "id": "basil",
      "name": "Базилик свежий",
      "aliases": ["базилик свежий", "свежий базилик", "базилик", "листья базилика"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Базилик свежий",
      "pack": null
    },
    {
      "id": "apple",
      "name": "Яблоки",
      "aliases": ["яблоко", "яблоки", "яблоко свежее"],
      "category": "фрукты и ягоды",
      "pantry": false,
      "gramsPerUnit": 180,
      "lentaQuery": "Яблоки",
      "pack": null
    },
    {
      "id": "banana",
      "name": "Бананы",
      "aliases": ["банан", "бананы"],
      "category": "фрукты и ягоды",
      "pantry": false,
      "gramsPerUnit": 120,
      "lentaQuery": "Бананы",
      "pack": null
    },
    {
      "id": "orange",
      "name": "Апельсины",
      "aliases": ["апельсин", "апельсины"],
      "category": "фрукты и ягоды",
      "pantry": false,
      "gramsPerUnit": 200,
      "lentaQuery": "Апельсины",
      "pack": null
    },
    {
      "id": "lemon",
      "name": "Лимон",
      "aliases": ["лимон", "лимоны", "лимон свежий"],
      "category": "фрукты и ягоды",
      "pantry": false,
      "gramsPerUnit": 100,
      "lentaQuery": "Лимоны",
      "pack": null
    },
    {
      "id": "chicken_fillets",
      "name": "Куриное филе",
      "aliases": ["куриное филе", "филе курицы", "куриная грудка без кости", "куриное филе варёное", "варёное куриное филе"],
      "category": "мясо и птица",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Куриное филе",
      "pack": null
    },
    {
      "id": "chicken_thighs",
      "name": "Куриные бёдра",
      "aliases": ["куриные бёдра", "куриные бедра", "бёдра куриные", "куриные бёдра на кости"],
      "category": "мясо и птица",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Куриные бёдра",
      "pack": null
    },
    {
      "id": "beef",
      "name": "Говядина",
      "aliases": ["говядина", "говядина свежая", "говяжье мясо"],
      "category": "мясо и птица",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Говядина",
      "pack": null
    },
    {
      "id": "beef_bone",
      "name": "Говядина на кости",
      "aliases": ["говядина на кости", "говядина костная", "суповой набор говяжий"],
      "category": "мясо и птица",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Говядина на кости",
      "pack": null
    },
    {
      "id": "beef_mince",
      "name": "Фарш говяжий",
      "aliases": ["говяжий фарш", "фарш говяжий", "говяжий фарш свежий"],
      "category": "мясо и птица",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Фарш говяжий",
      "pack": null
    },
    {
      "id": "bacon",
      "name": "Бекон",
      "aliases": ["бекон", "бекон нарезка"],
      "category": "мясо и птица",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Бекон",
      "pack": null
    },
    {
      "id": "ham",
      "name": "Ветчина",
      "aliases": ["ветчина", "ветчина нарезка"],
      "category": "мясо и птица",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Ветчина",
      "pack": null
    },
    {
      "id": "boiled_sausage",
      "name": "Колбаса варёная",
      "aliases": ["колбаса варёная", "варёная колбаса", "докторская колбаса"],
      "category": "мясо и птица",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Колбаса варёная",
      "pack": null
    },
    {
      "id": "sausages",
      "name": "Сосиски",
      "aliases": ["сосиски", "сосиска"],
      "category": "мясо и птица",
      "pantry": false,
      "gramsPerUnit": 50,
      "lentaQuery": "Сосиски",
      "pack": null
    },
    {
      "id": "pollock_fillet",
      "name": "Филе минтая",
      "aliases": ["филе минтая", "минтай филе", "минтай филе без кожи"],
      "category": "рыба",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Филе минтая",
      "pack": null
    },
    {
      "id": "rice",
      "name": "Рис",
      "aliases": ["рис", "рис длиннозёрный", "рис круглозёрный", "рис белый"],
      "category": "крупы и макароны",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Рис",
      "pack": null
    },
    {
      "id": "buckwheat",
      "name": "Гречка",
      "aliases": ["гречка", "гречневая крупа", "гречневая каша"],
      "category": "крупы и макароны",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Гречка",
      "pack": null
    },
    {
      "id": "oatmeal",
      "name": "Овсяные хлопья",
      "aliases": ["овсяные хлопья", "овсянка", "геркулес", "овсяные хлопья долгой варки"],
      "category": "крупы и макароны",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Овсяные хлопья",
      "pack": null
    },
    {
      "id": "pasta",
      "name": "Макароны",
      "aliases": ["макароны", "макароны короткие", "макароны перья", "макароны мелкие"],
      "category": "крупы и макароны",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Макароны",
      "pack": null
    },
    {
      "id": "flour",
      "name": "Мука пшеничная",
      "aliases": ["мука", "пшеничная мука", "мука пшеничная высшего сорта"],
      "category": "крупы и макароны",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Мука пшеничная",
      "pack": null
    },
    {
      "id": "breadcrumbs",
      "name": "Панировочные сухари",
      "aliases": ["панировочные сухари", "сухари панировочные", "панировка"],
      "category": "крупы и макароны",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Панировочные сухари",
      "pack": null
    },
    {
      "id": "white_bread",
      "name": "Хлеб белый",
      "aliases": ["хлеб белый", "белый хлеб", "хлеб тостовый"],
      "category": "хлеб и выпечка",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Хлеб белый",
      "pack": null
    },
    {
      "id": "wholegrain_bread",
      "name": "Хлеб цельнозерновой",
      "aliases": ["хлеб цельнозерновой", "цельнозерновой хлеб", "хлеб с отрубями"],
      "category": "хлеб и выпечка",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Хлеб цельнозерновой",
      "pack": null
    },
    {
      "id": "baguette",
      "name": "Багет",
      "aliases": ["багет", "французский багет", "багет французский"],
      "category": "хлеб и выпечка",
      "pantry": false,
      "gramsPerUnit": 250,
      "lentaQuery": "Багет",
      "pack": null
    },
    {
      "id": "bun",
      "name": "Батон",
      "aliases": ["батон", "белый батон", "батон нарезной"],
      "category": "хлеб и выпечка",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Батон",
      "pack": null
    },
    {
      "id": "lavash",
      "name": "Лаваш тонкий",
      "aliases": ["лаваш тонкий", "тонкий лаваш", "лаваш армянский", "лаваш"],
      "category": "хлеб и выпечка",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Лаваш тонкий",
      "pack": null
    },
    {
      "id": "pizza_dough",
      "name": "Тесто для пиццы",
      "aliases": ["тесто для пиццы", "тесто для пиццы готовое", "готовое тесто для пиццы"],
      "category": "хлеб и выпечка",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Тесто для пиццы",
      "pack": { "unit": "упаковка", "size": 500 }
    },
    {
      "id": "eggs",
      "name": "Яйца куриные",
      "aliases": ["яйца", "яйцо", "яйца куриные", "яйцо куриное", "куриные яйца"],
      "category": "молочное и яйца",
      "pantry": false,
      "gramsPerUnit": 55,
      "lentaQuery": "Яйца куриные",
      "pack": { "unit": "десяток", "size": 10 }
    },
    {
      "id": "milk",
      "name": "Молоко",
      "aliases": ["молоко", "молоко 2.5%", "молоко 3.2%", "молоко пастеризованное"],
      "category": "молочное и яйца",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Молоко",
      "pack": { "unit": "бутылка", "size": 1000 }
    },
    {
      "id": "butter",
      "name": "Масло сливочное",
      "aliases": ["масло сливочное", "сливочное масло", "масло крестьянское"],
      "category": "молочное и яйца",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Масло сливочное",
      "pack": null
    },
    {
      "id": "cheese",
      "name": "Сыр твёрдый",
      "aliases": ["сыр", "сыр твёрдый", "российский сыр", "голландский сыр"],
      "category": "молочное и яйца",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Сыр твёрдый",
      "pack": { "unit": "упаковка", "size": 200 }
    },
    {
      "id": "cottage_cheese",
      "name": "Творог",
      "aliases": ["творог", "творог 5%", "творог 9%", "обезжиренный творог"],
      "category": "молочное и яйца",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Творог",
      "pack": null
    },
    {
      "id": "sour_cream",
      "name": "Сметана",
      "aliases": ["сметана", "сметана 15%", "сметана 20%"],
      "category": "молочное и яйца",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Сметана",
      "pack": null
    },
    {
      "id": "yogurt",
      "name": "Йогурт натуральный",
      "aliases": ["йогурт натуральный", "натуральный йогурт", "йогурт без добавок"],
      "category": "молочное и яйца",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Йогурт натуральный",
      "pack": null
    },
    {
      "id": "vegetable_oil",
      "name": "Масло растительное",
      "aliases": ["масло растительное", "подсолнечное масло", "растительное масло", "масло подсолнечное"],
      "category": "масло и соусы",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Масло подсолнечное",
      "pack": { "unit": "бутылка", "size": 1000 }
    },
    {
      "id": "olive_oil",
      "name": "Масло оливковое",
      "aliases": ["масло оливковое", "оливковое масло", "оливковое масло extra virgin"],
      "category": "масло и соусы",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Масло оливковое",
      "pack": { "unit": "бутылка", "size": 500 }
    },
    {
      "id": "tomato_paste",
      "name": "Томатная паста",
      "aliases": ["томатная паста", "томат-паста"],
      "category": "масло и соусы",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Томатная паста",
      "pack": null
    },
    {
      "id": "tomato_sauce",
      "name": "Томатный соус",
      "aliases": ["томатный соус", "соус томатный", "соус для пиццы"],
      "category": "масло и соусы",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Томатный соус",
      "pack": null
    },
    {
      "id": "honey",
      "name": "Мёд",
      "aliases": ["мёд", "мед", "мёд натуральный", "мёд цветочный"],
      "category": "масло и соусы",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Мёд",
      "pack": null
    },
    {
      "id": "lemon_juice",
      "name": "Сок лимонный",
      "aliases": ["лимонный сок", "сок лимонный", "сок лимона"],
      "category": "масло и соусы",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Сок лимонный",
      "pack": null
    },
    {
      "id": "salt",
      "name": "Соль",
      "aliases": ["соль", "соль поваренная", "соль крупного помола"],
      "category": "специи",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Соль",
      "pack": null
    },
    {
      "id": "black_pepper_ground",
      "name": "Перец чёрный молотый",
      "aliases": ["перец", "перец чёрный", "перец чёрный молотый", "чёрный молотый перец", "молотый перец"],
      "category": "специи",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Перец чёрный молотый",
      "pack": null
    },
    {
      "id": "black_pepper_peas",
      "name": "Перец чёрный горошком",
      "aliases": ["перец чёрный горошком", "перец горошком", "чёрный перец горошком"],
      "category": "специи",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Перец чёрный горошком",
      "pack": null
    },
    {
      "id": "bay_leaf",
      "name": "Лавровый лист",
      "aliases": ["лавровый лист", "лист лавровый", "лаврушка"],
      "category": "специи",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Лавровый лист",
      "pack": null
    },
    {
      "id": "sugar",
      "name": "Сахар",
      "aliases": ["сахар", "сахарный песок", "сахар белый"],
      "category": "специи",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Сахар",
      "pack": null
    },
    {
      "id": "herbs",
      "name": "Зелень свежая",
      "aliases": ["зелень", "свежая зелень", "укроп", "петрушка", "укроп и петрушка"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Зелень свежая",
      "pack": null
    },
    {
      "id": "water",
      "name": "Вода",
      "aliases": ["вода", "питьевая вода", "чистая вода"],
      "category": "напитки",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Вода питьевая",
      "pack": null
    },
    {
      "id": "canned_beans",
      "name": "Фасоль консервированная",
      "aliases": ["фасоль консервированная", "консервированная фасоль", "фасоль в банке", "красная фасоль консервированная"],
      "category": "консервы",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Фасоль консервированная",
      "pack": { "unit": "банка", "size": 400 }
    },
    {
      "id": "dumplings",
      "name": "Пельмени",
      "aliases": ["пельмени", "пельмени замороженные"],
      "category": "консервы и полуфабрикаты",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Пельмени",
      "pack": { "unit": "упаковка", "size": 500 }
    },
    {
      "id": "frozen_peas",
      "name": "Горошек зелёный замороженный",
      "aliases": ["горошек замороженный", "зелёный горошек замороженный", "замороженный горошек", "горошек зелёный"],
      "category": "заморозка",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Горошек зелёный замороженный",
      "pack": { "unit": "упаковка", "size": 400 }
    },
    {
      "id": "walnuts",
      "name": "Грецкие орехи",
      "aliases": ["грецкие орехи", "орехи грецкие", "грецкий орех"],
      "category": "орехи",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Грецкие орехи",
      "pack": null
    },
    {
      "id": "chicken_breast",
      "name": "Куриная грудка",
      "aliases": ["куриная грудка", "грудка куриная", "куриная грудка на кости"],
      "category": "мясо и птица",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Куриная грудка",
      "pack": null
    },
    {
      "id": "pork",
      "name": "Свинина",
      "aliases": ["свинина", "свиное мясо", "свинина свежая"],
      "category": "мясо и птица",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Свинина",
      "pack": null
    },
    {
      "id": "chicken_mince",
      "name": "Фарш куриный",
      "aliases": ["куриный фарш", "фарш куриный"],
      "category": "мясо и птица",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Фарш куриный",
      "pack": null
    },
    {
      "id": "pollock",
      "name": "Минтай",
      "aliases": ["минтай", "минтай свежий", "минтай тушка"],
      "category": "рыба",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Минтай",
      "pack": null
    },
    {
      "id": "cod_fillet",
      "name": "Филе трески",
      "aliases": ["филе трески", "треска филе"],
      "category": "рыба",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Филе трески",
      "pack": null
    },
    {
      "id": "salmon",
      "name": "Лосось",
      "aliases": ["лосось", "сёмга", "лосось свежий"],
      "category": "рыба",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Лосось",
      "pack": null
    },
    {
      "id": "bulgur",
      "name": "Булгур",
      "aliases": ["булгур", "крупа булгур"],
      "category": "крупы и макароны",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Булгур",
      "pack": null
    },
    {
      "id": "spaghetti",
      "name": "Спагетти",
      "aliases": ["спагетти", "длинные макароны"],
      "category": "крупы и макароны",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Спагетти",
      "pack": null
    },
    {
      "id": "kefir",
      "name": "Кефир",
      "aliases": ["кефир", "кефир 1%", "кефир 2.5%", "кефир 3.2%"],
      "category": "молочное и яйца",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Кефир",
      "pack": { "unit": "бутылка", "size": 1000 }
    },
    {
      "id": "ketchup",
      "name": "Кетчуп",
      "aliases": ["кетчуп", "томатный кетчуп"],
      "category": "масло и соусы",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Кетчуп",
      "pack": null
    },
    {
      "id": "mayonnaise",
      "name": "Майонез",
      "aliases": ["майонез", "майонез провансаль"],
      "category": "масло и соусы",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Майонез",
      "pack": null
    },
    {
      "id": "mustard",
      "name": "Горчица",
      "aliases": ["горчица", "горчица столовая"],
      "category": "масло и соусы",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Горчица",
      "pack": null
    },
    {
      "id": "soy_sauce",
      "name": "Соевый соус",
      "aliases": ["соевый соус", "соус соевый"],
      "category": "масло и соусы",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Соевый соус",
      "pack": null
    },
    {
      "id": "vinegar",
      "name": "Уксус столовый",
      "aliases": ["уксус", "уксус столовый", "столовый уксус"],
      "category": "масло и соусы",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Уксус столовый",
      "pack": null
    },
    {
      "id": "canned_tomatoes",
      "name": "Томаты в собственном соку",
      "aliases": ["томаты в собственном соку", "помидоры в собственном соку", "резаные томаты"],
      "category": "консервы",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Томаты в собственном соку",
      "pack": { "unit": "банка", "size": 400 }
    },
    {
      "id": "canned_corn",
      "name": "Кукуруза консервированная",
      "aliases": ["кукуруза консервированная", "консервированная кукуруза", "сахарная кукуруза"],
      "category": "консервы",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Кукуруза консервированная",
      "pack": { "unit": "банка", "size": 340 }
    },
    {
      "id": "canned_peas",
      "name": "Горошек зелёный консервированный",
      "aliases": ["горошек консервированный", "зелёный горошек консервированный", "консервированный горошек"],
      "category": "консервы",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Горошек зелёный консервированный",
      "pack": { "unit": "банка", "size": 400 }
    },
    {
      "id": "olives",
      "name": "Оливки",
      "aliases": ["оливки", "маслины", "оливки без косточки"],
      "category": "консервы",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Оливки",
      "pack": { "unit": "банка", "size": 300 }
    },
    {
      "id": "pear",
      "name": "Груши",
      "aliases": ["груша", "груши"],
      "category": "фрукты и ягоды",
      "pantry": false,
      "gramsPerUnit": 170,
      "lentaQuery": "Груши",
      "pack": null
    },
    {
      "id": "strawberry",
      "name": "Клубника",
      "aliases": ["клубника", "клубника свежая", "клубника замороженная"],
      "category": "фрукты и ягоды",
      "pantry": false,
      "gramsPerUnit": 15,
      "lentaQuery": "Клубника",
      "pack": null
    },
    {
      "id": "zucchini",
      "name": "Кабачок",
      "aliases": ["кабачок", "кабачки", "цуккини"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 400,
      "lentaQuery": "Кабачки",
      "pack": null
    },
    {
      "id": "eggplant",
      "name": "Баклажан",
      "aliases": ["баклажан", "баклажаны"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 300,
      "lentaQuery": "Баклажаны",
      "pack": null
    },
    {
      "id": "mushrooms",
      "name": "Шампиньоны",
      "aliases": ["шампиньоны", "грибы шампиньоны", "свежие шампиньоны"],
      "category": "овощи",
      "pantry": false,
      "gramsPerUnit": 0,
      "lentaQuery": "Шампиньоны свежие",
      "pack": null
    },
    {
      "id": "paprika",
      "name": "Паприка",
      "aliases": ["паприка", "молотая паприка"],
      "category": "специи",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Паприка молотая",
      "pack": null
    },
    {
      "id": "cinnamon",
      "name": "Корица",
      "aliases": ["корица", "молотая корица", "корица молотая"],
      "category": "специи",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Корица молотая",
      "pack": null
    },
    {
      "id": "dried_garlic",
      "name": "Сушёный чеснок",
      "aliases": ["сушёный чеснок", "сушеный чеснок", "чеснок сушёный"],
      "category": "специи",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Чеснок сушёный",
      "pack": null
    },
    {
      "id": "vanilla_sugar",
      "name": "Ванильный сахар",
      "aliases": ["ванильный сахар", "ванилин"],
      "category": "специи",
      "pantry": true,
      "gramsPerUnit": 0,
      "lentaQuery": "Ванильный сахар",
      "pack": null
    }
  ]
}
;