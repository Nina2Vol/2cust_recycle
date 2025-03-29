
const baseCanvas = document.getElementById('tshirt_base_canvas');
const baseCtx = baseCanvas.getContext('2d');
const drawCanvas = document.getElementById('tshirt_drawing_canvas');
const drawCtx = drawCanvas.getContext('2d');
const colorPicker = document.getElementById('color_picker');
const brushSize = document.getElementById('brush_size');
const brushSizeValue = document.getElementById('brush_size_value');
const clearBtn = document.getElementById('clear_button');
const publishBtn = document.getElementById('publish_button');
const galleryContainer = document.getElementById('gallery_container');
const saveInfo = document.getElementById('save_Info');


let isDrawing = false;
let lastX = 0;
let lastY = 0;

let designs = JSON.parse(localStorage.getItem('tshirtDesigns')) || [];
let canvasOffsetX = 0;
let canvasOffsetY = 0;


const brushTypes = {
    NORMAL: 'normal',
    PENCIL: 'pencil',
    MARKER: 'marker',
    AIRBRUSH: 'airbrush',
    ERASER: 'eraser'
};

let currentBrush = brushTypes.NORMAL;
let isErasing = false;


function updateRangeFill(input) {
  if (!input) return;
  const min = input.min || 0;
  const max = input.max || 100;
  const val = input.value;
  const percentage = ((val - min) / (max - min)) * 100;
  input.style.background = `linear-gradient(to right, #000000 0%, #000000 ${percentage}%, #ccc ${percentage}%, #ccc 100%)`;
}


function updateBrushSize() {
    if (brushSize && brushSizeValue) { 
        brushSizeValue.textContent = brushSize.value;
    }
}


function setupEventListeners () {
    
    if (drawCanvas) {
        drawCanvas.addEventListener('mousedown', startDrawing);
        drawCanvas.addEventListener('mousemove', draw);
        drawCanvas.addEventListener('mouseup', stopDrawing);
        drawCanvas.addEventListener('mouseout', stopDrawing);
    } else {
        console.error("Элемент drawCanvas не найден!");
    }

    if (brushSize) {
        brushSize.addEventListener('input', () => {
            updateBrushSize();
            updateRangeFill(brushSize); 
        });
    } else {
         console.error("Элемент brushSize не найден!");
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearDrawing);
    } else {
        console.error("Элемент clearBtn не найден!");
    }

    if (publishBtn) {
        publishBtn.addEventListener('click', publishDesign);
    } else {
        console.error("Элемент publishBtn не найден!");
    }

    
    
    document.getElementById('normal_brush_btn')?.addEventListener('click', () => setBrush(brushTypes.NORMAL));
    document.getElementById('pencil_brush_btn')?.addEventListener('click', () => setBrush(brushTypes.PENCIL));
    document.getElementById('marker_brush_btn')?.addEventListener('click', () => setBrush(brushTypes.MARKER));
    document.getElementById('airbrush_brush_btn')?.addEventListener('click', () => setBrush(brushTypes.AIRBRUSH));
    document.getElementById('eraser_brush_btn')?.addEventListener('click', () => setBrush(brushTypes.ERASER));
}


function initCanvas () {
    
    const container = document.querySelector('.canvas_container');
    if (!container || !baseCanvas || !drawCanvas) {
        console.error("Не найден контейнер или один из канвасов для инициализации.");
        return;
    }
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) {
        console.warn("Контейнер канваса имеет нулевые размеры при инициализации.");
        
        
        
    }


    baseCanvas.width = drawCanvas.width = containerWidth;
    baseCanvas.height = drawCanvas.height = containerHeight;

    const tshirtImg = new Image();
    tshirtImg.crossOrigin = "Anonymous";
    tshirtImg.src = 'img/tshirt.png';

    tshirtImg.onload = function () {
        if (containerWidth === 0 || containerHeight === 0) {
             console.warn("Размеры контейнера все еще 0 при загрузке изображения. Изображение не будет отрисовано.");
             return;
        }
        const imgRatio = tshirtImg.width / tshirtImg.height;
        const canvasRatio = containerWidth / containerHeight;
        let renderWidth, renderHeight;
        if (imgRatio > canvasRatio) {
            renderWidth = containerWidth * 0.9;
            renderHeight = renderWidth / imgRatio;
        }
        else {
            renderHeight = containerHeight * 0.9;
            renderWidth = renderHeight * imgRatio;
        }
        canvasOffsetX = (containerWidth - renderWidth) / 2;
        canvasOffsetY = (containerHeight - renderHeight) / 2;

        baseCtx.clearRect(0, 0, containerWidth, containerHeight);
        baseCtx.fillStyle = '#ebebeb'; 
        baseCtx.fillRect(0, 0, containerWidth, containerHeight);
        baseCtx.drawImage(tshirtImg, canvasOffsetX, canvasOffsetY, renderWidth, renderHeight);

        drawCtx.clearRect(0, 0, containerWidth, containerHeight);
    };

    tshirtImg.onerror = function() {
        console.error("Не удалось загрузить изображение футболки");
        if (baseCtx) {
            baseCtx.fillStyle = '#e0e0e0'; 
            baseCtx.fillRect(0, 0, containerWidth, containerHeight);
        }
    };
}

function clearDrawing () {
    if (drawCtx && drawCanvas) {
        drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    }
}


function setBrush(brushType) {
    currentBrush = brushType;
    isErasing = (brushType === brushTypes.ERASER);

    document.querySelectorAll('.brush_btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = document.getElementById(`${brushType}_brush_btn`);
    if (activeButton) {
        activeButton.classList.add('active');
    } else {
        console.warn(`Кнопка для кисти ${brushType} не найдена.`);
    }
}

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!isDrawing || !drawCtx) return;

    if (isErasing) {
        drawCtx.globalCompositeOperation = 'destination-out';
        drawCtx.strokeStyle = 'rgba(0,0,0,1)'; 
    }
    else {
        drawCtx.globalCompositeOperation = 'source-over';
        drawCtx.strokeStyle = colorPicker ? colorPicker.value : '#000000'; 
    }

    const currentBrushSize = brushSize ? brushSize.value : 5; 

    switch (currentBrush) {
        case brushTypes.NORMAL:
            drawCtx.lineWidth = currentBrushSize;
            drawCtx.lineCap = 'round';
            drawCtx.beginPath();
            drawCtx.moveTo(lastX, lastY);
            drawCtx.lineTo(e.offsetX, e.offsetY);
            drawCtx.stroke();
            break;

        case brushTypes.PENCIL:
            drawCtx.lineWidth = currentBrushSize * 0.5;
            drawCtx.lineCap = 'square';
            drawCtx.beginPath();
            drawCtx.moveTo(lastX, lastY);
            drawCtx.lineTo(e.offsetX, e.offsetY);
            drawCtx.stroke();
            break;

       case brushTypes.MARKER:
            drawCtx.globalAlpha = 0.6; 
            drawCtx.lineWidth = currentBrushSize * 2; 
            drawCtx.lineCap = 'butt'; 
            drawCtx.lineJoin = 'butt'; 
            drawCtx.beginPath();
            drawCtx.moveTo(lastX, lastY);
            drawCtx.lineTo(e.offsetX, e.offsetY);
            drawCtx.stroke();
            drawCtx.globalAlpha = 1.0; 
            break;

            case brushTypes.AIRBRUSH:
                const sprayRadius = currentBrushSize; 
                const density = 20; 
                drawCtx.globalAlpha = 0.2; 
                const brushColor = colorPicker ? colorPicker.value : '#000000';
                drawCtx.fillStyle = brushColor; 
    
                
                
                const particleRadius = Math.max(1.5, currentBrushSize / 6); 
    
                for (let i = 0; i < density; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    
                    const distance = Math.random() * sprayRadius;
                    const x = e.offsetX + Math.cos(angle) * distance;
                    const y = e.offsetY + Math.sin(angle) * distance;
    
                    
                    drawCtx.beginPath();
                    drawCtx.arc(x, y, particleRadius, 0, Math.PI * 2); 
                    drawCtx.fill(); 
                }
                drawCtx.globalAlpha = 1.0; 
                break;

        case brushTypes.ERASER:
            drawCtx.lineWidth = currentBrushSize * 1.5;
            drawCtx.lineCap = 'round';
            drawCtx.beginPath();
            drawCtx.moveTo(lastX, lastY);
            drawCtx.lineTo(e.offsetX, e.offsetY);
            drawCtx.stroke();
            break;
    }

    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
    isDrawing = false;
}

function publishDesign () {
    if (!baseCanvas || !drawCanvas) {
        console.error("Не найдены канвасы для публикации дизайна.");
        return;
    }
    const tempCanvas = document.createElement ("canvas");
    tempCanvas.width = baseCanvas.width;
    tempCanvas.height = baseCanvas.height;

    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(baseCanvas, 0, 0); 
    tempCtx.drawImage(drawCanvas, 0, 0); 

    const imageData = tempCanvas.toDataURL('image/png', 0.7); 

    designs.push({
        id: Date.now(),
        image: imageData,
        date: new Date().toLocaleString() 
    });

    
    localStorage.setItem('tshirtDesigns', JSON.stringify(designs));
    showSaveNotification();
    renderGallery(); 
}

function showSaveNotification() {
    if (saveInfo) {
        saveInfo.textContent = 'Дизайн сохранен!';
        saveInfo.style.display = 'block';

        setTimeout(() => {
            saveInfo.style.display = 'none';
        }, 3000);
    }
}

function renderGallery () {
    
    if (!galleryContainer) {
      console.error("Элемент #gallery_container не найден при попытке рендера!");
      return; 
    }

    galleryContainer.innerHTML = ''; 

    if (designs.length === 0) {
        galleryContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #555; font-family: \'Roboto Condensed\', sans-serif;">У вас пока нет сохраненных дизайнов</p>';
        return;
    }

    
    const sortedDesigns = [...designs].sort((a, b) => b.id - a.id);

    sortedDesigns.forEach(design => {
        const designElement = document.createElement('div');
        designElement.className = 'gallery-item';
        designElement.innerHTML = `
            <img src="${design.image}" alt="Дизайн футболки" loading="lazy"> <!-- Добавили lazy loading -->
            <div class="gallery-item-info">
                <span class="gallery-item-date">${design.date}</span>
                <button class="delete-btn" data-id="${design.id}">Удалить</button>
            </div>
        `;
        galleryContainer.appendChild(designElement);
    });

    
    galleryContainer.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            
            const galleryItem = this.closest('.gallery-item');
            const id = parseInt(this.dataset.id);
            
            if (galleryItem) {
                 galleryItem.style.transition = 'opacity 0.3s ease-out';
                 galleryItem.style.opacity = '0';
                 
                 setTimeout(() => deleteDesign(id), 300);
            } else {
                 
                 deleteDesign(id);
            }
        });
    });
}

function deleteDesign(id) {
    
    designs = designs.filter(design => design.id !== id);
    
    localStorage.setItem('tshirtDesigns', JSON.stringify(designs));
    
    
    
    
    
    renderGallery();
}



document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded - Initializing Customization...");
    
    
    
    
        
        initCanvas();
        setupEventListeners();

        
        if (brushSize) {
            updateBrushSize();
            updateRangeFill(brushSize);
        }

        
        renderGallery();
    

    
    
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
             console.log("Window resized - Reinitializing canvas...");
             initCanvas();
             
        }, 250); 
    });

});





