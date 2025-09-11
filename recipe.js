let recipes = [
  { name: "PVC Standard", temperature: 180, time: "12 min" },
  { name: "PVC Rigido", temperature: 190, time: "15 min" },
  { name: "PVC Flessibile", temperature: 170, time: "10 min" }
];

const tableBody = document.querySelector("#recipesTable tbody");
const recipeModal = new bootstrap.Modal(document.getElementById("recipeModal"));

function renderTable() {
  tableBody.innerHTML = "";
  recipes.forEach((r, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${r.name}</td>
        <td>${r.temperature}</td>
        <td>${r.time}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editRecipe(${index})">Modifica</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRecipe(${index})">Elimina</button>
        </td>
      </tr>
    `;
  });
}

function openAddModal() {
  document.getElementById("modalTitle").textContent = "Nuova Ricetta";
  document.getElementById("recipeIndex").value = "";
  document.getElementById("recipeName").value = "";
  document.getElementById("recipeTemp").value = "";
  document.getElementById("recipeTime").value = "";
  recipeModal.show();
}

function editRecipe(index) {
  const r = recipes[index];
  document.getElementById("modalTitle").textContent = "Modifica Ricetta";
  document.getElementById("recipeIndex").value = index;
  document.getElementById("recipeName").value = r.name;
  document.getElementById("recipeTemp").value = r.temperature;
  document.getElementById("recipeTime").value = r.time;
  recipeModal.show();
}

function saveRecipe(event) {
  event.preventDefault();
  const index = document.getElementById("recipeIndex").value;
  const recipe = {
    name: document.getElementById("recipeName").value,
    temperature: parseInt(document.getElementById("recipeTemp").value),
    time: document.getElementById("recipeTime").value
  };

  if (index === "") {
    recipes.push(recipe);
  } else {
    recipes[index] = recipe;
  }

  recipeModal.hide();
  renderTable();
}

function deleteRecipe(index) {
  if (confirm("Vuoi eliminare questa ricetta?")) {
    recipes.splice(index, 1);
    renderTable();
  }
}

renderTable();
