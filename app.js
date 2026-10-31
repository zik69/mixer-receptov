/* ==========================================================
   Миксер рецептов — совместимость со старой страницей

   Раньше вся логика лежала в этом файле. Теперь она разложена
   по папке js/, и страница подключает новые файлы напрямую.

   Этот файл нужен только тем, у кого в браузере осталась
   старая копия index.html: она по-прежнему просит app.js.
   Здесь мы просто подгружаем новые файлы в правильном порядке,
   чтобы у человека всё работало, а не было пустой страницы.

   Когда старые копии у всех перестанут открываться,
   файл можно удалить.
   ========================================================== */

(function () {
  "use strict";

  const FILES = [
    "js/basics.js",
    "js/menu.js",
    "js/card.js",
    "js/shopping.js",
    "js/lenta.js",
    "js/all-recipes.js",
    "js/main.js"
  ];

  // Новая страница сама подключает js/basics.js — тогда ничего не делаем
  if (document.querySelector('script[src="js/basics.js"]')) return;

  if (document.readyState === "loading") {
    // Идёт разбор страницы: пишем теги по порядку, браузер выполнит их как обычно
    FILES.forEach((file) => {
      document.write('<script src="' + file + '"><\/script>');
    });
    return;
  }

  // Страница уже загружена: подключаем по очереди
  (function loadNext(index) {
    if (index >= FILES.length) return;
    const script = document.createElement("script");
    script.src = FILES[index];
    script.onload = () => loadNext(index + 1);
    document.head.appendChild(script);
  })(0);
})();
