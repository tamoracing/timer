// Variables globales
let peopleList = [];

// Guardar opciones en chrome.storage
function saveOptions() {
  const defaultMinutes = document.getElementById('defaultMinutes').value;
  const defaultSeconds = document.getElementById('defaultSeconds').value;
  
  chrome.storage.sync.set(
    {
      defaultMinutes: parseInt(defaultMinutes) || 5,
      defaultSeconds: parseInt(defaultSeconds) || 0,
      peopleList: peopleList
    },
    function() {
      // Actualizar el estado para informar al usuario
      const status = document.getElementById('status');
      status.textContent = 'Opciones guardadas.';
      status.className = 'status success';
      status.style.display = 'block';
      
      setTimeout(function() {
        status.style.display = 'none';
      }, 2000);
    }
  );
}

// Restaurar las opciones guardadas
function restoreOptions() {
  chrome.storage.sync.get(
    {
      defaultMinutes: 5,
      defaultSeconds: 0,
      peopleList: []
    },
    function(items) {
      document.getElementById('defaultMinutes').value = items.defaultMinutes;
      document.getElementById('defaultSeconds').value = items.defaultSeconds;
      peopleList = items.peopleList;
      renderPeopleList();
    }
  );
}

// Renderizar la lista de personas
function renderPeopleList() {
  const listContainer = document.getElementById('peopleList');
  listContainer.innerHTML = '';
  
  if (peopleList.length === 0) {
    listContainer.innerHTML = '<div class="person-item">No hay personas en la lista.</div>';
    return;
  }
  
  peopleList.forEach((person, index) => {
    const personItem = document.createElement('div');
    personItem.className = 'person-item';
    
    const personName = document.createElement('div');
    personName.className = 'person-name';
    personName.textContent = person;
    
    const personActions = document.createElement('div');
    personActions.className = 'person-actions';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    deleteBtn.title = 'Eliminar';
    deleteBtn.addEventListener('click', () => {
      peopleList.splice(index, 1);
      renderPeopleList();
    });
    
    personActions.appendChild(deleteBtn);
    personItem.appendChild(personName);
    personItem.appendChild(personActions);
    listContainer.appendChild(personItem);
  });
}

// Agregar una nueva persona a la lista
function addPerson() {
  const newPersonInput = document.getElementById('newPersonName');
  const name = newPersonInput.value.trim();
  
  if (name) {
    peopleList.push(name);
    newPersonInput.value = '';
    renderPeopleList();
  }
}

// Configurar event listeners
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('addPerson').addEventListener('click', addPerson);
document.getElementById('newPersonName').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    addPerson();
  }
});