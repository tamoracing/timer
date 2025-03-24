// Guardar opciones en chrome.storage
function saveOptions() {
  const defaultMinutes = document.getElementById('defaultMinutes').value;
  const defaultSeconds = document.getElementById('defaultSeconds').value;
  
  chrome.storage.sync.set(
    {
      defaultMinutes: parseInt(defaultMinutes) || 5,
      defaultSeconds: parseInt(defaultSeconds) || 0
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
      defaultSeconds: 0
    },
    function(items) {
      document.getElementById('defaultMinutes').value = items.defaultMinutes;
      document.getElementById('defaultSeconds').value = items.defaultSeconds;
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);