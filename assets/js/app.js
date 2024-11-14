document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('category');
    const categoryBlocksContainer = document.getElementById('categoryBlocksContainer');
    const createCategoryBtn = document.getElementById('createCategoryBtn');
    const newCategoryForm = document.getElementById('newCategoryForm');
    const saveCategoryBtn = document.getElementById('saveCategoryBtn');
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');
    const categoryToDeleteSelect = document.getElementById('categoryToDelete');
    const taskForm = document.getElementById('taskForm');
    let taskList = JSON.parse(localStorage.getItem('taskList')) || [];
    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    let editingTaskId = null;

    const setInitialDate = (elementId) => {
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 16);
        document.getElementById(elementId).value = formattedDate;
    };

    setInitialDate('endDate');

    const loadCategories = () => {
        categories.forEach(category => addCategoryToUI(category));
        toggleDeleteCategoryElements(); // Para habilitar/deshabilitar el select de eliminar categorías
    };

    const printFromLocalStorage = () => {
        taskList.forEach(task => printFromSave(task));
    };

    const printFromSave = (task) => {
        const categoryBlock = getCategoryBlock(task.category_description);
        categoryBlock.style.display = 'block';
        categoryBlock.insertAdjacentHTML('beforeend', singleTask(task));
    };

    const singleTask = (task) => `
        <article id="${task.id}" class="task">
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <p><strong>Asignado a:</strong> ${task.assigned_to}</p>
            <p><strong>Fecha:</strong> ${task.endDate}</p>
            <p><strong>Categoría:</strong> ${task.category_description}</p>
            <div class="task-actions">
                ${task.status !== 'deleted' ? `
                    <select name="move" class="move-dropdown">
                        ${categories.map(cat => `
                            <option value="${cat}" ${cat === task.category_description ? "selected" : ""}>${cat}</option>
                        `).join('')}
                    </select>
                    <button name="edit" class="edit">Editar</button>
                    <button name="delete" class="delete">Eliminar</button>
                ` : `
                    <button name="restore" class="restore">Restaurar</button>
                    <button name="deletePermanent" class="deletePermanent">Eliminar Permanente</button>
                `}
            </div>
        </article>
    `;

    const getCategoryBlock = (categoryName) => {
        let categoryBlock = document.querySelector(`.category-block[data-category="${categoryName}"]`);
        if (!categoryBlock) {
            categoryBlock = document.createElement('div');
            categoryBlock.classList.add('category-block');
            categoryBlock.dataset.category = categoryName;
            categoryBlock.innerHTML = `<h3>${categoryName}</h3>`;
            categoryBlocksContainer.appendChild(categoryBlock);
        }
        return categoryBlock;
    };

    const checkAndHideEmptyCategoryBlocks = () => {
        document.querySelectorAll('.category-block').forEach(block => {
            if (block.querySelectorAll('.task').length === 0) {
                block.style.display = 'none';
            }
        });
    };

    deleteCategoryBtn.addEventListener('click', () => {
        const categoryToDelete = categoryToDeleteSelect.value;
        if (categoryToDelete && categories.includes(categoryToDelete)) {
            categories = categories.filter(category => category !== categoryToDelete);
            localStorage.setItem('categories', JSON.stringify(categories));

            const categoryBlock = document.querySelector(`.category-block[data-category="${categoryToDelete}"]`);
            if (categoryBlock) {
                categoryBlock.remove();
            }

            taskList = taskList.map(task => {
                if (task.category_description === categoryToDelete) {
                    task.category_description = '';
                    task.category = '';
                }
                return task;
            });

            localStorage.setItem('taskList', JSON.stringify(taskList));
            checkAndHideEmptyCategoryBlocks();

            const categoryOption = document.querySelector(`#categoryToDelete option[value="${categoryToDelete}"]`);
            if (categoryOption) {
                categoryOption.remove();
            }

            const taskCategoryOption = document.querySelector(`#category option[value="${categoryToDelete}"]`);
            if (taskCategoryOption) {
                taskCategoryOption.remove();
            }

            toggleDeleteCategoryElements();
            alert("Categoría eliminada exitosamente.");
        } else {
            alert("La categoría no existe o no fue seleccionada.");
        }
    });

    createCategoryBtn.addEventListener('click', () => {
        newCategoryForm.style.display = 'block';
    });

    cancelCategoryBtn.addEventListener('click', () => {
        newCategoryForm.style.display = 'none';
        document.getElementById('newCategoryName').value = '';
    });

    saveCategoryBtn.addEventListener('click', () => {
        const newCategoryName = document.getElementById('newCategoryName').value.trim();
        if (newCategoryName && !categories.includes(newCategoryName)) {
            categories.push(newCategoryName);
            localStorage.setItem('categories', JSON.stringify(categories));
            addCategoryToUI(newCategoryName);
            document.getElementById('newCategoryName').value = '';
            newCategoryForm.style.display = 'none';
            toggleDeleteCategoryElements();
        } else {
            alert("Por favor, ingresa un nombre válido para la categoría o asegúrate de que no exista.");
        }
    });

    const addCategoryToUI = (categoryName) => {
        const newOption = document.createElement('option');
        newOption.value = categoryName;
        newOption.textContent = categoryName;
        categorySelect.appendChild(newOption);

        const newDeleteOption = document.createElement('option');
        newDeleteOption.value = categoryName;
        newDeleteOption.textContent = categoryName;
        categoryToDeleteSelect.appendChild(newDeleteOption);

        const categoryBlock = getCategoryBlock(categoryName);
        categoryBlock.style.display = 'none';
    };

    taskForm.addEventListener('submit', event => {
        event.preventDefault();
        const task = {
            id: editingTaskId || Math.random().toString(16).slice(2),
            title: taskForm.title.value,
            description: taskForm.description.value,
            assigned_to: taskForm.assignedTo.value,
            endDate: taskForm.endDate.value,
            category: taskForm.category.value,
            category_description: taskForm.category.options[taskForm.category.selectedIndex].text,
            status: "active"
        };

        if (editingTaskId) {
            const taskIndex = taskList.findIndex(t => t.id === editingTaskId);
            taskList[taskIndex] = task;
            localStorage.setItem('taskList', JSON.stringify(taskList));
            document.getElementById(editingTaskId).outerHTML = singleTask(task);
            editingTaskId = null;
            document.getElementById('save').textContent = 'Guardar Tarea';
        } else {
            taskList.push(task);
            localStorage.setItem('taskList', JSON.stringify(taskList));
            printFromSave(task);
        }

        taskForm.reset();
        setInitialDate('endDate');
    });

    handleTaskClick(document.querySelector('#categoryBlocksContainer'));

    function handleTaskClick(container) {
        container.addEventListener('change', event => {
            if (event.target.classList.contains('move-dropdown')) {
                const taskElement = event.target.closest('article');
                const taskId = taskElement?.id;
                const newCategory = event.target.value;

                const task = taskList.find(t => t.id === taskId);
                if (task) {
                    task.category = newCategory;
                    task.category_description = newCategory;
                    updateTaskList(task);
                    taskElement.remove();
                    printFromSave(task);
                    checkAndHideEmptyCategoryBlocks();
                }
            }
        });

        container.addEventListener('click', event => {
            const taskElement = event.target.closest('article');
            const taskId = taskElement?.id;
            if (!taskId) return;

            const task = taskList.find(t => t.id === taskId);

            if (event.target.name === 'delete') {
                task.status = 'deleted';
                updateTaskList(task);
                taskElement.remove();
                checkAndHideEmptyCategoryBlocks();
            }

            if (event.target.name === 'edit') {
                populateTaskForm(task);
            }

            if (event.target.name === 'restore') {
                task.status = 'active';
                updateTaskList(task);
                printFromSave(task);
            }

            if (event.target.name === 'deletePermanent') {
                deleteTaskPermanently(taskId);
                taskElement.remove();
                checkAndHideEmptyCategoryBlocks();
            }
        });
    }

    function populateTaskForm(task) {
        taskForm.title.value = task.title;
        taskForm.description.value = task.description;
        taskForm.assignedTo.value = task.assigned_to;
        taskForm.endDate.value = task.endDate;
        taskForm.category.value = task.category;
        editingTaskId = task.id;
        document.getElementById('save').textContent = 'Actualizar Tarea';
    }

    function deleteTaskPermanently(taskId) {
        taskList = taskList.filter(task => task.id !== taskId);
        localStorage.setItem('taskList', JSON.stringify(taskList));
    }

    function updateTaskList(task) {
        const taskIndex = taskList.findIndex(t => t.id === task.id);
        taskList[taskIndex] = task;
        localStorage.setItem('taskList', JSON.stringify(taskList));
    }

    const toggleDeleteCategoryElements = () => {
        const categoryOptionsExist = categoryToDeleteSelect.options.length > 1;
        categoryToDeleteSelect.disabled = !categoryOptionsExist;
        deleteCategoryBtn.disabled = !categoryOptionsExist;
    };

    loadCategories();
    printFromLocalStorage();
});
