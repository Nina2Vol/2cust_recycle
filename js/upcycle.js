const whole_clothes_divs = document.querySelectorAll('.whole_clothes_div');
const upcycleSection = document.querySelector('.section.upcycle');



const clothes_pieces_data = {
    greenTshirt: ['./img/tshirt_upcycle_1.png', './img/tshirt_upcycle_2.png', './img/tshirt_upcycle_3.png', './img/tshirt_upcycle_4.png', './img/tshirt_upcycle_5.png'],
    blackTshirt: ['./img/blackTshirt_upcycle_1.png', './img/blackTshirt_upcycle_2.png', './img/blackTshirt_upcycle_3.png', './img/blackTshirt_upcycle_4.png', './img/blackTshirt_upcycle_5.png'],
    greySweater: ['./img/sweater_upcycle_1.png', './img/sweater_upcycle_2.png', './img/sweater_upcycle_3.png', './img/sweater_upcycle_4.png', './img/sweater_upcycle_5.png'],
    blueJeans: ['./img/jeans_upcycle_1.png', './img/jeans_upcycle_2.png', './img/jeans_upcycle_3.png', './img/jeans_upcycle_4.png'],
    denimJacket: ['./img/jeansJacket_upcycle_1.png', './img/jeansJacket_upcycle_2.png', './img/jeansJacket_upcycle_3.png', './img/jeansJacket_upcycle_4.png', './img/jeansJacket_upcycle_5.png', './img/jeansJacket_upcycle_6.png'],
    blueHoodie: ['./img/hoodie_upcycle_1.png', './img/hoodie_upcycle_2.png', './img/hoodie_upcycle_3.png', './img/hoodie_upcycle_4.png', './img/hoodie_upcycle_5.png', './img/hoodie_upcycle_6.png', './img/hoodie_upcycle_7.png'],
};


const MINIMUM_ROTATION_THRESHOLD = 30; 
const ROTATION_THRESHOLD_FACTOR = 0.6; 


const explosionFactor = 0.2;          
const explosionRandomness = 5;       


const pieceScale = 0.7;               


let selectedPiece = null;        
let offsetX = 0, offsetY = 0;    
let initialRotation = 0;         
let startAngleDeg = 0;           
let isDragging = false;          
let isRotating = false;          
let currentMaxZIndex = 11;       


/**
 * Вычисляет порог расстояния для активации вращения на основе размера элемента.
 * @param {HTMLElement} element - Элемент кусочка одежды.
 * @returns {number} - Порог расстояния в пикселях.
 */
function getRotationThreshold(element) {
    if (!element) {
        return MINIMUM_ROTATION_THRESHOLD; 
    }
    const rect = element.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) {
        return MINIMUM_ROTATION_THRESHOLD;
    }
    
    const smallerDimension = Math.min(rect.width, rect.height);
    
    const calculatedThreshold = smallerDimension * ROTATION_THRESHOLD_FACTOR;
    return Math.max(MINIMUM_ROTATION_THRESHOLD, calculatedThreshold);
}



/**
 * Обновляет курсор для выделенного куска в зависимости от расстояния при наведении.
 * Показывает курсор вращения, если мышь достаточно далеко от центра.
 * Работает постоянно через слушатель 'mousemove' на документе, пока кусок выделен.
 * @param {MouseEvent} e - Событие mousemove.
 */
function handleHoverCursor(e) {
    
    if (!selectedPiece || isDragging || isRotating) {
        return;
    }

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const pieceRect = selectedPiece.getBoundingClientRect();
    if (pieceRect.width === 0 || pieceRect.height === 0) return; 
    const centerXpiece = pieceRect.left + pieceRect.width / 2;
    const centerYpiece = pieceRect.top + pieceRect.height / 2;

    
    const distance = Math.sqrt(Math.pow(mouseX - centerXpiece, 2) + Math.pow(mouseY - centerYpiece, 2));

    
    const currentThreshold = getRotationThreshold(selectedPiece);

    
    if (distance > currentThreshold) {
        selectedPiece.classList.add('rotating'); 
    } else {
        selectedPiece.classList.remove('rotating'); 
    }
}



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

    
    console.log("--- Создание кусков ---");
    console.log("Полученные границы контейнера:", JSON.stringify(containerRect));
    console.log("Границы секции Upcycle:", JSON.stringify(sectionRect));
    

    if (sectionRect.width === 0 || sectionRect.height === 0) {
        console.error("Секция Upcycle имеет нулевые размеры.", upcycleSection, sectionRect);
        return;
    }

    
    const centerX = (containerRect.left - sectionRect.left) + containerRect.width / 2;
    const centerY = (containerRect.top - sectionRect.top) + containerRect.height / 2;

    console.log("Рассчитанный центр (относительно секции):", { x: centerX.toFixed(0), y: centerY.toFixed(0) });

    const totalPieces = pieces.length;
    
    const baseDistance = Math.min(containerRect.width, containerRect.height) * explosionFactor;

    pieces.forEach((path, index) => {
        const piece_img = document.createElement('img');
        piece_img.src = path;
        piece_img.classList.add('clothing-piece');
        piece_img.style.position = 'absolute'; 
        piece_img.dataset.rotation = "0";      
        piece_img.style.zIndex = currentMaxZIndex; 
        
        piece_img.style.transform = `rotate(0deg) scale(${pieceScale})`;
        piece_img.dataset.scale = pieceScale; 

        
        
        const angleOffset = (Math.random() - 0.5) * (Math.PI / totalPieces); 
        const angle = (index / totalPieces) * Math.PI * 2 + angleOffset; 

        
        const distance = baseDistance + Math.random() * explosionRandomness - (explosionRandomness / 2); 

        
        const pieceXoffset = distance * Math.cos(angle);
        const pieceYoffset = distance * Math.sin(angle);

        
        const pieceLeftRelative = centerX + pieceXoffset;
        const pieceTopRelative = centerY + pieceYoffset;

        
        console.log(`Кусок ${index}: path=${path}`);
        console.log(`  >>> Рассчитано Left/Top (относ. секции)={ left: ${pieceLeftRelative.toFixed(0)}, top: ${pieceTopRelative.toFixed(0)} }`);
        

        
        piece_img.style.left = `${pieceLeftRelative}px`;
        piece_img.style.top = `${pieceTopRelative}px`;

        
        upcycleSection.appendChild(piece_img);

        
        piece_img.addEventListener('mousedown', onPieceMouseDown);
    });
}


whole_clothes_divs.forEach(cloth_div => {
    const cloth = cloth_div.querySelector('.whole_clothes');
    if (cloth) {
        cloth.addEventListener('click', () => {
            console.log("Клик на:", cloth_div.dataset.clothestype, cloth_div);

            
            const containerRect = cloth_div.getBoundingClientRect();

            
            if (containerRect.width === 0 || containerRect.height === 0 || containerRect.top === 0 && containerRect.left === 0 ) {
                console.error("!!! Границы исходного контейнера нулевые ПЕРЕД скрытием. Проверьте CSS или тайминги.", containerRect);
                return; 
            }

            
            cloth.style.display = 'none';
            cloth_div.style.display = 'none';

            
            createPieces(cloth_div.dataset.clothestype, containerRect);

        }, { once: true }); 
    } else {
        console.warn("Не найден элемент .whole_clothes внутри:", cloth_div);
    }
});


/**
 * Выделяет кусок, подсвечивает, перемещает наверх и добавляет слушатель курсора при наведении.
 * @param {HTMLElement} piece - Элемент куска для выделения.
 */
function selectPiece(piece) {
    
    if (selectedPiece && selectedPiece !== piece) {
        selectedPiece.classList.remove('selected', 'grabbing', 'rotating');
        document.removeEventListener('mousemove', handleHoverCursor);
    }
    

    selectedPiece = piece;
    selectedPiece.classList.add('selected'); 
    selectedPiece.style.zIndex = ++currentMaxZIndex; 

    
    document.addEventListener('mousemove', handleHoverCursor);
}

/**
 * Снимает выделение с текущего куска, убирает подсветку, классы и слушатель наведения.
 */
function deselectPiece() {
    if (selectedPiece) {
        selectedPiece.classList.remove('selected', 'grabbing', 'rotating'); 
        document.removeEventListener('mousemove', handleHoverCursor); 
        selectedPiece = null; 
    }
    isDragging = false; 
    isRotating = false;
}



/**
 * Обрабатывает 'mousedown' на куске. Определяет начальный режим (перетаскивание/вращение)
 * и устанавливает слушатели для активного взаимодействия.
 * @param {MouseEvent} e - Событие mousedown.
 */
function onPieceMouseDown(e) {
    
    if (e.target.classList.contains('clothing-piece')) {
        e.preventDefault(); 
        selectPiece(e.target); 

        
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const pieceRect = selectedPiece.getBoundingClientRect();
        if (pieceRect.width === 0 || pieceRect.height === 0) return; 
        const centerXpiece = pieceRect.left + pieceRect.width / 2;
        const centerYpiece = pieceRect.top + pieceRect.height / 2;
        const distance = Math.sqrt(Math.pow(mouseX - centerXpiece, 2) + Math.pow(mouseY - centerYpiece, 2));

        
        const currentThreshold = getRotationThreshold(selectedPiece);

        
        if (distance > currentThreshold) {
            
            isRotating = true;
            isDragging = false;
            selectedPiece.classList.add('rotating'); 
            selectedPiece.classList.remove('grabbing'); 
            
            initialRotation = parseFloat(selectedPiece.dataset.rotation || 0);
            const startAngleRad = Math.atan2(mouseY - centerYpiece, mouseX - centerXpiece);
            startAngleDeg = startAngleRad * (180 / Math.PI);
        } else {
            
            isRotating = false;
            isDragging = true;
            selectedPiece.classList.add('grabbing'); 
            selectedPiece.classList.remove('rotating'); 
            
            offsetX = mouseX - pieceRect.left;
            offsetY = mouseY - pieceRect.top;
        }

        
        document.addEventListener('mousemove', onMouseMove); 
        document.addEventListener('mouseup', onMouseUp);     
    }
}

/**
 * Обрабатывает 'mousemove' *во время* активного нажатия (перетаскивания или вращения).
 * Выполняет действие (перемещение или вращение) на основе режима, установленного в onPieceMouseDown.
 * @param {MouseEvent} e - Событие mousemove.
 */
function onMouseMove(e) {
    
    if (!selectedPiece) return;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    
    if (isDragging) {
        
        const sectionRect = upcycleSection.getBoundingClientRect();
        
        let newLeftRelative = mouseX - sectionRect.left - offsetX;
        let newTopRelative = mouseY - sectionRect.top - offsetY;

        

        
        selectedPiece.style.left = `${newLeftRelative}px`;
        selectedPiece.style.top = `${newTopRelative}px`;

    } else if (isRotating) {
        
        const pieceRect = selectedPiece.getBoundingClientRect();
        if (pieceRect.width === 0 || pieceRect.height === 0) return; 
        const centerXpiece = pieceRect.left + pieceRect.width / 2;
        const centerYpiece = pieceRect.top + pieceRect.height / 2;

        
        const currentAngleRad = Math.atan2(mouseY - centerYpiece, mouseX - centerXpiece);
        const currentAngleDeg = currentAngleRad * (180 / Math.PI);

        
        let newRotation = initialRotation + (currentAngleDeg - startAngleDeg);

        
        const currentScale = parseFloat(selectedPiece.dataset.scale || 1);

        
        selectedPiece.style.transform = `rotate(${newRotation}deg) scale(${currentScale})`;
        
        selectedPiece.dataset.rotation = newRotation;
    }
}

/**
 * Обрабатывает 'mouseup' в любом месте документа, завершая активное перетаскивание/вращение.
 * Удаляет активные слушатели и сбрасывает флаги состояния, но оставляет активным слушатель наведения.
 * @param {MouseEvent} e - Событие mouseup.
 */
function onMouseUp(e) {
    
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    const wasInteracting = isDragging || isRotating; 

    
    isDragging = false;
    isRotating = false;

    
    if (selectedPiece) {
        selectedPiece.classList.remove('grabbing');
        
        
        
        if (wasInteracting) { 
           handleHoverCursor(e); 
        }
    }
    
}


upcycleSection.addEventListener('mousedown', (e) => {
    
    if (!e.target.closest('.clothing-piece')) {
        deselectPiece(); 
    }
});

