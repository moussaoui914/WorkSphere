// =========================================
// VARIABLES
// =========================================
let workers = [];
let nextId = 1;

const zoneRules = {
    1: ["Receptionist", "IT Technician", "Security Agent", "Manager", "Cleaning", "Other"],
    2: ["IT Technician", "Manager"],
    3: ["Security Agent", "Manager"],
    4: ["Receptionist", "Manager"],
    5: ["Receptionist", "IT Technician", "Security Agent", "Manager", "Cleaning", "Other"],
    6: ["Manager", "Security Agent", "Other", "IT Technician", "Receptionist"]
};

const addWorkerBtn = document.querySelector(".add-worker-btn");
const workerForm = document.querySelector(".formulaire");
const appContainer = document.querySelector(".app-container");
const closeForm = document.querySelector(".X");

const modal = document.querySelector('.details-modal');
const closeModal = document.querySelector('.close-modal');

let selectedZone;

// =========================================
// OUVRIR / FERMER FORMULAIRE
// =========================================
addWorkerBtn.addEventListener("click", () => {
    workerForm.style.display = "block";
    appContainer.style.filter = "blur(20px)";
});

closeForm.addEventListener("click", () => {
    workerForm.style.display = "none";
    appContainer.style.filter = "blur(0px)";
});

// =========================================
// LOCALSTORAGE
// =========================================
function loadData() {
    const savedWorkers = localStorage.getItem('workers');
    workers = savedWorkers ? JSON.parse(savedWorkers) : [];
    if (workers.length > 0) {
        nextId = Math.max(...workers.map(w => w.id)) + 1;
    }
}

function saveData() {
    localStorage.setItem('workers', JSON.stringify(workers));
}

// =========================================
// RENDU WORKERS
// =========================================
function renderWorkersList() {
    const list = document.querySelector('.worker-list');
    list.innerHTML = "";

    workers.forEach(worker => {
        const li = document.createElement("li");
        li.classList.add("worker");
        li.setAttribute("onclick", `details(${worker.id})`);
        li.innerHTML = `
            <img src="${worker.image}">
            <div>
                <strong>${worker.name}</strong><br>
                ${worker.role}
            </div>
            <button class="remove" data-id="${worker.id}">Update</button>
        `;
        list.appendChild(li);
    });
}

// =========================================
// AJOUT WORKER
// =========================================
function handleFormSubmit() {
    const name = document.getElementById("worker-name").value.trim();
    const role = document.getElementById("worker-role").value;
    const image = document.getElementById("worker-photo").value.trim();
    const email = document.getElementById("worker-email").value.trim();
    const number = document.getElementById("worker-number").value.trim();

    if (!name || !role || !image) {
        alert("Name, Role and Image are required.");
        return;
    }

    const experiences = [];
    document.querySelectorAll('.each-experience').forEach(row => {
        const exp = row.querySelector('.worker-experience').value.trim();
        const company = row.querySelector('.worker-company').value.trim();
        const year = row.querySelector('.worker-years').value.trim();
        experiences.push({ experience: exp, company: company, year: year });
    });

    const newWorker = {
        id: nextId++,
        name,
        role,
        image,
        email,
        number,
        experiences,
        assignedZone: null
    };

    workers.push(newWorker);
    saveData();
    renderWorkersList();

    workerForm.style.display = "none";
    appContainer.style.filter = "blur(0px)";
}

document.querySelector('.addWorker').addEventListener('click', handleFormSubmit);

// =========================================
// DETAILS MODAL
// =========================================
function details(workerId) {
    const worker = workers.find(w => w.id === workerId);
    modal.querySelector('.modal-content').innerHTML = `
        <div class="first-part">
            <img src="${worker.image}" class="modal-avatar">
            <h2>${worker.name}</h2>
        </div>
        <div class="second-part">
            <p><strong>Role:</strong> ${worker.role}</p>
            <p><strong>Email:</strong> ${worker.email}</p>
            <p><strong>Phone:</strong> ${worker.number}</p>
            <h3>Experiences</h3>
            <ul>
                ${worker.experiences.map(ex => `
                    <li>
                        <strong>${ex.experience}</strong> – ${ex.company} (${ex.year})
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    modal.style.display = "block";
    appContainer.style.filter = "blur(20px)";
}

closeModal.addEventListener('click', () => {
    modal.style.display = "none";
    appContainer.style.filter = "blur(0px)";
});

// =========================================
// AJOUT EXPERIENCES
// =========================================
function addExperiences() {
    const container = document.querySelector('.experiences');
    const div = document.createElement('div');
    div.className = 'each-experience';
    div.innerHTML = `
        <label>Experience</label>
        <input type="text" class="worker-experience" placeholder="Enter experience">
        <label>Company Name</label>
        <input type="text" class="worker-company" placeholder="Company">
        <label>Years of Experience</label>
        <input type="text" class="worker-years" placeholder="Years">
    `;
    container.appendChild(div);
}

document.querySelector('.add-experience').addEventListener('click', addExperiences);

// =========================================
// ASSIGN WORKERS TO ZONES
// =========================================
function assignWorkers(zoneNum) {
    selectedZone = zoneNum;
    document.querySelector('.assign-overlay').style.display = 'flex';
    const modalBox = document.querySelector('.bd');
    modalBox.innerHTML = '';
    const roles = zoneRules[zoneNum];

    workers.forEach(worker => {
        if (roles.includes(worker.role) && worker.assignedZone === null) {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${worker.image}" alt="${worker.name}">
                <div>
                    <h2>${worker.name}</h2>
                    <p>${worker.role}</p>
                </div>
                <button onclick="addToZone(this)" class="edit-button">Add</button>
            `;
            modalBox.appendChild(card);
        }
    });
}

function addToZone(button){
    const card = button.closest('.card');
    card.querySelector('button').remove();
    const zones = document.querySelectorAll('.zone');
    const zzone = zones[selectedZone-1];
    zzone.appendChild(card);

    const workerName = card.querySelector('h2').textContent;
    const worker = workers.find(w => w.name === workerName);
    if(worker) worker.assignedZone = selectedZone;
}

// =========================================
// INITIALISATION
// =========================================
function init() {
    loadData();
    renderWorkersList();
}

document.addEventListener('DOMContentLoaded', init);
