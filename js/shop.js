
import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { GLTFLoader } from 'GLTFLoader';

const shopPathModels = [
    '/2cust_recycle/models/product01.glb',
    '/2cust_recycle/models/product02.glb',
    '/2cust_recycle/models/product03.glb',
    '/2cust_recycle/models/product04.glb',
    '/2cust_recycle/models/product05.glb',
    '/2cust_recycle/models/product06.glb',
];

const productData = [
    { name: 'Объект #01', size: 'S/M', description: 'Создан из 1 свитера и 1 кардигана', art: 'АРТ. 01022001' },
    { name: 'Объект #02', size: 'M/L', description: 'Создан из 3 свитеров и 2 кардиганов', art: 'АРТ. 01022025' },
    { name: 'Объект #03', size: 'L/XL', description: 'Создан из 2 свитеров', art: 'АРТ. 01022003' },
    { name: 'Объект #04', size: 'M', description: 'Создан из 1 свитера и 2 кардиганов', art: 'АРТ. 01022004' },
    { name: 'Объект #05', size: 'Free Size', description: 'Создан из 4 различных частей', art: 'АРТ. 01022005' },
    { name: 'Объект #06', size: 'M/L', description: 'Создан из 2 свитеров', art: 'АРТ. 01022006' },
];

// DOM Элементы (без изменений)
const cards = document.querySelectorAll('.card');
const productModal = document.getElementById('product_modal');
const closeModalBtn = document.getElementById('modal_close_btn');
const modal3dContainer = document.getElementById('product3d_container');
const modalProductName = document.getElementById('modal_product_name');
const modalProductDetails = document.getElementById('modal_product_details');
const modalArt = document.querySelector('.modal-art');

// Three.js Переменные (без изменений)
let scene, camera, renderer, controls, loader;
let shopModels = [];
let currentModel = null;
let isRendererInitialized = false;

// --- Инициализация Three.js ---
function initThree() {
    // Сцена
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#e9e9e9');

    // Камера --- ИЗМЕНЕНИЕ ---
    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 4.5); // X=0, Y=0, Z=4.5 (приближено)

    // Рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Мягкие тени
    // Настройки для лучшего отображения цветов и яркости (рекомендуется)
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Более кинематографичный вид
    renderer.toneMappingExposure = 1.0; // Экспозиция (можно подбирать 0.8 - 1.2)
    renderer.outputColorSpace = THREE.SRGBColorSpace; // Корректное цветовое пространство для вывода

    // --- Освещение (ИЗМЕНЕНИЯ) ---
    // 1. Убираем AmbientLight
    // const amLight = new THREE.AmbientLight(0xeeeeee, 0.8);
    // scene.add(amLight);

    // 2. Добавляем HemisphereLight для мягкого света сверху и снизу
    //    Небо (светло-голубоватый/белый), Земля (сероватый/теплый), Интенсивность
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 2.5); // Интенсивность 2.5 - довольно ярко!
    scene.add(hemiLight);

    // 3. Направленный свет (основной) - немного УМЕНЬШИМ интенсивность
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0); // БЫЛО 1.2, стало 1.0
    dirLight1.position.set(-5, 8, 5);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    dirLight1.shadow.camera.near = 0.5;
    dirLight1.shadow.camera.far = 50;
    // Уменьшим "размытие" тени, если нужно (PCFSoft дает мягкость, но можно настроить bias)
    dirLight1.shadow.bias = -0.0005; // Помогает избежать "acne" на тенях
    scene.add(dirLight1);

    // 4. Направленный свет (заполняющий) - можно оставить или чуть уменьшить
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4); // БЫЛО 0.6, стало 0.4
    dirLight2.position.set(5, 3, -5);
    scene.add(dirLight2);
    // ---------------------------------

    // Управление (OrbitControls) --- ИЗМЕНЕНИЕ ---
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 15;
    controls.target.set(0, 0, 0); // Центр вращения в начале координат

    // Загрузчик GLTF
    loader = new GLTFLoader();

    loadModels();
    animate();
}

// --- Загрузка моделей ---
function loadModels() {
    if (!loader) {
        console.error("GLTFLoader не инициализирован!");
        return;
    }
    console.log("Загрузка моделей...");
    shopPathModels.forEach((path, index) => {
        loader.load(path, (gltf) => {
            const model = gltf.scene;

            // --- ИЗМЕНЕНИЕ ---
            model.scale.set(1.5, 1.5, 1.5); // Масштаб оставляем пока
            model.position.set(0, 0, 0); // Ставим модель в центр координат

            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    // Опционально: Улучшение материалов, если стандартные выглядят плоско
                     if (node.material) {
                         // node.material.metalness = 0.1; // Чуть менее матовый
                         // node.material.roughness = 0.8; // Чуть более шероховатый
                     }
                }
            });

            shopModels[index] = model;
            console.log(`Модель ${index + 1} (${path}) загружена`);
        },
        undefined, // Прогресс загрузки (можно добавить)
        (error) => {
            console.error(`Ошибка загрузки модели ${index + 1} (${path}):`, error);
            shopModels[index] = null;
        });
    });
}

// --- Открытие модального окна ---
// (Логика показа окна, добавления/удаления модели остается без изменений)
function openModal(index) {
    console.log(`--- openModal called for index: ${index} ---`);

    const data = productData[index];
    if (!data) {
        console.error(`Нет данных в productData для индекса: ${index}`);
        return;
    }
    if (shopModels[index] === undefined) {
         console.warn(`Модель ${index + 1} еще не начала загружаться или не существует.`);
         modal3dContainer.innerHTML = '<p style="text-align:center; padding-top: 50px;">Загрузка данных...</p>';
    }

    modalProductName.textContent = data.name;
    modalProductDetails.innerHTML = `${data.size}<br>УНИСЕКС<br>${data.description}`;
    modalArt.textContent = data.art;

    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
        console.log("Предыдущая модель удалена со сцены");
    }

    const model = shopModels[index];

    if (model) {
        scene.add(model);
        currentModel = model;
        console.log(`Модель ${index + 1} добавлена на сцену`);
         if (!modal3dContainer.contains(renderer.domElement)) {
             modal3dContainer.innerHTML = '';
         }

    } else if (shopModels[index] === null) {
        console.error(`Модель ${index + 1} не была загружена.`);
        modal3dContainer.innerHTML = '<p style="text-align:center; padding-top: 50px;">Не удалось загрузить 3D модель.</p>';
        if (modal3dContainer.contains(renderer.domElement)) {
            modal3dContainer.removeChild(renderer.domElement);
            isRendererInitialized = false;
        }

    } else {
        console.log(`Модель ${index + 1} еще загружается...`);
        modal3dContainer.innerHTML = '<p style="text-align:center; padding-top: 50px;">Загрузка 3D модели...</p>';
        if (modal3dContainer.contains(renderer.domElement)) {
            modal3dContainer.removeChild(renderer.domElement);
            isRendererInitialized = false;
        }
        setTimeout(() => {
            const stillOpen = productModal.style.display === 'block';
            const expectingThisModel = !currentModel || shopModels.indexOf(currentModel) === index;
            if (stillOpen && expectingThisModel && shopModels[index]) {
                console.log(`Модель ${index + 1} загрузилась (в таймауте)`);
                modal3dContainer.innerHTML = '';
                if (!isRendererInitialized) {
                   modal3dContainer.appendChild(renderer.domElement);
                   isRendererInitialized = true;
                }
                // Проверка перед добавлением, если вдруг модель уже есть (маловероятно)
                 if (!scene.children.includes(shopModels[index])){
                    scene.add(shopModels[index]);
                 }
                currentModel = shopModels[index];
                resizeRendererToDisplaySize();
                if (controls) controls.update();
            } else if (stillOpen && expectingThisModel) {
                 console.error(`Таймаут ожидания модели ${index + 1} истек, модель не загружена.`);
                 if (modal3dContainer.innerHTML.includes('Загрузка')) {
                    modal3dContainer.innerHTML = '<p style="text-align:center; padding-top: 50px;">Не удалось загрузить 3D модель (таймаут).</p>';
                 }
            }
        }, 3000);
    }

    productModal.style.display = 'block';
    document.body.classList.add('modal-open');
    console.log("Модальное окно показано (display=block)");

    if (!isRendererInitialized && shopModels[index] !== null) {
        console.log("Инициализация рендерера: добавление canvas в DOM");
        if (!modal3dContainer.contains(renderer.domElement)) {
             modal3dContainer.innerHTML = '';
             modal3dContainer.appendChild(renderer.domElement);
             isRendererInitialized = true;
        }
    } else if (isRendererInitialized && !modal3dContainer.contains(renderer.domElement) && shopModels[index] !== null) {
        console.log("Пере-добавление canvas в DOM");
        modal3dContainer.innerHTML = '';
        modal3dContainer.appendChild(renderer.domElement);
    }

    requestAnimationFrame(() => {
        console.log("Запрос на обновление размеров рендерера");
        resizeRendererToDisplaySize();
        if (controls) {
            // Сбросим и обновим контроллер после изменения цели/позиции
            controls.reset(); // Сбрасывает состояние контроллера к начальному
            controls.update();
        } else {
            console.error("Controls не инициализирован при попытке update в openModal!");
        }
    });
    console.log(`--- openModal finished for index: ${index} ---`);
}

// --- Закрытие модального окна --- (без изменений)
function closeModal() {
    console.log("Закрытие модального окна...");
    productModal.style.display = 'none';
    document.body.classList.remove('modal-open');

    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
        console.log("Модель удалена со сцены");
    }
}

// --- Обновление размеров рендерера и камеры --- (без изменений)
function resizeRendererToDisplaySize() {
    if (!renderer || !camera || !modal3dContainer) {
         console.warn("resizeRendererToDisplaySize: Пропущен вызов из-за отсутствия renderer, camera или container");
         return;
    }
    if (!isRendererInitialized || !modal3dContainer.contains(renderer.domElement)) {
        console.warn("resizeRendererToDisplaySize: Пропущен вызов, renderer не в DOM");
        return;
    }

    const canvas = renderer.domElement;
    const width = modal3dContainer.clientWidth;
    const height = modal3dContainer.clientHeight;

    if (width === 0 || height === 0) {
        console.warn(`resizeRendererToDisplaySize: Контейнер имеет нулевые размеры (${width}x${height}), ресайз пропущен.`);
        return;
    }

    const needResize = canvas.width !== width || canvas.height !== height;

    if (needResize) {
        console.log(`Применение ресайза рендерера: ${width} x ${height}`);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
}

// --- Цикл анимации (Рендеринг) --- (без изменений)
function animate() {
    requestAnimationFrame(animate);
    if (productModal.style.display === 'block' && currentModel && controls) {
        controls.update();
        renderer.render(scene, camera);
    }
}

// --- Обработчики событий --- (без изменений)
if (cards.length > 0) {
    console.log(`Найдено карточек: ${cards.length}. Установка обработчиков клика...`);
    cards.forEach(card => {
        const indexStr = card.getAttribute('data-index');
        if (indexStr !== null && indexStr !== '') {
            card.addEventListener("click", () => {
                const index = parseInt(indexStr, 10);
                if (!isNaN(index) && index >= 0 && index < productData.length) {
                    console.log(`Клик по карточке, индекс: ${index}`);
                    openModal(index);
                } else {
                    console.error(`Невалидный или отсутствующий индекс (${indexStr}) для карточки:`, card);
                }
            });
        } else {
            console.warn("Карточка без data-index атрибута:", card);
        }
    });
} else {
    console.warn("Ни одной карточки с классом .card не найдено.");
}

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
} else {
     console.error("Элемент #modal_close_btn не найден!");
}

if (productModal) {
    productModal.addEventListener('click', (event) => {
        if (event.target === productModal) {
            closeModal();
        }
    });
} else {
     console.error("Элемент #product_modal не найден!");
}

window.addEventListener('resize', () => {
    if (productModal && productModal.style.display === 'block') {
        console.log("Изменение размера окна браузера, запрос на ресайз рендерера");
        requestAnimationFrame(resizeRendererToDisplaySize);
    }
});

// --- Запуск инициализации --- (без изменений)
if (productModal && modal3dContainer && modalProductName && modalProductDetails && modalArt && closeModalBtn && cards.length > 0) {
    console.log("Все необходимые DOM элементы найдены. Запуск initThree()...");
    initThree();
} else {
    console.error("Один или несколько критически важных DOM элементов не найдены. Инициализация Three.js отменена.");
    if (!productModal) console.error("- Элемент #product_modal не найден.");
    if (!modal3dContainer) console.error("- Элемент #product3d_container не найден.");
    // ... (остальные проверки)
}