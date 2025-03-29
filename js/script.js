document.addEventListener('DOMContentLoaded', function() {
  // --- Логика переключения секций ---
  const sections = document.querySelectorAll(".section");
  const mainSection = document.querySelector(".section.main");
  const recycleSection = document.querySelector(".section.recycle");
  const upcycleSection = document.querySelector(".section.upcycle");
  const customizationSection = document.querySelector(".section.customization");

  const secondScreen = document.querySelector(".second_screen");
  const thirdScreen = document.querySelector(".third_screen"); // <-- Добавлено
    const fourthScreen = document.querySelector(".fourth_screen"); // <-- Добавлено

  const recycle_button = document.getElementById("recycle_button");
  const upcycle_button = document.getElementById("upcycle_button");
  const customization_button = document.getElementById("customization_button");

  const recycle_back = document.getElementById("recycle_back");
  const upcycle_back = document.getElementById("upcycle_back");           // Получаем кнопку "назад" из апсайкла
  const customization_back = document.getElementById("customization_back"); // Получаем кнопку "назад" из кастомизации

  // Функция для показа конкретной секции и скрытия остальных
  function showSection(sectionToShow) {
      // Сначала скрыть все секции
      sections.forEach(section => {
          section.classList.remove('visible');
      });
      // Затем показать нужную секцию
      if (sectionToShow) {
          sectionToShow.classList.add('visible');
      }

      // --- Новая логика для second_screen и fourth_screen ---
    if (secondScreen && thirdScreen && fourthScreen) { // Убедимся, что элементы найдены
        if (sectionToShow === mainSection) {
            // Если показываем главную секцию, то second и fourth тоже должны быть видны
            secondScreen.style.display = ''; 
            thirdScreen.style.display = '';// Сбрасываем стиль display (вернется к значению по умолчанию из CSS, обычно block)
            fourthScreen.style.display = ''; // Сбрасываем стиль display
            // Если у них в CSS задан display: flex или grid, используйте:
            // secondScreen.style.display = 'flex'; // или 'block', 'grid' и т.д.
            // fourthScreen.style.display = 'block'; // или 'flex', 'grid' и т.д.
        } else {
            // Если показываем ЛЮБУЮ другую секцию (.recycle, .upcycle, .customization)
            // ИЛИ если sectionToShow === null (например, гипотетическое состояние "все скрыто"),
            // то скрываем second и fourth
            secondScreen.style.display = 'none';
            thirdScreen.style.display = 'none';
            fourthScreen.style.display = 'none';
        }
    }
    // --- Конец новой логики ---
  }

  // Навешиваем обработчики на основные кнопки
  if (recycle_button && recycleSection) {
      recycle_button.addEventListener("click", () => {
          showSection(recycleSection);
      });
  }

  if (upcycle_button && upcycleSection) {
      upcycle_button.addEventListener("click", () => {
          showSection(upcycleSection);
      });
  }

  if (customization_button && customizationSection) {
      customization_button.addEventListener("click", () => {
          showSection(customizationSection);
      });
  }

  // Навешиваем обработчики на кнопки "НАЗАД"
  if (recycle_back && mainSection) {
      recycle_back.addEventListener("click", () => {
          showSection(mainSection); // Возвращаемся на главную
      });
  }

  if (upcycle_back && mainSection) {
      upcycle_back.addEventListener("click", () => {
          showSection(mainSection); // Возвращаемся на главную
      });
  }

  if (customization_back && mainSection) {
      customization_back.addEventListener("click", () => {
          showSection(mainSection); // Возвращаемся на главную
      });
  }

  // Убедимся, что главная секция видима при загрузке (на всякий случай, хотя CSS уже это делает)
  // showSection(mainSection); // Можно раскомментировать, если будут проблемы с начальным отображением

  // --- Логика для перетаскивания и закрытия GIF ---
  var gifGroups = document.querySelectorAll('.gif_group');
  gifGroups.forEach(function(win) {
      makeDraggable(win);
      addCloseHandler(win);
  });

  // --- Логика случайного позиционирования GIF ---
  const gifs = document.querySelectorAll(".gif_group");
  gifs.forEach(gif => {
      // Убедимся, что элемент имеет размеры перед расчетом
      const rect = gif.getBoundingClientRect();
      const elementWidth = rect.width || gif.offsetWidth; // Используем getBoundingClientRect или offsetWidth
      const elementHeight = rect.height || gif.offsetHeight;

      // Ограничиваем область, чтобы окна не вылезали сильно за пределы видимой части
      const maxX = window.innerWidth - elementWidth - 20; // 20px отступ справа
      const maxY = window.innerHeight - elementHeight - 20; // 20px отступ снизу

      const random_x = Math.random() * maxX;
      const random_y = Math.random() * maxY;

      // Применяем позицию, убедившись, что она не отрицательная
      gif.style.left = `${Math.max(0, random_x)}px`;
      gif.style.top = `${Math.max(0, random_y)}px`;
  });

}); // Конец DOMContentLoaded

// --- Функции для перетаскивания и закрытия (могут быть вне DOMContentLoaded) ---
function makeDraggable(el) {
  var isDragging = false;
  var offsetX, offsetY;
  var highestZ = 100; // Начальное значение z-index для перетаскиваемых элементов

  const elImg = el.querySelector ("img");
  elImg.addEventListener('mousedown', e=>e.preventDefault());
  elImg.addEventListener('mousemove', e=>e.preventDefault());


  el.addEventListener('mousedown', function(e) {
    e.preventDefault();//отмена браузерных действий по умолчанию КРУТО
    // Игнорируем клики по кнопке закрытия и другим интерактивным элементам внутри, если нужно
    if (e.target.closest('.close-btn')) return;

    isDragging = true;
    // Координаты относительно документа
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    // Поднимаем окно поверх остальных при начале перетаскивания
    highestZ++;
    el.style.zIndex = highestZ;
    el.style.cursor = 'grabbing'; // Меняем курсор при перетаскивании
  });

  document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      // Вычисляем новые координаты top/left относительно родителя (body)
      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;

      // Опционально: Ограничение перемещения в пределах окна
      const parentRect = el.parentElement.getBoundingClientRect(); // Обычно body
      newLeft = Math.max(0, Math.min(newLeft, parentRect.width - el.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, parentRect.height - el.offsetHeight));


      el.style.left = newLeft + 'px';
      el.style.top  = newTop + 'px';
  });

  document.addEventListener('mouseup', function() {
      if (isDragging) {
           isDragging = false;
           el.style.cursor = 'move'; // Возвращаем курсор по умолчанию
      }
  });

   // Устанавливаем начальный курсор
  el.style.cursor = 'move';
}

function addCloseHandler(el) {
  var closeBtn = el.querySelector('.close-btn');
  if (closeBtn) {
      closeBtn.addEventListener('click', function() {
          // Просто скрываем окно или удаляем, если нужно навсегда
          // el.style.display = 'none'; // Скрыть
           el.parentNode.removeChild(el); // Удалить из DOM
      });
  }
}


// document.addEventListener('DOMContentLoaded', function() {
//     // --- Получаем основные элементы ---
//     const mainPageContent = document.querySelector('.main-page-content'); // Главный контейнер

//     const recycleSection = document.querySelector('.section.recycle');
//     const upcycleSection = document.querySelector('.section.upcycle');
//     const customizationSection = document.querySelector('.section.customization');

//     // Кнопки меню
//     const recycleButton = document.getElementById('recycle_button');
//     const upcycleButton = document.getElementById('upcycle_button');
//     const customizationButton = document.getElementById('customization_button');

//     // Кнопки "НАЗАД"
//     const recycleBack = document.getElementById('recycle_back');
//     const upcycleBack = document.getElementById('upcycle_back');
//     const customizationBack = document.getElementById('customization_back');

//     // Массив оверлеев для удобства
//     const overlaySections = [recycleSection, upcycleSection, customizationSection];

//     // --- Функции управления видимостью ---

//     // Функция для показа конкретного оверлея
//     function showOverlay(sectionToShow) {
//         if (!mainPageContent || !sectionToShow) return; // Проверка на существование элементов

//         // 1. Скрыть основной контент
//         mainPageContent.style.display = 'none';

//         // 2. Скрыть ВСЕ оверлеи на всякий случай (если вдруг что-то осталось видимым)
//         overlaySections.forEach(section => {
//             if (section) section.style.display = 'none';
//         });

//         // 3. Показать нужный оверлей
//         sectionToShow.style.display = 'block'; // Или 'flex', 'grid' - зависит от CSS оверлея
//                                               // Если у .section.recycle и т.д. нет display в CSS, то 'block' подойдет

//         // 4. Прокрутить окно вверх (удобно при переходе)
//         window.scrollTo(0, 0);
//     }

//     // Функция для показа основного контента и скрытия всех оверлеев
//     function showMainContent() {
//         if (!mainPageContent) return;

//         // 1. Скрыть ВСЕ оверлеи
//         overlaySections.forEach(section => {
//             if (section) section.style.display = 'none';
//         });

//         // 2. Показать основной контент
//         mainPageContent.style.display = 'block'; // Или 'flex', если .main-page-content - flex-контейнер

//         // 3. Можно прокрутить окно вверх, если нужно
//         // window.scrollTo(0, 0);
//     }

//     // --- Навешиваем обработчики ---

//     // На кнопки основного меню
//     if (recycleButton && recycleSection) {
//         recycleButton.addEventListener('click', () => showOverlay(recycleSection));
//     }

//     if (upcycleButton && upcycleSection) {
//         upcycleButton.addEventListener('click', () => showOverlay(upcycleSection));
//     }

//     if (customizationButton && customizationSection) {
//         customizationButton.addEventListener('click', () => showOverlay(customizationSection));
//     }

//     // На кнопки "НАЗАД"
//     if (recycleBack) {
//         recycleBack.addEventListener('click', showMainContent);
//     }

//     if (upcycleBack) {
//         upcycleBack.addEventListener('click', showMainContent);
//     }

//     if (customizationBack) {
//         customizationBack.addEventListener('click', showMainContent);
//     }

//     // --- Инициализация ---
//     // Убедимся, что при загрузке показан основной контент и скрыты оверлеи.
//     // Это должно быть сделано через CSS (display: none для оверлеев),
//     // но можно добавить и здесь для надежности, хотя лучше полагаться на CSS.
//     // showMainContent(); // Можно раскомментировать, если есть проблемы с начальным состоянием

//     // --- Логика для перетаскивания и закрытия GIF (ОСТАВЛЯЕМ КАК БЫЛО) ---
//     var gifGroups = document.querySelectorAll('.gif_group');
//     gifGroups.forEach(function(win) {
//         makeDraggable(win);
//         addCloseHandler(win);
//     });

//     // --- Логика случайного позиционирования GIF (ОСТАВЛЯЕМ КАК БЫЛО) ---
//     // Убедись, что .gif_group находятся ВНУТРИ .main-page-content (например, в .second_screen)
//     const gifs = document.querySelectorAll(".gif_group");
//     gifs.forEach(gif => {
//         // Определение контейнера для позиционирования (например, .second_screen или body)
//         const positioningContainer = gif.closest('.second_screen') || document.body; // Ищем ближайший .second_screen или используем body
//         const containerRect = positioningContainer.getBoundingClientRect();

//         // Получаем размеры самого gif элемента
//         const rect = gif.getBoundingClientRect();
//         const elementWidth = rect.width || gif.offsetWidth;
//         const elementHeight = rect.height || gif.offsetHeight;

//         // Рассчитываем максимальные координаты внутри контейнера
//         // containerRect.width/height - размеры контейнера
//         // containerRect.left/top - позиция контейнера относительно viewport (нужна, если контейнер не body)
//         // window.pageXOffset/pageYOffset - текущий скролл страницы

//         // Для простоты, если контейнер - body или его положение статично:
//         const maxX = Math.max(0, (positioningContainer === document.body ? window.innerWidth : containerRect.width) - elementWidth - 20); // 20px отступ справа
//         const maxY = Math.max(0, (positioningContainer === document.body ? window.innerHeight : containerRect.height) - elementHeight - 20); // 20px отступ снизу

//         // Генерируем случайные координаты
//         const random_x = Math.random() * maxX;
//         const random_y = Math.random() * maxY;

//         // Применяем позицию
//         gif.style.left = `${Math.max(0, random_x)}px`;
//         gif.style.top = `${Math.max(0, random_y)}px`;
//     });

// }); // Конец DOMContentLoaded

// // --- Функции для перетаскивания и закрытия (ОСТАВЛЯЕМ КАК БЫЛО) ---
// function makeDraggable(el) {
//     var isDragging = false;
//     var offsetX, offsetY;
//     // Попробуем сделать z-index динамическим, начиная с базового значения
//     var baseZIndex = 100; // Базовый z-index для draggable элементов
//     var highestZ = baseZIndex; // Текущий максимальный z-index

//     const elImg = el.querySelector("img");
//     // Предотвращаем стандартное перетаскивание картинки браузером
//     if (elImg) {
//         elImg.addEventListener('dragstart', (e) => e.preventDefault());
//     }

//     el.addEventListener('mousedown', function(e) {
//         // Игнорируем клики по кнопке закрытия и другим интерактивным элементам внутри
//         if (e.target.closest('.close-btn') || e.target.closest('button') || e.target.closest('a')) return;

//         // e.preventDefault(); // Предотвращаем выделение текста при перетаскивании

//         isDragging = true;
//         // Координаты клика относительно верхнего левого угла элемента
//         const rect = el.getBoundingClientRect();
//         offsetX = e.clientX - rect.left;
//         offsetY = e.clientY - rect.top;

//         // Поднимаем окно поверх остальных при начале перетаскивания
//         highestZ++;
//         el.style.zIndex = highestZ;
//         el.style.cursor = 'grabbing';
//     });

//     document.addEventListener('mousemove', function(e) {
//         if (!isDragging) return;
//         // Предотвращаем выделение текста
//         e.preventDefault();

//         // Вычисляем новые координаты top/left относительно viewport
//         let newLeft = e.clientX - offsetX;
//         let newTop = e.clientY - offsetY;

//         // Ограничение перемещения в пределах видимой части окна (viewport)
//         const vpWidth = window.innerWidth;
//         const vpHeight = window.innerHeight;
//         const elWidth = el.offsetWidth;
//         const elHeight = el.offsetHeight;

//         newLeft = Math.max(0, Math.min(newLeft, vpWidth - elWidth));
//         newTop = Math.max(0, Math.min(newTop, vpHeight - elHeight));

//         el.style.left = newLeft + 'px';
//         el.style.top  = newTop + 'px';
//     });

//     document.addEventListener('mouseup', function() {
//         if (isDragging) {
//             isDragging = false;
//             el.style.cursor = 'move';
//         }
//     });

//     // Устанавливаем начальный курсор и z-index
//     el.style.cursor = 'move';
//     el.style.zIndex = baseZIndex; // Устанавливаем базовый z-index
// }

// function addCloseHandler(el) {
//     var closeBtn = el.querySelector('.close-btn');
//     if (closeBtn) {
//         closeBtn.addEventListener('click', function() {
//             // el.style.display = 'none'; // Скрыть
//             el.parentNode.removeChild(el); // Удалить из DOM
//         });
//     }
// }