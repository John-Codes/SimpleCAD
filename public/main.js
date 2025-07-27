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

  let scene, camera, renderer, cube;
  const objects = [];

  function init3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas3d.clientWidth / canvas3d.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas3d, alpha: true });
    renderer.setSize(canvas3d.clientWidth, canvas3d.clientHeight);

    const geometry = new THREE.BoxGeometry(20, 20, 20);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    objects.push({ name: 'Cube', color: '#00ff00', mesh: cube });

    camera.position.z = 50;

    updateObjectList();
    animate();
  }

  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  function updateObjectList() {
    objectList.innerHTML = '';
    objects.forEach(obj => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="color-indicator" style="background-color: ${obj.color};"></span> ${obj.name}`;
      objectList.appendChild(li);
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

  canvas3d.addEventListener('click', (event) => {
    const extrudeSection = document.querySelector('.sidebar-section[data-visibility="3d-selection"]');
    const rect = canvas3d.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      extrudeSection.style.display = 'block';
    } else {
      extrudeSection.style.display = 'none';
    }
  });

  init3D();
});
