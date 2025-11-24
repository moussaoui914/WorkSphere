let workers = [];
let nextId = 1;

const zoneRules = {
    1: ["Receptionist", "IT Technician", "Security Agent", "Manager", "Cleaning", "Other"],
    2: ["IT Technician", "Manager"],
    3: ["Security Agent", "Manager"],
    4: ["Receptionist", "Manager","Security Agent"],
    5: ["Receptionist", "IT Technician", "Security Agent", "Manager", "Cleaning", "Other"],
    6: ["Manager", "Security Agent", "Other", "IT Technician", "Receptionist"]
};

const zonesWithRedBackground = [1, 3, 4, 6];

const addWorkerBtn = document.querySelector(".add-worker-btn");
const workerForm = document.querySelector(".formulaire");
const appContainer = document.querySelector(".app-container");
const closeForm = document.querySelector(".X");
const modal = document.querySelector('.details-modal');
const closeModal = document.querySelector('.close-modal');
const assignOverlay = document.querySelector('.assign-overlay');
const closeAssign = document.querySelector('.close-assign');
let selectedZone;

// Regex patterns for validation
const patterns = {
    name: /^[A-Za-zÀ-ÿ\s]{2,50}$/,
    email: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
    phone: /^[\+]?[0-9\s\-\(\)]{10,}$/,
    url: /^https?:\/\/.+/,
    experience: /^[A-Za-zÀ-ÿ0-9\s\-\.,]{2,100}$/,
    company: /^[A-Za-zÀ-ÿ0-9\s\-\.,&]{2,100}$/
};

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
            <img src="${worker.image}" alt="${worker.name}" onerror="this.src='https://via.placeholder.com/150?text=Image+Not+Found'">
            <div>
                <strong>${worker.name}</strong><br>
                ${worker.role}
            </div>
            <button class="remove" onclick="event.stopPropagation(); updateWorker(${worker.id})">Update</button>
        `;
        list.appendChild(li);
    });
}

function validateFormField(value, pattern, fieldName) {
    if (!value.trim()) return `${fieldName} is required`;
    if (!pattern.test(value)) return `Invalid ${fieldName} format`;
    return null;
}

function validateDateRange(fromDate, toDate) {
    if (!fromDate || !toDate) return "Both dates are required";
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const today = new Date();
    
    if (from > to) return "From date cannot be after To date";
    if (to > today) return "To date cannot be in the future";
    if (from > today) return "From date cannot be in the future";
    
    return null;
}

function handleFormSubmit(e) {
    e.preventDefault();

    // Validate main form fields
    const name = document.getElementById("worker-name").value.trim();
    const role = document.getElementById("worker-role").value;
    const image = document.getElementById("worker-photo").value.trim();
    const email = document.getElementById("worker-email").value.trim();
    const number = document.getElementById("worker-number").value.trim();

    // Validate required fields
    if (!name || !role || !image) {
        alert("Name, Role and Image are required.");
        return;
    }

    // Validate field formats
    const nameError = validateFormField(name, patterns.name, "Name");
    const emailError = email ? validateFormField(email, patterns.email, "Email") : null;
    const phoneError = number ? validateFormField(number, patterns.phone, "Phone number") : null;
    const urlError = validateFormField(image, patterns.url, "Image URL");

    if (nameError || emailError || phoneError || urlError) {
        alert([nameError, emailError, phoneError, urlError].filter(Boolean).join('\n'));
        return;
    }

    // Validate experiences
    const experiences = [];
    let hasExperienceErrors = false;
    const experienceErrors = [];

    document.querySelectorAll('.each-experience').forEach((row, index) => {
        const exp = row.querySelector('.worker-experience').value.trim();
        const company = row.querySelector('.worker-company').value.trim();
        const fromDate = row.querySelector('.worker-from-date').value;
        const toDate = row.querySelector('.worker-to-date').value;

        // Validate experience fields
        const expError = validateFormField(exp, patterns.experience, `Experience ${index + 1}`);
        const companyError = validateFormField(company, patterns.company, `Company ${index + 1}`);
        const dateError = validateDateRange(fromDate, toDate);

        if (expError || companyError || dateError) {
            experienceErrors.push(`Experience ${index + 1}: ${[expError, companyError, dateError].filter(Boolean).join(', ')}`);
            hasExperienceErrors = true;
            return;
        }

        // Calculate duration in years
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const durationMs = to - from;
        const durationYears = (durationMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);

        experiences.push({ 
            experience: exp, 
            company: company, 
            fromDate: fromDate,
            toDate: toDate,
            duration: durationYears
        });
    });

    if (hasExperienceErrors) {
        alert("Please correct the following errors:\n" + experienceErrors.join('\n'));
        return;
    }

    if (experiences.length === 0) {
        alert("At least one experience is required");
        return;
    }

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

    e.target.reset();
    document.querySelector('.experiences').innerHTML = `
        <div class="each-experience">
            <label>Experience</label>
            <input class="worker-experience" type="text" placeholder="Enter your Experiences" pattern="[A-Za-zÀ-ÿ0-9\s\-\.,]{2,100}" title="2-100 characters">
            
            <label>Company Name</label>
            <input class="worker-company" type="text" placeholder="Company Name" pattern="[A-Za-zÀ-ÿ0-9\s\-\.,&]{2,100}" title="2-100 characters">
            
            <div class="date-range">
                <div class="date-input">
                    <label>From Date</label>
                    <input class="worker-from-date" type="date" required>
                </div>
                <div class="date-input">
                    <label>To Date</label>
                    <input class="worker-to-date" type="date" required>
                </div>
            </div>
            
            <button type="button" class="remove-experience">Remove</button>
        </div>
    `;

    workerForm.style.display = "none";
    appContainer.style.filter = "blur(0px)";
}

document.getElementById('worker-form').addEventListener('submit', handleFormSubmit);

function details(workerId) {
    const worker = workers.find(w => w.id === workerId);
    
    const experiencesHTML = worker.experiences.map(ex => {
        const fromDate = new Date(ex.fromDate).toLocaleDateString();
        const toDate = new Date(ex.toDate).toLocaleDateString();
        return `
            <li>
                <strong>${ex.experience}</strong> – ${ex.company}<br>
                <small>${fromDate} to ${toDate} (${ex.duration} years)</small>
            </li>
        `;
    }).join('');

    modal.querySelector('.modal-content').innerHTML = `
        <div class="first-part">
            <img src="${worker.image}" class="modal-avatar" alt="${worker.name}" onerror="this.src='https://via.placeholder.com/150?text=Image+Not+Found'">
            <h2>${worker.name}</h2>
        </div>
        <div class="second-part">
            <p><strong>Role:</strong> ${worker.role}</p>
            <p><strong>Email:</strong> ${worker.email}</p>
            <p><strong>Phone:</strong> ${worker.number}</p>
            <h3>Experiences</h3>
            <ul>
                ${experiencesHTML}
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
        <input type="text" class="worker-experience" placeholder="Enter experience" pattern="[A-Za-zÀ-ÿ0-9\s\-\.,]{2,100}" title="2-100 characters">
        
        <label>Company Name</label>
        <input type="text" class="worker-company" placeholder="Company" pattern="[A-Za-zÀ-ÿ0-9\s\-\.,&]{2,100}" title="2-100 characters">
        
        <div class="date-range">
            <div class="date-input">
                <label>From Date</label>
                <input class="worker-from-date" type="date" required>
            </div>
            <div class="date-input">
                <label>To Date</label>
                <input class="worker-to-date" type="date" required>
            </div>
        </div>
        
        <button type="button" class="remove-experience">Remove</button>
    `;
    container.appendChild(div);
    div.querySelector('.remove-experience').addEventListener('click',() => div.remove());
}

document.querySelector('.add-experience').addEventListener('click', addExperiences);

function assignWorkers(zoneNum) {
    selectedZone = zoneNum;
    
    const workersInZone = workers.filter(worker => worker.assignedZone === zoneNum);
    if (workersInZone.length >= 5) {
        alert("Cette zone est déjà pleine (maximum 5 membres)");
        return;
    }
    
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
            <img src="${worker.image}" alt="${worker.name}" onerror="this.src='https://via.placeholder.com/150?text=Image+Not+Found'">
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
        const workersInZone = workers.filter(w => w.assignedZone === selectedZone);
        if (workersInZone.length >= 5) {
            alert("Cette zone est déjà pleine (maximum 5 membres)");
            return;
        }
        
        worker.assignedZone = selectedZone;
        saveData();
        renderWorkersList();
        
        const zone = document.querySelectorAll('.zone')[selectedZone - 1];
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-worker-id', workerId);
        card.innerHTML = `
            <img src="${worker.image}" alt="${worker.name}" onerror="this.src='https://via.placeholder.com/150?text=Image+Not+Found'">
            <div>
                <h2>${worker.name}</h2>
                <p>${worker.role}</p>
            </div>
            <button onclick="removeFromZone(${workerId})" class="edit-button">Remove</button>
        `;
        zone.appendChild(card);
        
        updateZoneBackground(selectedZone);
        
        assignOverlay.style.display = 'none';
        appContainer.style.filter = 'blur(0px)';
    }
}

function removeFromZone(workerId) {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
        const zoneNum = worker.assignedZone;
        worker.assignedZone = null;
        saveData();
        renderWorkersList();
        
        const zone = document.querySelectorAll('.zone')[zoneNum - 1];
        const cardToRemove = zone.querySelector(`[data-worker-id="${workerId}"]`);
        if (cardToRemove) {
            cardToRemove.remove();
        }
        
        updateZoneBackground(zoneNum);
    }
}

function updateZoneBackground(zoneNum) {
    const zone = document.querySelectorAll('.zone')[zoneNum - 1];
    const workersInZone = workers.filter(worker => worker.assignedZone === zoneNum);
    
    if (zonesWithRedBackground.includes(zoneNum)) {
        if (workersInZone.length === 0) {
            zone.classList.add('empty-zone');
        } else {
            zone.classList.remove('empty-zone');
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
                <input type="text" class="worker-experience" value="${exp.experience}" pattern="[A-Za-zÀ-ÿ0-9\s\-\.,]{2,100}" title="2-100 characters">
                
                <label>Company Name</label>
                <input type="text" class="worker-company" value="${exp.company}" pattern="[A-Za-zÀ-ÿ0-9\s\-\.,&]{2,100}" title="2-100 characters">
                
                <div class="date-range">
                    <div class="date-input">
                        <label>From Date</label>
                        <input class="worker-from-date" type="date" value="${exp.fromDate}" required>
                    </div>
                    <div class="date-input">
                        <label>To Date</label>
                        <input class="worker-to-date" type="date" value="${exp.toDate}" required>
                    </div>
                </div>
                
                <button type="button" class="remove-experience">Remove</button>
            `;
            experiencesContainer.appendChild(div);
            div.querySelector('.remove-experience').addEventListener('click',() => div.remove());
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
    
    workers.forEach(worker => {
        if (worker.assignedZone !== null) {
            const zone = document.querySelectorAll('.zone')[worker.assignedZone - 1];
            if (zone) {
                const card = document.createElement('div');
                card.className = 'card';
                card.setAttribute('data-worker-id', worker.id);
                card.innerHTML = `
                    <img src="${worker.image}" alt="${worker.name}" onerror="this.src='https://via.placeholder.com/150?text=Image+Not+Found'">
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
    
    for (let i = 1; i <= 6; i++) {
        updateZoneBackground(i);
    }
}

document.addEventListener('DOMContentLoaded', init);