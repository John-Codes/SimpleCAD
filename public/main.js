window.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const statusBarMode = document.querySelector('.status-bar .mode');
  const settingsBtn = document.querySelector('.settings-btn');
  const settingsMenu = document.querySelector('.settings-menu');
  const buildAreaPrompt = document.querySelector('.build-area-prompt');
  const closePromptBtn = document.getElementById('close-prompt-btn');
  const sketchBtn = document.getElementById('sketch-btn');
  const finishSketchBtn = document.getElementById('finish-sketch-btn');
  const extrudeBtn = document.getElementById('extrude-btn');
  const objectList = document.getElementById('object-list');
  const canvas3d = document.getElementById('canvas3d');
  const viewCubeContainer = document.getElementById('view-cube');

  let scene, camera, renderer, controls, cube;
  let viewCubeScene, viewCubeCamera, viewCubeRenderer, viewCube, labelRenderer;
  const objects = [];
  const originalMaterials = [];
  let selectedFaceMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
  let selectedFaceIndex = -1;

  function init3D() {
    // Main scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas3d.clientWidth / canvas3d.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas3d, alpha: true });
    renderer.setSize(canvas3d.clientWidth, canvas3d.clientHeight);
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Grids
    const size = 100;
    const divisions = 10;
    const gridHelper = new THREE.GridHelper(size, divisions); // Floor grid
    scene.add(gridHelper);

    const verticalGrid = new THREE.GridHelper(size, divisions, 0x0000ff, 0x808080); // Y-plane grid
    verticalGrid.rotation.x = Math.PI / 2;
    verticalGrid.position.y = size / 2;
    verticalGrid.position.z = 0;
    scene.add(verticalGrid);

    // Cube
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }),
    ];
    materials.forEach(m => originalMaterials.push(m.clone()));
    const geometry = new THREE.BoxGeometry(20, 20, 20);
    cube = new THREE.Mesh(geometry, materials);
    cube.position.y = 10;
    scene.add(cube);
    objects.push({ name: 'Cube', color: '#00ff00', mesh: cube, version: 1 });

    camera.position.z = 50;

    // View cube
    initViewCube();

    updateObjectList();
    animate();
  }

  function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();

    renderer.autoClear = true;
    renderer.render(scene, camera);

    renderer.autoClear = false;
    renderer.clearDepth();
    viewCubeRenderer.render(viewCubeScene, viewCubeCamera);
  }

  function updateObjectList() {
    objectList.innerHTML = '';
    const latestObjects = {};
    objects.forEach(obj => {
        if (!latestObjects[obj.name] || obj.version > latestObjects[obj.name].version) {
            latestObjects[obj.name] = obj;
        }
    });

    Object.values(latestObjects).forEach(obj => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="color-indicator" style="background-color: ${obj.color};"></span> ${obj.name}`;
        objectList.appendChild(li);
        obj.mesh.visible = true;
    });

    objects.forEach(obj => {
        if (!Object.values(latestObjects).includes(obj)) {
            obj.mesh.visible = false;
        }
    });
  }

  function setMode(mode) {
    body.dataset.mode = mode;
    statusBarMode.textContent = mode === '3d' ? '3D View' : '2D Sketch';
    const extrudeSection = document.querySelector('.sidebar-section[data-visibility="3d-selection"]');
    if (mode === '2d') {
      extrudeSection.style.display = 'none';
    }
  }

  sketchBtn.addEventListener('click', () => setMode('2d'));
  finishSketchBtn.addEventListener('click', () => setMode('3d'));

  // Settings Menu
  settingsBtn.addEventListener('click', () => {
    settingsMenu.classList.toggle('visible');
  });

  // Build Area Prompt
  closePromptBtn.addEventListener('click', () => {
    buildAreaPrompt.classList.add('hidden');
  });

  function initViewCube() {
    viewCubeScene = new THREE.Scene();
    viewCubeCamera = new THREE.PerspectiveCamera(75, viewCubeContainer.clientWidth / viewCubeContainer.clientHeight, 0.1, 1000);
    viewCubeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    viewCubeRenderer.setSize(viewCubeContainer.clientWidth, viewCubeContainer.clientHeight);
    viewCubeContainer.appendChild(viewCubeRenderer.domElement);

    const createTextTexture = (text) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 128;
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = 'bold 20px Arial';
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        return new THREE.CanvasTexture(canvas);
    };

    const faceMaterials = [
        new THREE.MeshBasicMaterial({ map: createTextTexture('RIGHT') }),
        new THREE.MeshBasicMaterial({ map: createTextTexture('LEFT') }),
        new THREE.MeshBasicMaterial({ map: createTextTexture('TOP') }),
        new THREE.MeshBasicMaterial({ map: createTextTexture('BOTTOM') }),
        new THREE.MeshBasicMaterial({ map: createTextTexture('FRONT') }),
        new THREE.MeshBasicMaterial({ map: createTextTexture('BACK') })
    ];

    const viewCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    viewCube = new THREE.Mesh(viewCubeGeometry, faceMaterials);
    viewCubeScene.add(viewCube);
    viewCubeCamera.position.z = 1.5;

    const viewCubeControls = new THREE.OrbitControls(viewCubeCamera, viewCubeRenderer.domElement);
    viewCubeControls.enableZoom = false;
    viewCubeControls.enablePan = false;

    viewCubeControls.addEventListener('change', () => {
        camera.quaternion.copy(viewCubeCamera.quaternion.clone().invert());
    });

    viewCubeRenderer.domElement.addEventListener('click', (event) => {
        const rect = viewCubeRenderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, viewCubeCamera);
        const intersects = raycaster.intersectObject(viewCube);

        if (intersects.length > 0) {
            const faceIndex = intersects[0].face.materialIndex;
            const distance = camera.position.distanceTo(controls.target);
            const targetPosition = new THREE.Vector3();

            switch (faceIndex) {
                case 0: targetPosition.set(distance, 0, 0); break; // Right
                case 1: targetPosition.set(-distance, 0, 0); break; // Left
                case 2: targetPosition.set(0, distance, 0); break; // Top
                case 3: targetPosition.set(0, -distance, 0); break; // Bottom
                case 4: targetPosition.set(0, 0, distance); break; // Front
                case 5: targetPosition.set(0, 0, -distance); break; // Back
            }

            new TWEEN.Tween(camera.position)
                .to(targetPosition, 500)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(() => camera.lookAt(controls.target))
                .start();
        }
    });
  }

  canvas3d.addEventListener('click', (event) => {
    const extrudeSection = document.querySelector('.sidebar-section[data-visibility="3d-selection"]');
    const rect = canvas3d.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(cube);

    if (intersects.length > 0) {
        const faceIndex = intersects[0].face.materialIndex;
        if (selectedFaceIndex === faceIndex) {
            // Deselect
            cube.material[selectedFaceIndex] = originalMaterials[selectedFaceIndex];
            selectedFaceIndex = -1;
            extrudeSection.style.display = 'none';
        } else {
            // Select new face
            if (selectedFaceIndex !== -1) {
                cube.material[selectedFacefIndex] = originalMaterials[selectedFaceIndex];
            }
            selectedFaceIndex = faceIndex;
            cube.material[faceIndex] = selectedFaceMaterial;
            extrudeSection.style.display = 'block';
        }
    } else {
        // Deselect if clicking outside
        if (selectedFaceIndex !== -1) {
            cube.material[selectedFaceIndex] = originalMaterials[selectedFaceIndex];
            selectedFaceIndex = -1;
        }
        extrudeSection.style.display = 'none';
    }
  });

  init3D();
});
