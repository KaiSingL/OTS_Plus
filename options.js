document.addEventListener('DOMContentLoaded', () => {
  const projectList = document.getElementById('project-list');
  const addProjectButton = document.getElementById('add-project');
  const saveButton = document.getElementById('save');
  const status = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get({
    home: 'Wong Tai Sin',
    work: 'HKCEC',
    job: 'T9',
    projects: [{ name: 'VRMS', checked: true }, { name: 'RTPCS', checked: false }]
  }, (items) => {
    document.getElementById('home').value = items.home;
    document.getElementById('work').value = items.work;
    document.getElementById('job').value = items.job;
    items.projects.forEach(project => addProjectField(project.name, project.checked));
  });

  // Add a new project input field
  function addProjectField(name = '', checked = false) {
    const entry = document.createElement('div');
    entry.className = 'project-entry';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = name;
    input.placeholder = 'e.g., VRMS';
    
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'default-project';
    radio.checked = checked;
    
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = () => entry.remove();
    
    entry.appendChild(input);
    entry.appendChild(radio);
    entry.appendChild(removeButton);
    projectList.appendChild(entry);
  }

  // Add project button click
  addProjectButton.onclick = () => addProjectField();

  // Save settings
  saveButton.onclick = () => {
    const projects = Array.from(projectList.getElementsByClassName('project-entry')).map(entry => {
      const input = entry.querySelector('input[type="text"]');
      const radio = entry.querySelector('input[type="radio"]');
      return { name: input.value.trim(), checked: radio.checked };
    }).filter(project => project.name !== '');
    
    if (projects.length === 0) {
      status.textContent = 'Please add at least one project.';
      return;
    }
    
    if (!projects.some(project => project.checked)) {
      status.textContent = 'Please select a default project.';
      return;
    }

    chrome.storage.sync.set({
      home: document.getElementById('home').value.trim(),
      work: document.getElementById('work').value.trim(),
      job: document.getElementById('job').value.trim(),
      projects
    }, () => {
      status.textContent = 'Settings saved.';
      setTimeout(() => status.textContent = '', 2000);
    });
  };
});