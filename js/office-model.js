import * as THREE from 'three'
import { OrbitControls } from 'OrbitControls'
import { GLTFLoader } from 'GLTFLoader'
import { RectAreaLightUniformsLib } from 'RectAreaLightUniformsLib'

document.addEventListener('DOMContentLoaded', () => {
    initThree()
  })

function initThree() {
    //находим html-контейнер
    const model = document.querySelector('.three_office')

     //создаём сцену
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#ebebeb')
    scene.position.set(0, 0, 0)

    //создаём камеру - ПОДОБРАТЬ!!!
    const camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        1.5,
        100
        )
    
        camera.position.set(2, 0.5, 2)

        //создаём визуализатор-рендерер
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        model.appendChild(renderer.domElement)

        //подключаем модель
        {
        const loader = new GLTFLoader()
        loader.load(
        './models/recycle_office.glb',
        (gltf) => {
        scene.add(gltf.scene)
        },
        (error) => {
        console.log('Error:' + error)
        }
        )
        
        //добавляем свет
  {
    const light = new THREE.AmbientLight(0xeeeeee)
    scene.add(light)
  }
  {
    const light = new THREE.DirectionalLight(0xeeeeee, 1)
    light.position.set(-80, 1, 1)
    light.lookAt(1, 1, 0)

    // const helper = new THREE.DirectionalLightHelper(light, 5)

    scene.add(light)
  }
  {
    const light = new THREE.DirectionalLight(0xeeeeee, 1)
    light.position.set(50, 100, 0)
    light.lookAt(100, 100, 0)

    // const helper = new THREE.DirectionalLightHelper(light, 5)

    scene.add(light)
  }

  //управление моделью
  const controls = new OrbitControls(camera, renderer.domElement)
  // controls.autoRotate = true
  // controls.autoRotateSpeed = 5
  controls.enableDamping = true
  controls.enableZoom = false;
  controls.maxDistance = 100
//   controls.minPolarAngle = Math.PI / 0;
controls.maxPolarAngle = Math.PI / 1.9;
  controls.maxPolarAngle = Math.PI / 2;
  // Например, разрешаем вращение от 0 до 90 градусов:
controls.minAzimuthAngle = -0.1;
controls.maxAzimuthAngle = Math.PI / 2;

  //анимация модели
  function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  //обновление при ресайзе окна
  window.addEventListener('resize', onWindowResize)

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
    




}