document.addEventListener('DOMContentLoaded', () => {
    const printFromLocalStorage = (key) => {
        const storedTasks = JSON.parse(localStorage.getItem(key)) || [];
        storedTasks.forEach(task => {
            printFromSave(task);
        });
    };

    const printFromSave = (task) => {
        const section = getTaskSection(task.status);
        const taskContainer = document.querySelector('#' + section);
        taskContainer.insertAdjacentHTML('beforeend', singleTask(task));
    };

    const singleTask = (task) => {
        return `
            <article id="${task.id}" class="task">
                <h4>${task.title}</h4>
                <p>${task.description}</p>
                <p><strong>Asignado a:</strong> ${task.assigned_to}</p>
                <p><strong>Fecha:</strong> ${task.endDate}</p>
                <p><strong>Categoría:</strong> ${task.category_description}</p>
                <div class="task-actions">
                    ${task.status !== 'deleted' ? `
                        <button name="edit" class="edit">Editar</button>
                        <button name="move" class="move">Mover</button>
                        <button name="delete" class="delete">Eliminar</button>
                    ` : `
                        <button name="restore" class="restore">Restaurar</button>
                        <button name="deletePermanent" class="deletePermanent">Eliminar Permanente</button>
                    `}
                </div>
            </article>
        `;
    };
    

    const getTaskSection = (status) => {
        if (status === "active") return "toDo";
        if (status === "in-progress") return "doing";
        if (status === "done") return "done";
        if (status === "deleted") return "trash";
    };

    const setInitialDate = (elementId) => {
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 16);
        document.getElementById(elementId).value = formattedDate;
    };

    setInitialDate('endDate');

    const taskForm = document.querySelector('#taskForm');
    let taskList = JSON.parse(localStorage.getItem('taskList')) || [];
    let editingTaskId = null;

    printFromLocalStorage('taskList');

    taskForm.addEventListener('submit', event => {
        event.preventDefault();
        if (event.submitter.id === "clear") {
            taskForm.reset();
            setInitialDate('endDate');
            editingTaskId = null;
            document.getElementById('save').textContent = 'Guardar Tarea';
        } else if (event.submitter.id === "save") {
            const task = {
                id: editingTaskId || Math.random().toString(16).slice(2),
                title: event.target.title.value,
                description: event.target.description.value,
                assigned_to: event.target.assignedTo.value,
                endDate: event.target.endDate.value,
                category: event.target.category.value,
                category_description: event.target.category.options[event.target.category.selectedIndex].text,
                status: "active"
            };

            if (editingTaskId) {
                const taskIndex = taskList.findIndex(t => t.id === editingTaskId);
                taskList[taskIndex] = task;
                localStorage.setItem('taskList', JSON.stringify(taskList));

                const taskElement = document.getElementById(editingTaskId);
                if (taskElement) {
                    taskElement.outerHTML = singleTask(task);
                }

                editingTaskId = null;
                document.getElementById('save').textContent = 'Guardar Tarea';
            } else {
                taskList.push(task);
                localStorage.setItem('taskList', JSON.stringify(taskList));

                printFromSave(task);
            }

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
                task.status = 'deleted';
                const taskIndex = taskList.findIndex(t => t.id === taskId);
                taskList[taskIndex] = task;
                localStorage.setItem('taskList', JSON.stringify(taskList));

                taskElement.remove();
                printFromSave(task);
            }

            if (event.target.name === 'move') {
                moveTask(task);
            }

            if (event.target.name === 'deletePermanent') {
                const taskIndex = taskList.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    taskList.splice(taskIndex, 1);
                    localStorage.setItem('taskList', JSON.stringify(taskList));

                    taskElement.remove();
                }
            }

            if (event.target.name === 'restore') {
                task.status = 'active';
                const taskIndex = taskList.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    taskList[taskIndex] = task;
                    localStorage.setItem('taskList', JSON.stringify(taskList));

                    taskElement.remove();
                    printFromSave(task);
                }
            }

            if (event.target.name === 'edit') {
                document.getElementById('title').value = task.title;
                document.getElementById('description').value = task.description;
                document.getElementById('assignedTo').value = task.assigned_to;
                document.getElementById('endDate').value = task.endDate;
                document.getElementById('category').value = task.category;

                editingTaskId = task.id;
                document.getElementById('save').textContent = 'Actualizar Tarea';
            }
        });
    };

    handleTaskClick(document.querySelector('#taskContainer'));


    
});

function toggleTrash() {
    const trashSection = document.getElementById("trash");
    trashSection.style.display = trashSection.style.display === "none" ? "block" : "none";
}

document.addEventListener('DOMContentLoaded', () => {
    const createCategoryBtn = document.getElementById('createCategoryBtn');
    const newCategoryForm = document.getElementById('newCategoryForm');
    const saveCategoryBtn = document.getElementById('saveCategoryBtn');
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    const categorySelect = document.getElementById('category');

    // Mostrar el formulario de creación de categoría cuando el usuario hace clic en el botón
    createCategoryBtn.addEventListener('click', () => {
        newCategoryForm.style.display = 'block'; // Mostrar formulario
    });

    // Cancelar y ocultar el formulario de creación de categoría
    cancelCategoryBtn.addEventListener('click', () => {
        newCategoryForm.style.display = 'none'; // Ocultar formulario
    });

    // Guardar la nueva categoría y agregarla al <select>
    saveCategoryBtn.addEventListener('click', () => {
        const newCategoryName = document.getElementById('newCategoryName').value.trim();

        if (newCategoryName) {
            // Crear la nueva opción para el select
            const newOption = document.createElement('option');
            newOption.value = newCategoryName;
            newOption.textContent = newCategoryName;

            // Añadir la nueva opción al <select>
            categorySelect.appendChild(newOption);

            // Limpiar el input y ocultar el formulario
            document.getElementById('newCategoryName').value = '';
            newCategoryForm.style.display = 'none';
        } else {
            alert("Por favor, ingresa un nombre válido para la categoría.");
        }
    });
});
