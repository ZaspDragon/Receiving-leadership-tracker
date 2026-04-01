const STORAGE_KEY = 'receivingManagerEntries_v1';
const NOTE_KEY = 'receivingManagerNotes_v1';

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const entryForm = document.getElementById('entryForm');
const historyTable = document.getElementById('historyTable');
const teamNotesList = document.getElementById('teamNotesList');

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

document.getElementById('date').value = todayISO();

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

function readEntries() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function writeEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function readNotes() {
  return JSON.parse(localStorage.getItem(NOTE_KEY) || '[]');
}

function writeNotes(notes) {
  localStorage.setItem(NOTE_KEY, JSON.stringify(notes));
}

function calculate(entry) {
  const truckCompletion = entry.trucksScheduled > 0 ? (entry.trucksReceived / entry.trucksScheduled) * 100 : 0;
  const palletsPerHour = entry.hours > 0 ? (entry.pallets / entry.hours) : 0;
  const errorRate = entry.pallets > 0 ? (entry.errors / entry.pallets) * 100 : 0;
  return {
    truckCompletion: truckCompletion.toFixed(0),
    palletsPerHour: palletsPerHour.toFixed(2),
    errorRate: errorRate.toFixed(2),
  };
}

function renderOverview() {
  const entries = readEntries();
  const latest = entries[0];
  if (!latest) {
    document.getElementById('truckCompletion').textContent = '0%';
    document.getElementById('palletsPerHour').textContent = '0.00';
    document.getElementById('errorRate').textContent = '0.00%';
    document.getElementById('dockToStock').textContent = '0 min';
    document.getElementById('todaySummary').innerHTML = '<div><span>Status</span><strong>No entries yet</strong></div>';
    document.getElementById('reportContent').innerHTML = '<p>No report available yet. Save a daily entry first.</p>';
    return;
  }
  const metrics = calculate(latest);
  document.getElementById('truckCompletion').textContent = `${metrics.truckCompletion}%`;
  document.getElementById('palletsPerHour').textContent = metrics.palletsPerHour;
  document.getElementById('errorRate').textContent = `${metrics.errorRate}%`;
  document.getElementById('dockToStock').textContent = `${latest.dockMinutes} min`;

  document.getElementById('todaySummary').innerHTML = `
    <div><span>Date / Shift</span><strong>${latest.date} / ${latest.shift}</strong></div>
    <div><span>Scheduled vs Received</span><strong>${latest.trucksReceived} / ${latest.trucksScheduled}</strong></div>
    <div><span>Pallets / Backlog</span><strong>${latest.pallets} / ${latest.backlog}</strong></div>
    <div><span>Temps Used</span><strong>${latest.temps}</strong></div>
    <div><span>Top issue</span><strong>${latest.issue || 'None logged'}</strong></div>
    <div><span>Tomorrow action</span><strong>${latest.action || 'None logged'}</strong></div>
  `;

  document.getElementById('reportContent').innerHTML = `
    <p><strong>Date:</strong> ${latest.date}</p>
    <p><strong>Shift:</strong> ${latest.shift}</p>
    <p><strong>Trucks Scheduled / Received:</strong> ${latest.trucksScheduled} / ${latest.trucksReceived}</p>
    <p><strong>Total Pallets:</strong> ${latest.pallets}</p>
    <p><strong>Total Hours:</strong> ${latest.hours}</p>
    <p><strong>Pallets per Hour:</strong> ${metrics.palletsPerHour}</p>
    <p><strong>Total Errors:</strong> ${latest.errors}</p>
    <p><strong>Error Rate:</strong> ${metrics.errorRate}%</p>
    <p><strong>Avg Dock-to-Stock:</strong> ${latest.dockMinutes} minutes</p>
    <p><strong>Backlog:</strong> ${latest.backlog} pallets</p>
    <p><strong>Temps Used:</strong> ${latest.temps}</p>
    <p><strong>Admins:</strong> ${latest.admin1 || '-'} / ${latest.admin2 || '-'}</p>
    <p><strong>Leads:</strong> ${latest.lead1 || '-'} / ${latest.lead2 || '-'}</p>
    <p><strong>Biggest Issue:</strong> ${latest.issue || 'None logged'}</p>
    <p><strong>Action for Tomorrow:</strong> ${latest.action || 'None logged'}</p>
  `;
}

function renderHistory() {
  const entries = readEntries();
  historyTable.innerHTML = '';
  entries.forEach((entry, index) => {
    const metrics = calculate(entry);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.shift}</td>
      <td>${entry.trucksReceived}/${entry.trucksScheduled}</td>
      <td>${entry.pallets}</td>
      <td>${metrics.palletsPerHour}</td>
      <td>${entry.errors}</td>
      <td>${metrics.errorRate}%</td>
      <td>${entry.backlog}</td>
      <td><button data-index="${index}" class="delete-btn">Delete</button></td>
    `;
    historyTable.appendChild(tr);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const entries = readEntries();
      entries.splice(Number(btn.dataset.index), 1);
      writeEntries(entries);
      renderAll();
    });
  });
}

function renderNotes() {
  const notes = readNotes();
  teamNotesList.innerHTML = '';
  notes.forEach((note, index) => {
    const div = document.createElement('div');
    div.className = 'note';
    div.innerHTML = `
      <strong>${note.date}</strong>
      <p>${note.text}</p>
      <button data-index="${index}" class="delete-note">Delete</button>
    `;
    teamNotesList.appendChild(div);
  });

  document.querySelectorAll('.delete-note').forEach(btn => {
    btn.addEventListener('click', () => {
      const notes = readNotes();
      notes.splice(Number(btn.dataset.index), 1);
      writeNotes(notes);
      renderNotes();
    });
  });
}

entryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const entry = {
    date: document.getElementById('date').value,
    shift: document.getElementById('shift').value,
    trucksScheduled: Number(document.getElementById('trucksScheduled').value || 0),
    trucksReceived: Number(document.getElementById('trucksReceived').value || 0),
    pallets: Number(document.getElementById('pallets').value || 0),
    hours: Number(document.getElementById('hours').value || 0),
    errors: Number(document.getElementById('errors').value || 0),
    dockMinutes: Number(document.getElementById('dockMinutes').value || 0),
    backlog: Number(document.getElementById('backlog').value || 0),
    temps: Number(document.getElementById('temps').value || 0),
    admin1: document.getElementById('admin1').value.trim(),
    admin2: document.getElementById('admin2').value.trim(),
    lead1: document.getElementById('lead1').value.trim(),
    lead2: document.getElementById('lead2').value.trim(),
    issue: document.getElementById('issue').value.trim(),
    action: document.getElementById('action').value.trim(),
  };

  const entries = readEntries().filter(item => !(item.date === entry.date && item.shift === entry.shift));
  entries.unshift(entry);
  writeEntries(entries);
  renderAll();
  alert('Daily entry saved.');
});

document.getElementById('clearForm').addEventListener('click', () => entryForm.reset());

document.getElementById('saveTeamNote').addEventListener('click', () => {
  const text = document.getElementById('teamNote').value.trim();
  if (!text) return;
  const notes = readNotes();
  notes.unshift({ date: new Date().toLocaleString(), text });
  writeNotes(notes);
  document.getElementById('teamNote').value = '';
  renderNotes();
});

document.getElementById('exportCsv').addEventListener('click', () => {
  const entries = readEntries();
  const header = ['Date','Shift','Trucks Scheduled','Trucks Received','Pallets','Hours','Pallets/Hr','Errors','Error %','Dock Minutes','Backlog','Temps','Issue','Action'];
  const rows = entries.map(entry => {
    const m = calculate(entry);
    return [entry.date, entry.shift, entry.trucksScheduled, entry.trucksReceived, entry.pallets, entry.hours, m.palletsPerHour, entry.errors, m.errorRate, entry.dockMinutes, entry.backlog, entry.temps, quote(entry.issue), quote(entry.action)];
  });
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(csv, 'receiving-manager-history.csv', 'text/csv');
});

document.getElementById('exportJson').addEventListener('click', () => {
  downloadFile(JSON.stringify({ entries: readEntries(), notes: readNotes() }, null, 2), 'receiving-manager-backup.json', 'application/json');
});

document.getElementById('importJson').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const data = JSON.parse(text);
  if (Array.isArray(data.entries)) writeEntries(data.entries);
  if (Array.isArray(data.notes)) writeNotes(data.notes);
  renderAll();
  alert('Backup imported.');
});

document.getElementById('printReport').addEventListener('click', () => window.print());

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function quote(value = '') {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function renderAll() {
  renderOverview();
  renderHistory();
  renderNotes();
}

renderAll();
