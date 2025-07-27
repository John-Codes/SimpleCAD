window.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const modeToggleBtn = document.getElementById('mode-toggle-btn');
  const statusBarMode = document.querySelector('.status-bar .mode');
  const settingsBtn = document.querySelector('.settings-btn');
  const settingsMenu = document.querySelector('.settings-menu');
  const buildAreaPrompt = document.querySelector('.build-area-prompt');
  const closePromptBtn = document.getElementById('close-prompt-btn');

  // Mode Toggling
  modeToggleBtn.addEventListener('click', () => {
    if (body.dataset.mode === '3d') {
      body.dataset.mode = '2d';
      modeToggleBtn.textContent = '3D View';
      statusBarMode.textContent = '2D Sketch';
    } else {
      body.dataset.mode = '3d';
      modeToggleBtn.textContent = 'Sketch';
      statusBarMode.textContent = '3D View';
    }
  });

  // Settings Menu
  settingsBtn.addEventListener('click', () => {
    settingsMenu.classList.toggle('visible');
  });

  // Build Area Prompt
  closePromptBtn.addEventListener('click', () => {
    buildAreaPrompt.classList.add('hidden');
  });

  // Placeholder for canvas initialization
  const canvas2d = document.getElementById('canvas2d');
  const canvas3d = document.getElementById('canvas3d');
  // Future: Add initialization logic for Konva and Three.js here
});
