const setInitialDate = (id) => {

    const endDate = document.querySelector(`#${id}`);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const nowString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    endDate.value = nowString;

}

const singleTask = (task) => {
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
        <button class="actions delete" type="button" name="delete" ><i class="fa-solid fa-trash"></i>Eliminar</button>
        <button class="actions edit" type="button" name="edit"><i class="fa-solid fa-edit"></i>Editar</button>
    </article>`);
}

const printFromLocalStorage = (storageTasks, printNode) => {
    const tasks = JSON.parse(localStorage.getItem(storageTasks));

    if (tasks) {
        tasks.forEach(task => {
            const taskContainer = document.querySelector('#' + printNode);
            taskContainer.innerHTML += singleTask(task);
        })
    }
    else {
        console.log("No tasks in local storage");
    }
    
};

const printFromSave = (task, printNode, replace=false) => {
    const taskContainer = document.querySelector('#' + printNode);
    replace? taskContainer.outerHTML = singleTask(task) : taskContainer.innerHTML += singleTask(task);
}

//here is the beginning of the code, out of here are the functions
document.addEventListener('DOMContentLoaded', () => {

    printFromLocalStorage('taskList', 'toDo');
    setInitialDate('endDate');

    const taskForm = document.querySelector('#taskForm')
    // Set de default date for datetime-local input



    let taskList = [];
    taskForm.addEventListener('submit', event => {
        event.preventDefault();
        // console.log(event.target.category.options[event.target.category.selectedIndex].text)
        if (event.submitter.id === "clear") {
            taskForm.reset();
            setInitialDate('endDate');
        }
        if (event.submitter.id === "save") {
            const task = {
                id: Math.random().toString(16).slice(2),
                title: event.target.title.value,
                description: event.target.description.value,
                assigned_to: event.target.assignedTo.value,
                // endDate: new Date(new Date(event.target.endDate.value).getTime() - ( 5 * 60 * 60 * 1000 )),
                endDate: event.target.endDate.value,
                category: event.target.category.value,
                category_description: event.target.category.options[event.target.category.selectedIndex].text,
                status: "active"
            };


            // check if the object exists in the local storage
            localStorage.getItem('taskList') ? taskList = JSON.parse(localStorage.getItem('taskList')) : taskList;
            // and save it in the tasks array
            taskList.push(task)

            // Print the task in the DOM
            printFromSave(task, 'toDo');

            // Save the taskList in the local storage
            localStorage.setItem('taskList', JSON.stringify(taskList));

            // reset the form
            taskForm.reset();
            setInitialDate('endDate');

        }
    })


    const todo = document.querySelector('#toDo');
    todo.addEventListener('click', event => {
        if (event.target.name === 'delete') {
            let taskList = JSON.parse(localStorage.getItem('taskList'));
            const task = event.target.parentElement;
            const taskId = task.id;
            // console.log(taskId);
            task.remove();
            taskList = taskList.filter(task => task.id !== taskId);
            localStorage.setItem('taskList', JSON.stringify(taskList));
        }
        if (event.target.name === 'edit') {
            let taskList = JSON.parse(localStorage.getItem('taskList'));
            const task = event.target.parentElement;
            const taskId = task.id;
            const taskToEdit = taskList.find(task => task.id === taskId);
            console.log(taskToEdit);
            const editForm = document.querySelector('#taskForm');
            editForm.title.value = taskToEdit.title;
            editForm.description.value = taskToEdit.description;
            editForm.assignedTo.value = taskToEdit.assigned_to;
            editForm.endDate.value = taskToEdit.endDate;
            editForm.category.value = taskToEdit.category;
            editForm.category_description = taskToEdit.category_description;
            // change the button save to edit
            const saveButton = document.querySelector('#save');
            saveButton.id = "edit";
            saveButton.innerHTML = "Editar";
            saveButton.classList.remove('save');
            saveButton.classList.add('edit');

            // after edit, save the changes , clicking on the edit submit button and changeagain the button to save
            saveButton.addEventListener('click', event => {
                event.preventDefault();
                const task = {
                    id: taskId,
                    title: editForm.title.value,
                    description: editForm.description.value,
                    assigned_to: editForm.assignedTo.value,
                    endDate: editForm.endDate.value,
                    category: editForm.category.value,
                    category_description: editForm.category.options[editForm.category.selectedIndex].text,
                    status: taskToEdit.status
                };
                const taskList = JSON.parse(localStorage.getItem('taskList'));
                const taskIndex = taskList.findIndex(task => task.id === taskId);
                taskList[taskIndex] = task;
                localStorage.setItem('taskList', JSON.stringify(taskList));
                printFromSave(task, taskId, true);
                editForm.reset();
                setInitialDate('endDate');
                saveButton.id = "save";
                saveButton.innerHTML = "Guardar";
                saveButton.classList.remove('edit');
                saveButton.classList.add('save');
            });


            // editForm.status = taskToEdit.status;
            // editForm.taskId = taskId;

            // console.log(editForm);
        }
    });


});

