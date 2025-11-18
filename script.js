const addWorkerBtn = document.querySelector(".add-worker-btn");
const workerForm = document.querySelector('.formulaire');
const appContainer = document.querySelector('.app-container');
const removeFrom = document.querySelector('.X');

addWorkerBtn.addEventListener('click', () => {
    workerForm.style.display = 'block';
    appContainer.style.filter = 'blur(20px)';
});

removeFrom.addEventListener('click', () => {
    workerForm.style.display = 'none';
    appContainer.style.filter = 'blur(0px)';
});
let j = 1;
function handleFormSubmit() {

    const name = document.getElementById("worker-name").value.trim();
    const role = document.getElementById("worker-role").value.trim();
    const image = document.getElementById("worker-photo").value.trim();
    const email = document.getElementById("worker-email").value.trim();
    const number = document.getElementById("worker-number").value.trim();

    const newExperience = [];

    const variantExperiences = document.querySelectorAll('.each-experience');
    console.log(variantExperiences);


    variantExperiences.forEach(row => {
        console.log(row);

        const experience = row.querySelector('input.worker-experience').value.trim();
        const company = row.querySelector('input.worker-company').value.trim();
        const year = row.querySelector('input.worker-years').value.trim();
        newExperience.push({
            experience,
            company,
            year
        });
        console.log(newExperience);

    })


    const newWorker = {
        id: j,
        name: name,
        role: role,
        image: image,
        email: email,
        number: number,
        experiences: newExperience
    }
    console.log(newWorker);

    const list = document.querySelector('.left-panel');
    const workerNew = document.createElement('ul');
    workerNew.classList.add('worker-list');
    workerNew.innerHTML = `
            <li class="worker">
                    <img src="${newWorker.image}">
                    <div>
                        <strong>${newWorker.name}</strong><br>
                        ${newWorker.role}
                    </div>
                    <button class="remove">X</button>
                </li>
    `
    list.appendChild(workerNew);
    console.log(list);
    
}

const confirmWorker = document.querySelector('.addWorker');
confirmWorker.addEventListener('click', () => {
    handleFormSubmit();
    workerForm.style.display = 'none';
    appContainer.style.filter = 'blur(0px)';

})


function addExperiences() {
    const container = document.querySelector('.experiences');

    // Create wrapper div
    const experienceDiv = document.createElement('div');
    experienceDiv.className = 'each-experience';

    // 1️⃣ Experience Label + Input
    const label1 = document.createElement('label');
    label1.textContent = "Experience";

    const input1 = document.createElement('input');
    input1.type = "text";
    input1.placeholder = "Enter your Experiences";
    input1.className = "worker-experience";

    // 2️⃣ Company Name Label + Input
    const label2 = document.createElement('label');
    label2.textContent = "Company Name";

    const input2 = document.createElement('input');
    input2.type = "text";
    input2.placeholder = "Company Name";
    input2.className = "worker-company";

    // 3️⃣ Years of Experience Label + Input
    const label3 = document.createElement('label');
    label3.textContent = "Years Of Experiences";

    const input3 = document.createElement('input');
    input3.type = "text";
    input3.placeholder = "Enter your Years Of Experiences";
    input3.className = "worker-years";

    // Append everything to the wrapper
    experienceDiv.appendChild(label1);
    experienceDiv.appendChild(input1);

    experienceDiv.appendChild(label2);
    experienceDiv.appendChild(input2);

    experienceDiv.appendChild(label3);
    experienceDiv.appendChild(input3);

    container.appendChild(experienceDiv);
}

const addExperienceBtn = document.querySelector('.add-experience');
addExperienceBtn.addEventListener('click', addExperiences);
