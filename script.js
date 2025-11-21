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
const assignOverlay = document.querySelector('.assign-overlay');
const closeAssign = document.querySelector('.close-assign');
let selectedZone;

addWorkerBtn.addEventListener("click", () => {
    workerForm.style.display = "block";
    appContainer.style.filter = "blur(20px)";
});

closeForm.addEventListener("click", () => {
    workerForm.style.display = "none";
    appContainer.style.filter = "blur(0px)";
});

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

function renderWorkersList() {
    const list = document.querySelector('.worker-list');
    list.innerHTML = "";

    const unassignedWorkers = workers.filter(worker => worker.assignedZone === null);

    unassignedWorkers.forEach(worker => {
        const li = document.createElement("li");
        li.classList.add("worker"); 
        li.setAttribute("onclick", `details(${worker.id})`);
        li.innerHTML = `
            <img src="${worker.image}" alt="${worker.name}">
            <div>
                <strong>${worker.name}</strong><br>
                ${worker.role}
            </div>
            <button class="remove" onclick="event.stopPropagation(); updateWorker(${worker.id})">Update</button>
        `;
        list.appendChild(li);
    });
}

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
        if (exp && company && year) {
            experiences.push({ experience: exp, company: company, year: year });
        }
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

    document.getElementById("worker-name").value = "";
    document.getElementById("worker-photo").value = "";
    document.getElementById("worker-email").value = "";
    document.getElementById("worker-number").value = "";
    document.querySelector('.experiences').innerHTML = `
        <div class="each-experience">
            <label>Experience</label>
            <input class="worker-experience" type="text" placeholder="Enter your Experiences">
            <label>Company Name</label>
            <input class="worker-company" type="text" placeholder="Company Name">
            <label>Years Of Experiences</label>
            <input class="worker-years" type="text" placeholder="Enter your Years Of Experiences">
        </div>
    `;

    workerForm.style.display = "none";
    appContainer.style.filter = "blur(0px)";
}

document.querySelector('.addWorker').addEventListener('click', handleFormSubmit);

function details(workerId) {
    const worker = workers.find(w => w.id === workerId);
    modal.querySelector('.modal-content').innerHTML = `
        <div class="first-part">
            <img src="${worker.image}" class="modal-avatar" alt="${worker.name}">
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

function assignWorkers(zoneNum) {
    selectedZone = zoneNum;
    assignOverlay.style.display = 'flex';
    appContainer.style.filter = 'blur(20px)';
    
    const modalBox = document.querySelector('.bd');
    modalBox.innerHTML = '';
    const roles = zoneRules[zoneNum];

    const availableWorkers = workers.filter(worker => 
        roles.includes(worker.role) && worker.assignedZone === null
    );

    if (availableWorkers.length === 0) {
        modalBox.innerHTML = '<p>No available workers for this zone.</p>';
        return;
    }

    availableWorkers.forEach(worker => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${worker.image}" alt="${worker.name}">
            <div>
                <h2>${worker.name}</h2>
                <p>${worker.role}</p>
            </div>
            <button onclick="addToZone(${worker.id})" class="edit-button">Add</button>
        `;
        modalBox.appendChild(card);
    });
}

function addToZone(workerId) {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
        worker.assignedZone = selectedZone;
        saveData();
        renderWorkersList();
        
        const zone = document.querySelectorAll('.zone')[selectedZone - 1];
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-worker-id', workerId);
        card.innerHTML = `
            <img src="${worker.image}" alt="${worker.name}">
            <div>
                <h2>${worker.name}</h2>
                <p>${worker.role}</p>
            </div>
            <button onclick="removeFromZone(${workerId})" class="edit-button">Remove</button>
        `;
        zone.appendChild(card);
        
        assignOverlay.style.display = 'none';
        appContainer.style.filter = 'blur(0px)';
    }
}

function removeFromZone(workerId) {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
        worker.assignedZone = null;
        saveData();
        renderWorkersList();
        
        const zone = document.querySelectorAll('.zone')[selectedZone - 1];
        const cardToRemove = zone.querySelector(`[data-worker-id="${workerId}"]`);
        if (cardToRemove) {
            cardToRemove.remove();
        }
    }
}

function updateWorker(workerId) {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
        document.getElementById("worker-name").value = worker.name;
        document.getElementById("worker-role").value = worker.role;
        document.getElementById("worker-photo").value = worker.image;
        document.getElementById("worker-email").value = worker.email;
        document.getElementById("worker-number").value = worker.number;
        
        const experiencesContainer = document.querySelector('.experiences');
        experiencesContainer.innerHTML = '';
        
        worker.experiences.forEach(exp => {
            const div = document.createElement('div');
            div.className = 'each-experience';
            div.innerHTML = `
                <label>Experience</label>
                <input type="text" class="worker-experience" value="${exp.experience}">
                <label>Company Name</label>
                <input type="text" class="worker-company" value="${exp.company}">
                <label>Years of Experience</label>
                <input type="text" class="worker-years" value="${exp.year}">
            `;
            experiencesContainer.appendChild(div);
        });
        
        workers = workers.filter(w => w.id !== workerId);
        saveData();
        renderWorkersList();
        
        workerForm.style.display = "block";
        appContainer.style.filter = "blur(20px)";
    }
}

closeAssign.addEventListener('click', () => {
    assignOverlay.style.display = 'none';
    appContainer.style.filter = 'blur(0px)';
});

function init() {
    loadData();
    renderWorkersList();
    
    // Charger les employés déjà affectés aux zones
    workers.forEach(worker => {
        if (worker.assignedZone !== null) {
            const zone = document.querySelectorAll('.zone')[worker.assignedZone - 1];
            if (zone) {
                const card = document.createElement('div');
                card.className = 'card';
                card.setAttribute('data-worker-id', worker.id);
                card.innerHTML = `
                    <img src="${worker.image}" alt="${worker.name}">
                    <div>
                        <h2>${worker.name}</h2>
                        <p>${worker.role}</p>
                    </div>
                    <button onclick="removeFromZone(${worker.id})" class="edit-button">Remove</button>
                `;
                zone.appendChild(card);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', init);