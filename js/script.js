// Получаем контейнер для рендера
var container = document.getElementById('three_office');

// Создаём сцену
var scene = new THREE.Scene();

// Настраиваем камеру
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);
scene.add(camera);

// Создаём рендерер и добавляем его в контейнер
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Добавляем базовое освещение
var ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(0, 5, 5);
scene.add(directionalLight);

// Настраиваем OrbitControls
// Здесь мы ограничиваем вращение по вертикали, задавая minPolarAngle и maxPolarAngle равными Math.PI/2.
// Это позволяет вращать камеру только по горизонтали (вокруг оси Y)
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.enableZoom = false;  // При желании можно оставить зум включённым
controls.minPolarAngle = Math.PI / 2;
controls.maxPolarAngle = Math.PI / 2;
// Ограничиваем горизонтальное вращение (азимутальный угол) на 90 градусов.
// Например, разрешаем вращение от 0 до 90 градусов:
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 0.3;

// Загрузка 3D-модели через GLTFLoader
var loader = new THREE.GLTFLoader();
loader.load(
  'models/recycle_office.glb', // относительный путь к модели
  function (gltf) {
    var model = gltf.scene;
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error('Ошибка при загрузке модели:', error);
  }
);

// Обработка изменения размеров окна
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Функция анимации
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();