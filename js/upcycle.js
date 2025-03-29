// const whole_clothes_divs = document.querySelectorAll ('.whole_clothes_div');

// const clothes_pieces = {
// greenTshirt: ['./img/tshirt_upcycle_1.png','./img/tshirt_upcycle_2.png','./img/tshirt_upcycle_3.png','./img/tshirt_upcycle_4.png','./img/tshirt_upcycle_5.png'],
// blackTshirt: ['./img/blackTshirt_upcycle_1.png','./img/blackTshirt_upcycle_2.png','./img/blackTshirt_upcycle_3.png','./img/blackTshirt_upcycle_4.png','./img/blackTshirt_upcycle_5.png'],
// greySweater: ['./img/sweater_upcycle_1.png','./img/sweater_upcycle_2.png','./img/sweater_upcycle_3.png','./img/sweater_upcycle_4.png','./img/sweater_upcycle_5.png'],
// blueJeans: ['./img/jeans_upcycle_1.png','./img/jeans_upcycle_2.png','./img/jeans_upcycle_3.png','./img/jeans_upcycle_4.png'],
// denimJacket: ['./img/jeansJacket_upcycle_1.png','./img/jeansJacket_upcycle_2.png','./img/jeansJacket_upcycle_3.png','./img/jeansJacket_upcycle_4.png','./img/jeansJacket_upcycle_5.png','./img/jeansJacket_upcycle_6.png'],
// blueHoodie: ['./img/hoodie_upcycle_1.png','./img/hoodie_upcycle_2.png','./img/hoodie_upcycle_3.png','./img/hoodie_upcycle_4.png','./img/hoodie_upcycle_5.png','./img/hoodie_upcycle_6.png','./img/hoodie_upcycle_6.png','./img/hoodie_upcycle_7.png'],
// }

// // console.log ('div', cloth);

// whole_clothes_divs.forEach(cloth_div=>{
//     cloth=cloth_div.querySelector('.whole_clothes');
//     cloth.addEventListener ('click', ()=>{
//         cloth.style.display='none';
//         // console.log('div', cloth_div);
//         clothes_pieces [cloth_div.dataset.clothestype].forEach((path)=>{
//             const piece_img = document.createElement ('img');
//             piece_img.src = path;
//             cloth_div.appendChild (piece_img);
//         })
//     });
// })




/**
 * Скрипт взаимодействия для Upcycle Clothing
 *
 * Позволяет пользователям кликать на целые предметы одежды, которые затем "разлетаются" на куски.
 * Пользователи могут перетаскивать и вращать эти куски, чтобы разместить их на манекене.
 * Курсор вращения появляется при наведении, если мышь достаточно далеко от центра
 * выделенного куска.
 *
 * Ключевые возможности:
 * - Клик на целую одежду для генерации кусков.
 * - Куски появляются разбросанными вокруг места исходного предмета.
 * - Перетаскивание кусков (Drag and drop).
 * - Вращение кусков при клике и перетаскивании, когда показан курсор вращения.
 * - Выделенный кусок подсвечивается красной рамкой.
 * - Клик на кусок перемещает его на верхний слой (z-index).
 * - Курсор вращения показывается при наведении на выделенный кусок на расстоянии.
 */

// --- DOM Элементы ---
const whole_clothes_divs = document.querySelectorAll('.whole_clothes_div');
const upcycleSection = document.querySelector('.section.upcycle');

// --- Конфигурация ---
// Пути к изображениям кусков одежды
const clothes_pieces_data = {
    greenTshirt: ['./img/tshirt_upcycle_1.png', './img/tshirt_upcycle_2.png', './img/tshirt_upcycle_3.png', './img/tshirt_upcycle_4.png', './img/tshirt_upcycle_5.png'],
    blackTshirt: ['./img/blackTshirt_upcycle_1.png', './img/blackTshirt_upcycle_2.png', './img/blackTshirt_upcycle_3.png', './img/blackTshirt_upcycle_4.png', './img/blackTshirt_upcycle_5.png'],
    greySweater: ['./img/sweater_upcycle_1.png', './img/sweater_upcycle_2.png', './img/sweater_upcycle_3.png', './img/sweater_upcycle_4.png', './img/sweater_upcycle_5.png'],
    blueJeans: ['./img/jeans_upcycle_1.png', './img/jeans_upcycle_2.png', './img/jeans_upcycle_3.png', './img/jeans_upcycle_4.png'],
    denimJacket: ['./img/jeansJacket_upcycle_1.png', './img/jeansJacket_upcycle_2.png', './img/jeansJacket_upcycle_3.png', './img/jeansJacket_upcycle_4.png', './img/jeansJacket_upcycle_5.png', './img/jeansJacket_upcycle_6.png'],
    blueHoodie: ['./img/hoodie_upcycle_1.png', './img/hoodie_upcycle_2.png', './img/hoodie_upcycle_3.png', './img/hoodie_upcycle_4.png', './img/hoodie_upcycle_5.png', './img/hoodie_upcycle_6.png', './img/hoodie_upcycle_7.png'],
};

// Настройки для динамического порога вращения
const MINIMUM_ROTATION_THRESHOLD = 30; // Минимальный порог в пикселях (для очень маленьких кусков)
const ROTATION_THRESHOLD_FACTOR = 0.6; // Коэффициент от МЕНЬШЕЙ стороны куска (0.6 = 60%) для расчета порога

// Настройки эффекта "взрыва"
const explosionFactor = 0.2;          // Множитель базового расстояния разлета (относительно размера вещи)
const explosionRandomness = 5;       // Макс. случайных пикселей +/- к расстоянию разлета

// Настройки внешнего вида кусков
const pieceScale = 0.7;               // Коэффициент масштабирования кусков (настройте по вкусу)

// --- Переменные состояния ---
let selectedPiece = null;        // Текущий выделенный/перетаскиваемый кусок (элемент DOM)
let offsetX = 0, offsetY = 0;    // Смещение мыши относительно угла куска при перетаскивании
let initialRotation = 0;         // Градусы поворота куска в начале вращения
let startAngleDeg = 0;           // Градусы угла мыши относительно центра куска в начале вращения
let isDragging = false;          // Флаг: идет активное перетаскивание (mousedown + move)
let isRotating = false;          // Флаг: идет активное вращение (mousedown + move)
let currentMaxZIndex = 11;       // Отслеживает максимальный z-index для перемещения наверх

// --- Функция вычисления порога вращения ---
/**
 * Вычисляет порог расстояния для активации вращения на основе размера элемента.
 * @param {HTMLElement} element - Элемент кусочка одежды.
 * @returns {number} - Порог расстояния в пикселях.
 */
function getRotationThreshold(element) {
    if (!element) {
        return MINIMUM_ROTATION_THRESHOLD; // Возвращаем минимум, если элемента нет
    }
    const rect = element.getBoundingClientRect();
    // Возвращаем минимум, если размеры нулевые (например, элемент еще не отрисован)
    if (rect.width === 0 || rect.height === 0) {
        return MINIMUM_ROTATION_THRESHOLD;
    }
    // Берем меньшую сторону элемента (ширину или высоту)
    const smallerDimension = Math.min(rect.width, rect.height);
    // Вычисляем порог как % от меньшей стороны, но не меньше минимума
    const calculatedThreshold = smallerDimension * ROTATION_THRESHOLD_FACTOR;
    return Math.max(MINIMUM_ROTATION_THRESHOLD, calculatedThreshold);
}


// --- Обработчик курсора при наведении ---
/**
 * Обновляет курсор для выделенного куска в зависимости от расстояния при наведении.
 * Показывает курсор вращения, если мышь достаточно далеко от центра.
 * Работает постоянно через слушатель 'mousemove' на документе, пока кусок выделен.
 * @param {MouseEvent} e - Событие mousemove.
 */
function handleHoverCursor(e) {
    // Выполняется только если кусок выделен И НЕ идет активное перетаскивание/вращение
    if (!selectedPiece || isDragging || isRotating) {
        return;
    }

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const pieceRect = selectedPiece.getBoundingClientRect();
    if (pieceRect.width === 0 || pieceRect.height === 0) return; // Пропуск, если кусок не отрисован
    const centerXpiece = pieceRect.left + pieceRect.width / 2;
    const centerYpiece = pieceRect.top + pieceRect.height / 2;

    // Вычисляем расстояние от центра куска до мыши
    const distance = Math.sqrt(Math.pow(mouseX - centerXpiece, 2) + Math.pow(mouseY - centerYpiece, 2));

    // Получаем АКТУАЛЬНЫЙ порог для этого куска
    const currentThreshold = getRotationThreshold(selectedPiece);

    // Добавляем или убираем класс 'rotating' в зависимости от расстояния
    if (distance > currentThreshold) {
        selectedPiece.classList.add('rotating'); // Показываем курсор вращения
    } else {
        selectedPiece.classList.remove('rotating'); // Показываем стандартный курсор (grab)
    }
}


// --- Функция создания кусков одежды ---
/**
 * Создает элементы img для кусков одежды и позиционирует их.
 * @param {string} clothType - Тип одежды (ключ в clothes_pieces_data).
 * @param {DOMRect} containerRect - Границы исходного контейнера одежды (измерены ДО скрытия).
 */
function createPieces(clothType, containerRect) {
    const pieces = clothes_pieces_data[clothType];
    if (!pieces || pieces.length === 0) {
        console.error("Куски не найдены для типа:", clothType);
        return;
    }

    const sectionRect = upcycleSection.getBoundingClientRect();

    // --- Логирование ---
    console.log("--- Создание кусков ---");
    console.log("Полученные границы контейнера:", JSON.stringify(containerRect));
    console.log("Границы секции Upcycle:", JSON.stringify(sectionRect));
    // --- Конец логирования ---

    if (sectionRect.width === 0 || sectionRect.height === 0) {
        console.error("Секция Upcycle имеет нулевые размеры.", upcycleSection, sectionRect);
        return;
    }

    // Вычисляем центр исходного контейнера ОТНОСИТЕЛЬНО СЕКЦИИ
    const centerX = (containerRect.left - sectionRect.left) + containerRect.width / 2;
    const centerY = (containerRect.top - sectionRect.top) + containerRect.height / 2;

    console.log("Рассчитанный центр (относительно секции):", { x: centerX.toFixed(0), y: centerY.toFixed(0) });

    const totalPieces = pieces.length;
    // Базовое расстояние для "взрыва", зависит от меньшей стороны исходной вещи
    const baseDistance = Math.min(containerRect.width, containerRect.height) * explosionFactor;

    pieces.forEach((path, index) => {
        const piece_img = document.createElement('img');
        piece_img.src = path;
        piece_img.classList.add('clothing-piece');
        piece_img.style.position = 'absolute'; // Убеждаемся, что позиционирование абсолютное
        piece_img.dataset.rotation = "0";      // Изначальный поворот
        piece_img.style.zIndex = currentMaxZIndex; // Изначальный z-index
        // Применяем начальный transform (поворот 0 и масштаб)
        piece_img.style.transform = `rotate(0deg) scale(${pieceScale})`;
        piece_img.dataset.scale = pieceScale; // Сохраняем масштаб для использования при вращении

        // --- Алгоритм "Взрыва" ---
        // 1. Угол: Распределяем куски по кругу + случайное смещение
        const angleOffset = (Math.random() - 0.5) * (Math.PI / totalPieces); // Случ. смещение в пределах сектора
        const angle = (index / totalPieces) * Math.PI * 2 + angleOffset; // Базовый угол + смещение

        // 2. Расстояние: Базовое расстояние + случайность
        const distance = baseDistance + Math.random() * explosionRandomness - (explosionRandomness / 2); // Базовое +/- случайное значение

        // 3. Рассчитываем смещение X, Y от центра
        const pieceXoffset = distance * Math.cos(angle);
        const pieceYoffset = distance * Math.sin(angle);

        // 4. Рассчитываем финальные координаты top-left ОТНОСИТЕЛЬНО СЕКЦИИ
        const pieceLeftRelative = centerX + pieceXoffset;
        const pieceTopRelative = centerY + pieceYoffset;

        // --- Логирование перед применением стилей ---
        console.log(`Кусок ${index}: path=${path}`);
        console.log(`  >>> Рассчитано Left/Top (относ. секции)={ left: ${pieceLeftRelative.toFixed(0)}, top: ${pieceTopRelative.toFixed(0)} }`);
        // --- Конец логирования ---

        // Применяем рассчитанную позицию ПЕРЕД добавлением в DOM
        piece_img.style.left = `${pieceLeftRelative}px`;
        piece_img.style.top = `${pieceTopRelative}px`;

        // Добавляем кусок в секцию
        upcycleSection.appendChild(piece_img);

        // Добавляем слушатель для взаимодействия
        piece_img.addEventListener('mousedown', onPieceMouseDown);
    });
}

// --- Слушатель клика на целую одежду ---
whole_clothes_divs.forEach(cloth_div => {
    const cloth = cloth_div.querySelector('.whole_clothes');
    if (cloth) {
        cloth.addEventListener('click', () => {
            console.log("Клик на:", cloth_div.dataset.clothestype, cloth_div);

            // 1. ПОЛУЧАЕМ РАЗМЕРЫ *ДО* СКРЫТИЯ
            const containerRect = cloth_div.getBoundingClientRect();

            // 2. ПРОВЕРЯЕМ РАЗМЕРЫ
            if (containerRect.width === 0 || containerRect.height === 0 || containerRect.top === 0 && containerRect.left === 0 ) {
                console.error("!!! Границы исходного контейнера нулевые ПЕРЕД скрытием. Проверьте CSS или тайминги.", containerRect);
                return; // Прекращаем, если размеры некорректны
            }

            // 3. СКРЫВАЕМ ИСХОДНЫЕ ЭЛЕМЕНТЫ
            cloth.style.display = 'none';
            cloth_div.style.display = 'none';

            // 4. СОЗДАЕМ КУСКИ, ПЕРЕДАВАЯ ИЗМЕРЕННЫЕ ГРАНИЦЫ
            createPieces(cloth_div.dataset.clothestype, containerRect);

        }, { once: true }); // Гарантируем, что слушатель сработает только один раз
    } else {
        console.warn("Не найден элемент .whole_clothes внутри:", cloth_div);
    }
});

// --- Выделение и снятие выделения куска ---
/**
 * Выделяет кусок, подсвечивает, перемещает наверх и добавляет слушатель курсора при наведении.
 * @param {HTMLElement} piece - Элемент куска для выделения.
 */
function selectPiece(piece) {
    // Если был выделен другой кусок, снимаем с него выделение и слушатель наведения
    if (selectedPiece && selectedPiece !== piece) {
        selectedPiece.classList.remove('selected', 'grabbing', 'rotating');
        document.removeEventListener('mousemove', handleHoverCursor);
    }
    // Если повторно выделяем тот же кусок, слушатель может быть удален и добавлен снова - это нормально.

    selectedPiece = piece;
    selectedPiece.classList.add('selected'); // Добавляем класс для рамки
    selectedPiece.style.zIndex = ++currentMaxZIndex; // Перемещаем наверх

    // Добавляем слушатель для обновления курсора при наведении для НОВОГО выделенного куска
    document.addEventListener('mousemove', handleHoverCursor);
}

/**
 * Снимает выделение с текущего куска, убирает подсветку, классы и слушатель наведения.
 */
function deselectPiece() {
    if (selectedPiece) {
        selectedPiece.classList.remove('selected', 'grabbing', 'rotating'); // Убираем все классы состояния
        document.removeEventListener('mousemove', handleHoverCursor); // Убираем слушатель наведения
        selectedPiece = null; // Сбрасываем ссылку на выделенный кусок
    }
    isDragging = false; // Сбрасываем флаги взаимодействия на всякий случай
    isRotating = false;
}

// --- Обработчики событий мыши для кусков ---

/**
 * Обрабатывает 'mousedown' на куске. Определяет начальный режим (перетаскивание/вращение)
 * и устанавливает слушатели для активного взаимодействия.
 * @param {MouseEvent} e - Событие mousedown.
 */
function onPieceMouseDown(e) {
    // Убеждаемся, что клик был именно на куске
    if (e.target.classList.contains('clothing-piece')) {
        e.preventDefault(); // Предотвращаем стандартное перетаскивание изображений
        selectPiece(e.target); // Выделяем кусок (это также добавит слушатель handleHoverCursor)

        // Определяем начальный режим на основе расстояния клика от центра
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const pieceRect = selectedPiece.getBoundingClientRect();
        if (pieceRect.width === 0 || pieceRect.height === 0) return; // Проверка безопасности
        const centerXpiece = pieceRect.left + pieceRect.width / 2;
        const centerYpiece = pieceRect.top + pieceRect.height / 2;
        const distance = Math.sqrt(Math.pow(mouseX - centerXpiece, 2) + Math.pow(mouseY - centerYpiece, 2));

        // Получаем АКТУАЛЬНЫЙ порог вращения для этого куска
        const currentThreshold = getRotationThreshold(selectedPiece);

        // Используем вычисленный порог для определения начального режима
        if (distance > currentThreshold) {
            // НАЧИНАЕМ ВРАЩЕНИЕ
            isRotating = true;
            isDragging = false;
            selectedPiece.classList.add('rotating'); // Устанавливаем курсор вращения
            selectedPiece.classList.remove('grabbing'); // Убираем курсор перетаскивания
            // Запоминаем начальные данные для расчета вращения
            initialRotation = parseFloat(selectedPiece.dataset.rotation || 0);
            const startAngleRad = Math.atan2(mouseY - centerYpiece, mouseX - centerXpiece);
            startAngleDeg = startAngleRad * (180 / Math.PI);
        } else {
            // НАЧИНАЕМ ПЕРЕТАСКИВАНИЕ
            isRotating = false;
            isDragging = true;
            selectedPiece.classList.add('grabbing'); // Устанавливаем курсор перетаскивания
            selectedPiece.classList.remove('rotating'); // Убираем курсор вращения
            // Рассчитываем смещение мыши относительно угла элемента
            offsetX = mouseX - pieceRect.left;
            offsetY = mouseY - pieceRect.top;
        }

        // Добавляем слушатели на ВЕСЬ документ для отслеживания движения и отпускания мыши
        document.addEventListener('mousemove', onMouseMove); // Обрабатывает само перемещение/вращение
        document.addEventListener('mouseup', onMouseUp);     // Обрабатывает отпускание кнопки
    }
}

/**
 * Обрабатывает 'mousemove' *во время* активного нажатия (перетаскивания или вращения).
 * Выполняет действие (перемещение или вращение) на основе режима, установленного в onPieceMouseDown.
 * @param {MouseEvent} e - Событие mousemove.
 */
function onMouseMove(e) {
    // Не выполняем, если кусок не выделен (хотя это не должно случиться при активном mousedown)
    if (!selectedPiece) return;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Выполняем действие в зависимости от режима
    if (isDragging) {
        // Получаем актуальные границы секции
        const sectionRect = upcycleSection.getBoundingClientRect();
        // Рассчитываем новые координаты left/top относительно секции
        let newLeftRelative = mouseX - sectionRect.left - offsetX;
        let newTopRelative = mouseY - sectionRect.top - offsetY;

        // Опционально: Здесь можно добавить ограничения по границам секции

        // Применяем новые координаты
        selectedPiece.style.left = `${newLeftRelative}px`;
        selectedPiece.style.top = `${newTopRelative}px`;

    } else if (isRotating) {
        // Получаем актуальные границы куска для расчета центра
        const pieceRect = selectedPiece.getBoundingClientRect();
        if (pieceRect.width === 0 || pieceRect.height === 0) return; // Проверка
        const centerXpiece = pieceRect.left + pieceRect.width / 2;
        const centerYpiece = pieceRect.top + pieceRect.height / 2;

        // Рассчитываем текущий угол мыши относительно центра куска
        const currentAngleRad = Math.atan2(mouseY - centerYpiece, mouseX - centerXpiece);
        const currentAngleDeg = currentAngleRad * (180 / Math.PI);

        // Рассчитываем новый угол поворота (начальный угол + дельта)
        let newRotation = initialRotation + (currentAngleDeg - startAngleDeg);

        // Получаем текущий масштаб из dataset (если используется)
        const currentScale = parseFloat(selectedPiece.dataset.scale || 1);

        // Применяем transform (поворот и масштаб)
        selectedPiece.style.transform = `rotate(${newRotation}deg) scale(${currentScale})`;
        // Сохраняем новый угол поворота в dataset
        selectedPiece.dataset.rotation = newRotation;
    }
}

/**
 * Обрабатывает 'mouseup' в любом месте документа, завершая активное перетаскивание/вращение.
 * Удаляет активные слушатели и сбрасывает флаги состояния, но оставляет активным слушатель наведения.
 * @param {MouseEvent} e - Событие mouseup.
 */
function onMouseUp(e) {
    // Удаляем слушатели активного действия (перемещения/вращения)
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    const wasInteracting = isDragging || isRotating; // Запоминаем, было ли взаимодействие

    // Сбрасываем флаги активного действия
    isDragging = false;
    isRotating = false;

    // Убираем активные классы курсора (.grabbing)
    if (selectedPiece) {
        selectedPiece.classList.remove('grabbing');
        // Класс .rotating будет управляться через handleHoverCursor
        // Вызываем handleHoverCursor вручную, чтобы немедленно обновить курсор
        // до состояния наведения после отпускания кнопки
        if (wasInteracting) { // Вызываем только если было активное действие
           handleHoverCursor(e); // Передаем событие для получения координат мыши
        }
    }
    // Слушатель handleHoverCursor остается активным, если кусок все еще выделен
}

// --- Слушатель клика вне кусков для снятия выделения ---
upcycleSection.addEventListener('mousedown', (e) => {
    // Если клик произошел НЕ по куску (или его потомку)
    if (!e.target.closest('.clothing-piece')) {
        deselectPiece(); // Снимаем выделение
    }
});

// --- Конец скрипта ---