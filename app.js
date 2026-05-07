const API_URL = 'https://app-treino-backend.onrender.com/api/workouts';

const form = document.getElementById('entry-form');
const entryId = document.getElementById('entry-id');
const title = document.getElementById('title');
const description = document.getElementById('description');
const duration = document.getElementById('duration');
const happenedAt = document.getElementById('happenedAt');
const entriesList = document.getElementById('entries-list');
const message = document.getElementById('message');
const cancelEdit = document.getElementById('cancel-edit');
const formTitle = document.getElementById('form-title');
const reloadBtn = document.getElementById('reload-btn');

function showMessage(text) {
  message.textContent = text;
}

function clearForm() {
  form.reset();
  entryId.value = '';
  formTitle.textContent = 'Novo treino';
  cancelEdit.classList.add('hidden');
  happenedAt.value = new Date().toISOString().slice(0, 16);
}

function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR');
}

async function loadEntries() {
  const response = await fetch(API_URL);
  const entries = await response.json();

  if (!entries.length) {
    entriesList.innerHTML = '<p>Nenhum treino encontrado.</p>';
    return;
  }

  entriesList.innerHTML = entries.map(entry => `
    <div class="entry-item">
      <h3>${entry.title}</h3>
      <p>${formatDate(entry.happenedAt)} • ${entry.duration} min</p>
      <p>${entry.description}</p>
      <div class="entry-buttons">
        <button onclick="editEntry('${entry._id}')">Editar</button>
        <button onclick="deleteEntry('${entry._id}')">Excluir</button>
      </div>
    </div>
  `).join('');
}

async function saveEntry(data) {
  const id = entryId.value;
  const url = id ? `${API_URL}/${id}` : API_URL;
  const method = id ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

window.editEntry = async function (id) {
  const response = await fetch(`${API_URL}/${id}`);
  const entry = await response.json();

  entryId.value = entry._id;
  title.value = entry.title;
  description.value = entry.description;
  duration.value = entry.duration;
  happenedAt.value = new Date(entry.happenedAt).toISOString().slice(0, 16);

  formTitle.textContent = 'Editar treino';
  cancelEdit.classList.remove('hidden');
  showMessage('Editando treino.');
};

window.deleteEntry = async function (id) {
  if (!confirm('Deseja excluir este treino?')) return;

  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  showMessage('Treino excluído.');
  loadEntries();
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    title: title.value,
    description: description.value,
    duration: Number(duration.value),
    happenedAt: happenedAt.value
  };

  await saveEntry(data);
  showMessage(entryId.value ? 'Treino atualizado.' : 'Treino criado.');
  clearForm();
  loadEntries();
});

cancelEdit.addEventListener('click', () => {
  clearForm();
  showMessage('Edição cancelada.');
});

reloadBtn.addEventListener('click', loadEntries);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./service-worker.js');
      console.log('Service Worker registrado com sucesso.');
    } catch (error) {
      console.log('Erro ao registrar Service Worker:', error);
    }
  });
}

clearForm();
loadEntries();
