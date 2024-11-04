const setInitialDate = (id) => {
    const endDate = document.querySelector(`#${id}`);
    const now = new Date();
    const nowString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    endDate.value = nowString;
};

const singleTask = (task) => {
    let moveButtonText = task.status === "active" ? "Hacer" : task.status === "in-progress" ? "Finalizar" : "";
    return (`<article id=${task.id}>
        <div class="task-header">
            <span>${task.id}</span>
            <span class="${task.status}">${task.status}</span>
        </div>
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <div class="task-header">
            <span>${task.category_description}</span>
            <span>${task.endDate.slice(0, 16).split("T")[0]} - ${task.endDate.slice(0, 16).split("T")[1]}</span>
        </div>
        <button class="actions delete" type="button" name="delete"><i class="fa-solid fa-trash"></i>Eliminar</button>
        <button class="actions edit" type="button" name="edit"><i class="fa-solid fa-edit"></i>Editar</button>
        ${moveButtonText ? `<button class="actions move" type="button" name="move">${moveButtonText}</button>` : ""}
    </article>`);
};

const printFromLocalStorage = (storageTasks) => {
    const tasks = JSON.parse(localStorage.getItem(storageTasks));
    if (tasks) {
        tasks.forEach(task => {
            const taskContainer = document.querySelector('#' + (task.status === "active" ? "toDo" : task.status === "in-progress" ? "doing" : "done"));
            taskContainer.innerHTML += singleTask(task);
        });
    } else {
        console.log("No tasks in local storage");
    }
};

const printFromSave = (task, replace = false) => {
    const section = task.status === "active" ? "toDo" : task.status === "in-progress" ? "doing" : "done";
    const taskContainer = document.querySelector('#' + section);
    if (replace) {
        const existingTask = document.getElementById(task.id);
        if (existingTask) {
            existingTask.outerHTML = singleTask(task);
        }
    } else {
        taskContainer.innerHTML += singleTask(task);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    printFromLocalStorage('taskList');
    setInitialDate('endDate');

    const taskForm = document.querySelector('#taskForm');
    let taskList = JSON.parse(localStorage.getItem('taskList')) || [];

    taskForm.addEventListener('submit', event => {
        event.preventDefault();
        if (event.submitter.id === "clear") {
            taskForm.reset();
            setInitialDate('endDate');
        } else if (event.submitter.id === "save") {
            const task = {
                id: Math.random().toString(16).slice(2),
                title: event.target.title.value,
                description: event.target.description.value,
                assigned_to: event.target.assignedTo.value,
                endDate: event.target.endDate.value,
                category: event.target.category.value,
                category_description: event.target.category.options[event.target.category.selectedIndex].text,
                status: "active"
            };

            taskList.push(task);
            localStorage.setItem('taskList', JSON.stringify(taskList));

            printFromSave(task);
            taskForm.reset();
            setInitialDate('endDate');
        }
    });

    const moveTask = (task) => {
        if (task.status === "active") {
            task.status = "in-progress";
        } else if (task.status === "in-progress") {
            task.status = "done";
        }

        const taskIndex = taskList.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
            taskList[taskIndex] = task;
            localStorage.setItem('taskList', JSON.stringify(taskList));

            document.getElementById(task.id).remove();
            printFromSave(task);
        }
    };

    const handleTaskClick = (container) => {
        container.addEventListener('click', event => {
            const taskElement = event.target.closest('article');
            const taskId = taskElement?.id;
            if (!taskId) return;

            const task = taskList.find(t => t.id === taskId);

            if (event.target.name === 'delete') {
                taskElement.remove();
                taskList = taskList.filter(t => t.id !== taskId);
                localStorage.setItem('taskList', JSON.stringify(taskList));
            }

            if (event.target.name === 'edit') {
                const editForm = document.querySelector('#taskForm');
                editForm.title.value = task.title;
                editForm.description.value = task.description;
                editForm.assignedTo.value = task.assigned_to;
                editForm.endDate.value = task.endDate;
                editForm.category.value = task.category;

                const saveButton = document.querySelector('#save');
                saveButton.id = "edit";
                saveButton.innerHTML = "Editar";
                saveButton.classList.replace('save', 'edit');

                saveButton.addEventListener('click', e => {
                    e.preventDefault();
                    const updatedTask = {
                        ...task,
                        title: editForm.title.value,
                        description: editForm.description.value,
                        assigned_to: editForm.assignedTo.value,
                        endDate: editForm.endDate.value,
                        category: editForm.category.value,
                        category_description: editForm.category.options[editForm.category.selectedIndex].text
                    };

                    const taskIndex = taskList.findIndex(t => t.id === taskId);
                    taskList[taskIndex] = updatedTask;
                    localStorage.setItem('taskList', JSON.stringify(taskList));

                    printFromSave(updatedTask, true);
                    saveButton.id = "save";
                    saveButton.innerHTML = "Guardar Tarea";
                    saveButton.classList.replace('edit', 'save');

                    editForm.reset();
                    setInitialDate('endDate');
                });
            }

            if (event.target.name === 'move') {
                moveTask(task);
            }
        });
    };

    handleTaskClick(document.querySelector('#toDo'));
    handleTaskClick(document.querySelector('#doing'));
    handleTaskClick(document.querySelector('#done'));
});


