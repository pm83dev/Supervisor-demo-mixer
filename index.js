// ================== NAVBAR ==================
function showSection(id) {
  document
    .querySelectorAll("section")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));
  document
    .querySelector(`.nav-link[data-section="${id}"]`)
    .classList.add("active");
}

// Event listeners per la navigazione
document.addEventListener("DOMContentLoaded", function () {
  // Inizializza stato
  updateStatus();

  // Navbar navigation
  document.querySelectorAll(".nav-link[data-section]").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const section = this.getAttribute("data-section");
      showSection(section);
    });
  });

  // Pulsante nuova ricetta
  document
    .getElementById("btnAddRecipe")
    .addEventListener("click", openAddModal);

  // Form ricette
  document.getElementById("recipeForm").addEventListener("submit", saveRecipe);

  // Event listeners per la configurazione condizioni
  document
    .getElementById("btnEditConditions")
    .addEventListener("click", toggleConditionsConfig);
  document
    .getElementById("btnSaveCondition")
    .addEventListener("click", saveStepCondition);
  document
    .getElementById("btnCancelCondition")
    .addEventListener("click", cancelConditionEdit);
  document
    .getElementById("conditionType")
    .addEventListener("change", updateConditionUnit);

  // Event listeners per il controllo del ciclo
  document
    .getElementById("btnNextStep")
    .addEventListener("click", manualNextStep);
  document
    .getElementById("btnResetCycle")
    .addEventListener("click", resetCycle);

  // Popola il select degli step
  populateStepSelect();

  // Inizializza le tabelle
  renderStepsTable();
  renderRecipes();

  // Inizia il ciclo
  nextStep();

  // Inizializza dashboard chart
  initDashboardChart();

  // Aggiorna dashboard ogni secondo
  setInterval(updateDashboard, 1000);
});

// ================== STATO ==================
const mockStatus = {
  turbomixer: "In marcia",
  cooler: "Standby",
  temperature: 175,
  setpoint: 180,
  alarms: ["High turbomixer temperature", "Material low level in the hopper"],
  // Nuovi dati per la dashboard
  torque: 45.2,
  cyclesCompleted: 127,
  todayCycles: 8,
  efficiency: 94.2,
  turbomixerSpeed: 1450,
  coolerTemp: 65,
  pumpFlow: 125,
  plcCpu: 12,
};

function updateStatus() {
  // Aggiorna timestamp
  const now = new Date();
  const timeString = now.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  document.getElementById(
    "lastUpdate"
  ).textContent = `Last update: ${timeString}`;

  // Aggiorna KPI cards
  document.getElementById(
    "tempDisplay"
  ).textContent = `${mockStatus.temperature.toFixed(1)}°C`;
  document.getElementById(
    "setpointDisplay"
  ).textContent = `${mockStatus.setpoint}°C`;
  document.getElementById(
    "torqueDisplay"
  ).textContent = `${mockStatus.torque.toFixed(1)}%`;
  document.getElementById(
    "torqueProgressBar"
  ).style.width = `${mockStatus.torque}%`;
  document.getElementById("cyclesCompleted").textContent =
    mockStatus.cyclesCompleted;
  document.getElementById("todayCycles").textContent = mockStatus.todayCycles;
  document.getElementById(
    "efficiencyDisplay"
  ).textContent = `${mockStatus.efficiency.toFixed(1)}%`;

  // Aggiorna equipaggiamenti
  document.getElementById(
    "turbomixerSpeed"
  ).textContent = `${mockStatus.turbomixerSpeed} RPM`;
  document.getElementById(
    "coolerTemp"
  ).textContent = `${mockStatus.coolerTemp}°C`;
  document.getElementById(
    "pumpFlow"
  ).textContent = `${mockStatus.pumpFlow} L/min`;
  document.getElementById("plcCpu").textContent = `${mockStatus.plcCpu}%`;

  // Aggiorna allarmi
  const alarmsContainer = document.getElementById("alarms");
  alarmsContainer.innerHTML = "";
  if (mockStatus.alarms.length > 0) {
    mockStatus.alarms.forEach((alarm, index) => {
      const alarmDiv = document.createElement("div");
      alarmDiv.className =
        "alert alert-danger alert-dismissible fade show mb-2";
      alarmDiv.style.fontSize = "0.85rem";
      alarmDiv.innerHTML = `
        <div class="d-flex align-items-start">
          <span class="badge bg-danger me-2">${index + 1}</span>
          <div class="flex-grow-1">
            <strong>ALARM</strong><br>
            ${alarm}
            <br><small class="text-muted">${timeString}</small>
          </div>
        </div>
      `;
      alarmsContainer.appendChild(alarmDiv);
    });
  } else {
    alarmsContainer.innerHTML = `
      <div class="text-center text-success">
        <i class="fas fa-check-circle fa-2x mb-2"></i>
        <p class="mb-0">No active alarms</p>
        <small class="text-muted">Sistema operativo</small>
      </div>
    `;
  }
}

// ================== CICLO ==================
const steps = [
  {
    id: 1,
    name: "Material loading",
    condition: { type: "tempo", operator: ">=", value: 30, unit: "s" },
    description: "time ≥ 30s",
  },
  {
    id: 2,
    name: "Heating",
    condition: { type: "temperatura", operator: ">=", value: 120, unit: "°C" },
    description: "temperature ≥ 120°C",
  },
  {
    id: 3,
    name: "Slow mixing",
    condition: { type: "tempo", operator: ">=", value: 60, unit: "s" },
    description: "time ≥ 60s",
  },
  {
    id: 4,
    name: "Fast mixing",
    condition: { type: "torque", operator: ">=", value: 80, unit: "%" },
    description: "torque ≥ 80%",
  },
  {
    id: 5,
    name: "Initial cooling",
    condition: { type: "temperatura", operator: "<=", value: 90, unit: "°C" },
    description: "temperature ≤ 90°C",
  },
  {
    id: 6,
    name: "Stabilization",
    condition: { type: "tempo", operator: ">=", value: 45, unit: "s" },
    description: "time ≥ 45s",
  },
  {
    id: 7,
    name: "Partial discharge",
    condition: { type: "tempo", operator: ">=", value: 20, unit: "s" },
    description: "time ≥ 20s",
  },
  {
    id: 8,
    name: "Complete discharge",
    condition: { type: "tempo", operator: ">=", value: 30, unit: "s" },
    description: "time ≥ 30s",
  },
  {
    id: 9,
    name: "Cleaning",
    condition: { type: "tempo", operator: ">=", value: 15, unit: "s" },
    description: "time ≥ 15s",
  },
  {
    id: 10,
    name: "Cycle end",
    condition: { type: "manuale", operator: "==", value: 1, unit: "" },
    description: "manual",
  },
];

// Variabili per il tracking delle condizioni
let stepStartTime = {};
let stepStartTemp = {};
let stepStartTorque = {};

function renderStepsTable() {
  const tableBody = document.querySelector("#stepsTable tbody");
  tableBody.innerHTML = "";
  steps.forEach((s) => {
    const isActive = currentStep > 0 && steps[currentStep - 1].id === s.id;
    const activeBadge = isActive
      ? '<span class="badge bg-success ms-2">ACTIVE</span>'
      : "";

    tableBody.innerHTML += `
      <tr id="row-${s.id}">
        <td>${s.id}</td>
        <td>${s.name}${activeBadge}</td>
        <td>${s.description}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editStepCondition(${s.id})">
            ⚙ Edit
          </button>
        </td>
      </tr>`;
  });
}

// ================== GESTIONE CONDIZIONI ==================
function populateStepSelect() {
  const stepSelect = document.getElementById("stepSelect");
  stepSelect.innerHTML = "";
  steps.forEach((step) => {
    const option = document.createElement("option");
    option.value = step.id;
    option.textContent = `${step.id}. ${step.name}`;
    stepSelect.appendChild(option);
  });
}

function toggleConditionsConfig() {
  const configDiv = document.getElementById("conditionsConfig");
  const isVisible = configDiv.style.display !== "none";
  configDiv.style.display = isVisible ? "none" : "block";

  const btn = document.getElementById("btnEditConditions");
  btn.textContent = isVisible ? "⚙ Edit Conditions" : "✕ Close";
}

function editStepCondition(stepId) {
  const step = steps.find((s) => s.id === stepId);
  if (!step) return;

  // Mostra il pannello di configurazione
  document.getElementById("conditionsConfig").style.display = "block";
  document.getElementById("btnEditConditions").textContent = "✕ Chiudi";

  // Popola i campi con i valori attuali
  document.getElementById("stepSelect").value = stepId;
  document.getElementById("conditionType").value = step.condition.type;
  document.getElementById("conditionOperator").value = step.condition.operator;
  document.getElementById("conditionValue").value = step.condition.value;

  updateConditionUnit();
}

function updateConditionUnit() {
  const conditionType = document.getElementById("conditionType").value;
  const unitSpan = document.getElementById("conditionUnit");
  const valueInput = document.getElementById("conditionValue");

  switch (conditionType) {
    case "tempo":
      unitSpan.textContent = "s";
      valueInput.style.display = "block";
      break;
    case "temperatura":
      unitSpan.textContent = "°C";
      valueInput.style.display = "block";
      break;
    case "torque":
      unitSpan.textContent = "%";
      valueInput.style.display = "block";
      break;
    case "manuale":
      unitSpan.textContent = "";
      valueInput.style.display = "none";
      break;
  }
}

function saveStepCondition() {
  const stepId = parseInt(document.getElementById("stepSelect").value);
  const conditionType = document.getElementById("conditionType").value;
  const operator = document.getElementById("conditionOperator").value;
  const value =
    parseFloat(document.getElementById("conditionValue").value) || 1;

  const step = steps.find((s) => s.id === stepId);
  if (!step) return;

  // Aggiorna la condizione
  step.condition.type = conditionType;
  step.condition.operator = operator;
  step.condition.value = value;

  // Aggiorna l'unità
  switch (conditionType) {
    case "tempo":
      step.condition.unit = "s";
      break;
    case "temperatura":
      step.condition.unit = "°C";
      break;
    case "torque":
      step.condition.unit = "%";
      break;
    case "manuale":
      step.condition.unit = "";
      break;
  }

  // Aggiorna la descrizione
  if (conditionType === "manuale") {
    step.description = "manuale";
  } else {
    let operatorSymbol;
    if (operator === ">=") {
      operatorSymbol = "≥";
    } else if (operator === "<=") {
      operatorSymbol = "≤";
    } else {
      operatorSymbol = "=";
    }
    step.description = `${conditionType} ${operatorSymbol} ${value}${step.condition.unit}`;
  }

  // Ricarica la tabella
  renderStepsTable();

  // Aggiorna la condizione corrente se è lo step attivo
  if (currentStep > 0 && steps[currentStep - 1].id === stepId) {
    document.getElementById("currentCondition").textContent = step.description;
  }

  // Chiudi il pannello
  cancelConditionEdit();

  alert("Condition saved successfully!");
}

function cancelConditionEdit() {
  document.getElementById("conditionsConfig").style.display = "none";
  document.getElementById("btnEditConditions").textContent =
    "⚙ Edit Conditions";
}

// ================== CONTROLLO CICLO ==================
function manualNextStep() {
  if (currentStep < steps.length) {
    nextStep();
  } else {
    alert("The cycle is already completed!");
  }
}

function resetCycle() {
  if (confirm("Are you sure you want to reset the cycle?")) {
    currentStep = 0;
    timer = 0;
    temp = 80;
    torque = 20;
    stepStartTime = {};
    stepStartTemp = {};
    stepStartTorque = {};

    // Pulisci la tabella
    document
      .querySelectorAll("#stepsTable tbody tr")
      .forEach((tr) => tr.classList.remove("table-primary"));

    // Resetta la visualizzazione
    document.getElementById("currentStep").textContent = "-";
    document.getElementById("currentCondition").textContent = "-";
    updateProgress();

    // Reset del progresso della condizione
    const progressBar = document.getElementById("conditionProgress");
    const progressText = document.getElementById("conditionProgressText");
    if (progressBar && progressText) {
      progressBar.style.width = "0%";
      progressText.textContent = "0%";
      progressBar.className = "progress-bar bg-info";
    }

    // Riavvia il ciclo
    setTimeout(() => {
      nextStep();
    }, 1000);
  }
}

let currentStep = 0,
  timer = 0,
  temp = 80,
  torque = 20;

function nextStep() {
  if (currentStep >= steps.length) {
    // Resetta il ciclo
    currentStep = 0;
    timer = 0;
    temp = 80;
    torque = 20;
    stepStartTime = {};
    stepStartTemp = {};
    stepStartTorque = {};
    updateProgress();
    return;
  }
  const step = steps[currentStep];
  document.getElementById("currentStep").textContent = step.name;
  document.getElementById("currentCondition").textContent = step.description;
  document
    .querySelectorAll("#stepsTable tbody tr")
    .forEach((tr) => tr.classList.remove("table-primary"));
  document.getElementById(`row-${step.id}`).classList.add("table-primary");

  // Inizializza i valori di partenza per lo step
  stepStartTime[step.id] = timer;
  stepStartTemp[step.id] = temp;
  stepStartTorque[step.id] = torque;

  currentStep++;
  updateProgress();

  // Aggiorna la tabella per mostrare il badge ACTIVE
  renderStepsTable();
}

function checkStepCondition(step) {
  if (!step?.condition) return false;

  const condition = step.condition;
  let currentValue;
  let targetValue = condition.value;

  switch (condition.type) {
    case "tempo":
      currentValue = timer - (stepStartTime[step.id] || timer);
      break;
    case "temperatura":
      currentValue = temp;
      break;
    case "torque":
      currentValue = torque;
      break;
    case "manuale":
      return false; // Le condizioni manuali non vengono controllate automaticamente
    default:
      return false;
  }

  switch (condition.operator) {
    case ">=":
      return currentValue >= targetValue;
    case "<=":
      return currentValue <= targetValue;
    case "==":
      return Math.abs(currentValue - targetValue) < 0.1; // Tolleranza per uguaglianza
    default:
      return false;
  }
}

function updateProgress() {
  const progress = Math.round((currentStep / steps.length) * 100);
  const progressBar = document.getElementById("cycleProgress");
  const progressText = document.getElementById("cycleProgressText");
  if (progressBar) {
    progressBar.value = progress;
  }
  if (progressText) {
    progressText.textContent = progress + "%";
  }
}

// Chart ciclo
const ctx = document.getElementById("cycleChart").getContext("2d");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Temperature °C",
        data: [],
        borderColor: "red",
        backgroundColor: "rgba(255,0,0,0.2)",
        yAxisID: "y",
      },
      {
        label: "Torque %",
        data: [],
        borderColor: "blue",
        backgroundColor: "rgba(0,0,255,0.2)",
        yAxisID: "y1",
      },
    ],
  },
  options: {
    responsive: true,
    animation: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Tempo (secondi)",
        },
        ticks: {
          maxTicksLimit: 10,
          callback: function (value, index, values) {
            // Mostra solo ogni 10° tick per evitare sovrapposizioni
            if (index % 10 === 0) {
              return this.getLabelForValue(value);
            }
            return "";
          },
        },
      },
      y: {
        min: 60,
        max: 200,
        title: {
          display: true,
          text: "Temperature (°C)",
        },
      },
      y1: {
        min: 0,
        max: 100,
        position: "right",
        title: {
          display: true,
          text: "Torque (%)",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Temperature and Torque Trend Over Time",
      },
    },
  },
});

// ================== DASHBOARD CHART ==================
let dashboardChart = null;

function initDashboardChart() {
  const dashboardCtx = document.getElementById("dashboardChart");
  if (!dashboardCtx) return;

  dashboardChart = new Chart(dashboardCtx.getContext("2d"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Temperature",
          data: [],
          borderColor: "#dc3545",
          backgroundColor: "rgba(220, 53, 69, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Torque",
          data: [],
          borderColor: "#007bff",
          backgroundColor: "rgba(0, 123, 255, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      interaction: { mode: "index", intersect: false },
      scales: {
        x: {
          display: true,
          grid: { display: false },
        },
        y: {
          min: 60,
          max: 200,
          position: "left",
          grid: { color: "rgba(0,0,0,0.1)" },
        },
        y1: {
          min: 0,
          max: 100,
          position: "right",
          grid: { display: false },
        },
      },
      plugins: {
        legend: { display: true, position: "top" },
      },
    },
  });
}

// ================== DASHBOARD UPDATES ==================
function updateDashboard() {
  // Aggiorna valori mockStatus con dati correnti
  mockStatus.temperature = temp;
  mockStatus.torque = torque;

  // Simula variazioni di altri parametri
  mockStatus.turbomixerSpeed = 1450 + Math.floor(Math.random() * 100 - 50);
  mockStatus.coolerTemp = 65 + Math.random() * 10 - 5;
  mockStatus.pumpFlow = 125 + Math.random() * 20 - 10;
  mockStatus.plcCpu = 12 + Math.random() * 8 - 4;

  // Aggiorna efficienza basata su performance
  if (currentStep > 0) {
    const targetTemp = 180;
    const tempDiff = Math.abs(temp - targetTemp);
    const tempEfficiency = Math.max(0, 100 - tempDiff * 2);
    const torqueEfficiency = Math.min(100, torque + 50);
    mockStatus.efficiency = (tempEfficiency + torqueEfficiency) / 2;
  }

  updateStatus();
  updateCurrentStepInfo();
  updateDashboardChart();
}

function updateCurrentStepInfo() {
  if (currentStep <= 0 || currentStep > steps.length) return;

  const step = steps[currentStep - 1];
  const stepTime = timer - (stepStartTime[step.id] || timer);

  updateStepDisplay(step);
  updateStepProgress(step, stepTime);
  updateStepTiming(stepTime);
}

function updateStepDisplay(step) {
  document.getElementById("currentStepName").textContent = step.name;
  document.getElementById("currentStepCondition").textContent =
    step.description;
}

function updateStepProgress(step, stepTime) {
  let stepProgress = calculateStepProgress(step, stepTime);

  const stepProgressBar = document.getElementById("stepProgress");
  const cycleProgressEl = document.getElementById("cycleProgressPercent");

  if (stepProgressBar) {
    stepProgress = Math.max(0, Math.min(100, stepProgress));
    stepProgressBar.style.width = stepProgress + "%";
    stepProgressBar.textContent = Math.round(stepProgress) + "%";
  }

  if (cycleProgressEl) {
    const cycleProgress = Math.round((currentStep / steps.length) * 100);
    cycleProgressEl.textContent = cycleProgress + "%";
  }
}

function calculateStepProgress(step, stepTime) {
  switch (step.condition.type) {
    case "tempo":
      return Math.min((stepTime / step.condition.value) * 100, 100);
    case "temperatura":
      return calculateTemperatureProgress(step);
    case "torque":
      return Math.min((torque / step.condition.value) * 100, 100);
    default:
      return 0;
  }
}

function calculateTemperatureProgress(step) {
  if (step.condition.operator === ">=") {
    return Math.min((temp / step.condition.value) * 100, 100);
  } else if (step.condition.operator === "<=") {
    return Math.min(((200 - temp) / (200 - step.condition.value)) * 100, 100);
  }
  return 0;
}

function updateStepTiming(stepTime) {
  const stepElapsedEl = document.getElementById("stepElapsed");
  const etaEl = document.getElementById("etaCompletion");

  if (stepElapsedEl) {
    const minutes = Math.floor(stepTime / 60);
    const seconds = stepTime % 60;
    stepElapsedEl.textContent = `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  if (etaEl) {
    const remainingSteps = steps.length - currentStep;
    const avgStepTime = 25; // secondi medi per step
    const etaSeconds = remainingSteps * avgStepTime;
    const etaMinutes = Math.ceil(etaSeconds / 60);
    etaEl.textContent = `~${etaMinutes} min`;
  }
}

function updateDashboardChart() {
  if (!dashboardChart) return;

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const timeLabel =
    minutes > 0
      ? `${minutes}:${seconds.toString().padStart(2, "0")}`
      : `${seconds}s`;

  // Mantiene 60 punti (1 minuto) per la dashboard
  if (dashboardChart.data.labels.length > 60) {
    dashboardChart.data.labels.shift();
    dashboardChart.data.datasets.forEach((ds) => ds.data.shift());
  }

  dashboardChart.data.labels.push(timeLabel);
  dashboardChart.data.datasets[0].data.push(Math.round(temp * 10) / 10);
  dashboardChart.data.datasets[1].data.push(Math.round(torque * 10) / 10);
  dashboardChart.update("none"); // Update senza animazioni
}

function simulateTemperature() {
  if (currentStep <= 2) {
    // Fase di riscaldamento
    temp += Math.random() * 2;
  } else if (currentStep >= 5 && currentStep <= 6) {
    // Fase di raffreddamento
    temp -= Math.random() * 1.5;
  } else {
    // Variazioni normali
    temp += Math.random() * 2 - 1;
  }
}

function simulateTorque() {
  if (currentStep === 4) {
    // Mixing veloce - torque più alto
    torque = Math.max(70, Math.min(95, torque + (Math.random() * 4 - 2)));
  } else if (currentStep === 3) {
    // Mixing lento - torque medio
    torque = Math.max(30, Math.min(60, torque + (Math.random() * 3 - 1.5)));
  } else {
    // Altre fasi
    torque = Math.max(0, Math.min(40, torque + (Math.random() * 6 - 3)));
  }
}

function updateChart() {
  // Formato tempo più leggibile
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const timeLabel =
    minutes > 0
      ? `${minutes}:${seconds.toString().padStart(2, "0")}`
      : `${seconds}s`;

  // Mantiene fino a 120 punti (2 minuti di storia)
  if (chart.data.labels.length > 120) {
    chart.data.labels.shift();
    chart.data.datasets.forEach((ds) => ds.data.shift());
  }
  chart.data.labels.push(timeLabel);
  chart.data.datasets[0].data.push(Math.round(temp * 10) / 10);
  chart.data.datasets[1].data.push(Math.round(torque * 10) / 10);
  chart.update();
}

function checkAndAdvanceStep() {
  if (currentStep > 0 && currentStep <= steps.length) {
    const currentStepData = steps[currentStep - 1];

    // Aggiorna il progresso della condizione
    updateConditionProgress(currentStepData);

    if (checkStepCondition(currentStepData)) {
      nextStep();
      return;
    }

    // Fallback: avanza automaticamente dopo 30 secondi
    const stepTime = timer - (stepStartTime[currentStepData.id] || timer);
    if (stepTime >= 30) {
      console.log(
        `Step ${currentStepData.name} avanzato automaticamente dopo 30s`
      );
      nextStep();
    }
  }
}

function updateConditionProgress(step) {
  if (!step?.condition) return;

  const condition = step.condition;
  let currentValue;
  let targetValue = condition.value;
  let progress = 0;

  switch (condition.type) {
    case "tempo":
      currentValue = timer - (stepStartTime[step.id] || timer);
      progress = Math.min((currentValue / targetValue) * 100, 100);
      break;
    case "temperatura":
      currentValue = temp;
      if (condition.operator === ">=") {
        progress = Math.min((currentValue / targetValue) * 100, 100);
      } else if (condition.operator === "<=") {
        progress = Math.min(
          ((200 - currentValue) / (200 - targetValue)) * 100,
          100
        );
      }
      break;
    case "torque":
      currentValue = torque;
      progress = Math.min((currentValue / targetValue) * 100, 100);
      break;
    case "manuale":
      // Progress rimane 0 per condizioni manuali
      break;
    default:
      // Progress rimane 0 per tipi sconosciuti
      break;
  }

  const progressBar = document.getElementById("conditionProgress");
  const progressText = document.getElementById("conditionProgressText");

  if (progressBar && progressText) {
    progress = Math.max(0, Math.min(100, progress));
    progressBar.style.width = progress + "%";
    progressText.textContent = Math.round(progress) + "%";

    // Cambia colore in base al progresso
    if (progress >= 100) {
      progressBar.className = "progress-bar bg-success";
    } else if (progress >= 75) {
      progressBar.className = "progress-bar bg-warning";
    } else {
      progressBar.className = "progress-bar bg-info";
    }
  }
}

setInterval(() => {
  timer++;
  simulateTemperature();
  simulateTorque();
  updateChart();
  checkAndAdvanceStep();
}, 1000);

// ================== RICETTE ==================
let recipes = [
  { name: "PVC Standard", temperature: 180, time: "12 min" },
  { name: "PVC Rigido", temperature: 190, time: "15 min" },
  { name: "PVC Flessibile", temperature: 170, time: "10 min" },
];

const recipesTable = document.querySelector("#recipesTable tbody");
const recipeModal = new bootstrap.Modal(document.getElementById("recipeModal"));

function renderRecipes() {
  recipesTable.innerHTML = "";
  recipes.forEach((r, index) => {
    recipesTable.innerHTML += `
      <tr>
        <td>${r.name}</td>
        <td>${r.temperature}</td>
        <td>${r.time}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editRecipe(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRecipe(${index})">Delete</button>
        </td>
      </tr>`;
  });
}

function openAddModal() {
  document.getElementById("modalTitle").textContent = "New Recipe";
  document.getElementById("recipeIndex").value = "";
  document.getElementById("recipeName").value = "";
  document.getElementById("recipeTemp").value = "";
  document.getElementById("recipeTime").value = "";
  recipeModal.show();
}

function editRecipe(index) {
  const r = recipes[index];
  document.getElementById("modalTitle").textContent = "Edit Recipe";
  document.getElementById("recipeIndex").value = index;
  document.getElementById("recipeName").value = r.name;
  document.getElementById("recipeTemp").value = r.temperature;
  document.getElementById("recipeTime").value = r.time;
  recipeModal.show();
}

function saveRecipe(event) {
  event.preventDefault();

  const name = document.getElementById("recipeName").value.trim();
  const temperature = parseInt(document.getElementById("recipeTemp").value);
  const time = document.getElementById("recipeTime").value.trim();

  // Validazione
  if (!name) {
    alert("Please enter the recipe name");
    return;
  }

  if (isNaN(temperature) || temperature < 50 || temperature > 250) {
    alert("Temperature must be between 50 and 250°C");
    return;
  }

  if (!time) {
    alert("Please enter the time");
    return;
  }

  const index = document.getElementById("recipeIndex").value;
  const recipe = { name, temperature, time };

  if (index === "") {
    recipes.push(recipe);
  } else {
    recipes[index] = recipe;
  }

  recipeModal.hide();
  renderRecipes();

  // Reset form
  document.getElementById("recipeForm").reset();
}

function deleteRecipe(index) {
  if (confirm("Do you want to delete this recipe?")) {
    recipes.splice(index, 1);
    renderRecipes();
  }
}
