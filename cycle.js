const steps = [
  { id: 1, name: "Carico materiale", condition: "tempo ≥ 30s" },
  { id: 2, name: "Riscaldamento", condition: "temperatura ≥ 120°C" },
  { id: 3, name: "Mixing lento", condition: "tempo ≥ 60s" },
  { id: 4, name: "Mixing veloce", condition: "torque ≥ 80%" },
  { id: 5, name: "Raffreddamento iniziale", condition: "temperatura ≤ 90°C" },
  { id: 6, name: "Stabilizzazione", condition: "tempo ≥ 45s" },
  { id: 7, name: "Scarico parziale", condition: "tempo ≥ 20s" },
  { id: 8, name: "Scarico completo", condition: "tempo ≥ 30s" },
  { id: 9, name: "Pulizia", condition: "tempo ≥ 15s" },
  { id: 10, name: "Fine ciclo", condition: "manuale" }
];

// Popola tabella
const tableBody = document.querySelector("#stepsTable tbody");
steps.forEach(s => {
  tableBody.innerHTML += `
    <tr id="row-${s.id}">
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.condition}</td>
    </tr>
  `;
});

// Stato ciclo
let currentStep = 0;
let timer = 0;
let temp = 80;
let torque = 20;

// Chart.js
const ctx = document.getElementById("cycleChart").getContext("2d");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Temperatura °C", data: [], borderColor: "red", backgroundColor: "rgba(255,0,0,0.2)", yAxisID: 'y' },
      { label: "Torque %", data: [], borderColor: "blue", backgroundColor: "rgba(0,0,255,0.2)", yAxisID: 'y1' }
    ]
  },
  options: {
    responsive: true,
    animation: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: { type: 'linear', position: 'left', min: 60, max: 200 },
      y1: { type: 'linear', position: 'right', min: 0, max: 100 }
    }
  }
});

// Simulazione ciclo
function nextStep() {
  if (currentStep >= steps.length) return;
  const step = steps[currentStep];
  document.getElementById("currentStep").textContent = step.name;
  document.getElementById("currentCondition").textContent = step.condition;

  // evidenzia riga attiva
  document.querySelectorAll("#stepsTable tbody tr").forEach(tr => tr.classList.remove("table-primary"));
  document.getElementById(`row-${step.id}`).classList.add("table-primary");

  currentStep++;
}

nextStep();

// Simulazione valori realtime
setInterval(() => {
  timer += 1;
  temp += (Math.random() * 4 - 2);  // variazioni
  torque += (Math.random() * 6 - 3);
  torque = Math.max(0, Math.min(100, torque));

  const now = timer + "s";
  if (chart.data.labels.length > 30) {
    chart.data.labels.shift();
    chart.data.datasets.forEach(ds => ds.data.shift());
  }
  chart.data.labels.push(now);
  chart.data.datasets[0].data.push(temp);
  chart.data.datasets[1].data.push(torque);
  chart.update();

  // Cambio step ogni 20 secondi simulati
  if (timer % 20 === 0 && currentStep < steps.length) {
    nextStep();
  }
}, 1000);
