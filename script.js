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