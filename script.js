const addWorkerBtn = document.querySelector(".add-worker-btn");
const workerForm = document.querySelector('.formulaire');
const appContainer = document.querySelector('.app-container');
const removeFrom = document.querySelector('.X');

const modal = document.querySelector('.details-modal');
const closeModal = document.querySelector('.close-modal');

let workers = [];
let nextId = 1;  

addWorkerBtn.addEventListener('click', () => {
    workerForm.style.display = 'block';
    appContainer.style.filter = 'blur(20px)';
});

removeFrom.addEventListener('click', () => {
    workerForm.style.display = 'none';
    appContainer.style.filter = 'blur(0px)';
});

function loadData() {
    const savedWorkers = localStorage.getItem('workers');
    workers = savedWorkers ? JSON.parse(savedWorkers) : [];

    // FIX: calculate next ID
    if (workers.length > 0) {
        nextId = Math.max(...workers.map(w => w.id)) + 1;
    }
}

function saveData() {
    localStorage.setItem('workers', JSON.stringify(workers));
}

function handleFormSubmit() {

    const name = document.getElementById("worker-name").value.trim();
    const role = document.getElementById("worker-role").value.trim();
    const image = document.getElementById("worker-photo").value.trim();
    const email = document.getElementById("worker-email").value.trim();
    const number = document.getElementById("worker-number").value.trim();

    const experiences = [];
    const rows = document.querySelectorAll('.each-experience');

    rows.forEach(row => {
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
        experiences
    };

    workers.push(newWorker);
    saveData();
    renderWorkersList(workers);

    workerForm.style.display = "none";
    appContainer.style.filter = "blur(0px)";
}

document.querySelector('.addWorker').addEventListener('click', handleFormSubmit);

function renderWorkersList(workerListAll) {
    const list = document.querySelector('.worker-list');

    list.innerHTML = "";

    workerListAll.forEach(worker => {
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

/* ----------------- DETAILS MODAL ------------------ */
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
    console.log(worker);

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

function init() {
    loadData();
    renderWorkersList(workers);
}

document.addEventListener('DOMContentLoaded', init);
