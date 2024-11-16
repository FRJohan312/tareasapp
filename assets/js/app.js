document.addEventListener('DOMContentLoaded', () => {
    const categoriaSelect = document.getElementById('categoria');
    const blockContenedorCatg = document.getElementById('blockContenedorCatg');
    const crearBotonCategoria = document.getElementById('crearBotonCategoria');
    const nuevoFormularioCategoria = document.getElementById('nuevoFormularioCategoria');
    const botonGuardarCategoria = document.getElementById('botonGuardarCategoria');
    const botonCancelarCategoria = document.getElementById('botonCancelarCategoria');
    const eliminarCategoriaForm = document.getElementById('eliminarCategoriaForm');
    const CancelarEliminar = document.getElementById('CancelarEliminar');
    const eliminarCategoriaBtn = document.getElementById('eliminarCategoriaBtn');
    const botonEliminarCatg = document.getElementById('botonEliminarCatg');
    const categoriaToDeleteSelect = document.getElementById('categoriaToDelete');
    const formularioTareas = document.getElementById('formularioTareas');
    const botonPapelera = document.getElementById('botonPapelera');
    const contenedorPapelera = document.getElementById('contenedorPapelera');
    const contenedorTareasEliminadas = document.getElementById('contenedorTareasEliminadas');

    let listaTareas = JSON.parse(localStorage.getItem('listaTareas')) || [];
    let categorias = JSON.parse(localStorage.getItem('categorias')) || [];
    let editandotareaId = null;

    // Configurar fecha mínima en el campo de "Fecha final"
    const fechaFinInput = document.getElementById("fechaFin");

    const setMinDateForFechaFin = () => {
        const ahora = new Date();
        const fechaMinima = ahora.toISOString().slice(0, 16); // Formato 'YYYY-MM-DDTHH:mm'
        fechaFinInput.setAttribute("min", fechaMinima);
    };

    // Establecer la fecha mínima al cargar la página
    setMinDateForFechaFin();

    // Reestablecer la fecha mínima al reiniciar el formulario
    formularioTareas.addEventListener('reset', () => {
        setMinDateForFechaFin();
    });

    // Sincronizar el contenido de Quill con el textarea antes de enviar el formulario
    document.getElementById('formularioTareas').addEventListener('submit', function() {
        document.getElementById('description').value = quill.root.innerHTML;
    });

    // Mostrar/Ocultar Papelera
    botonPapelera.addEventListener('click', () => {
        contenedorPapelera.style.display = contenedorPapelera.style.display === 'none' ? 'block' : 'none';
        loadborradotareas();
    });

    const loadborradotareas = () => {
        contenedorTareasEliminadas.innerHTML = '';
        listaTareas.filter(tarea => tarea.status === 'borrado').forEach(tarea => {
            contenedorTareasEliminadas.insertAdjacentHTML('beforeend', tareaBorrada(tarea));
        });
    };

    const tareaBorrada = (tarea) => `
        <article id="${tarea.id}" class="tarea borrado-tarea">
            <h4>${tarea.title}</h4>
            <p>${tarea.description}</p>
            <p><strong>Asignado a:</strong> ${tarea.assigned_to}</p>
            <p><strong>Fecha:</strong> ${tarea.fechaFin}</p>
            <p><strong>Categoría:</strong> ${tarea.categoria_description}</p>
            <div class="tarea-actions">
                <button name="restore" class="restore">Restaurar Tarea</button>
                <button name="deletePermanent" class="deletePermanent">Eliminar Permanentemente</button>
            </div>
        </article>
    `;

    const setInitialDate = (elementId) => {
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 16);
        document.getElementById(elementId).value = formattedDate;
    };

    setInitialDate('fechaFin');

    const loadcategorias = () => {
        categorias.forEach(categoria => addcategoriaToUI(categoria));
        toggleDeletecategoriaElements();
    };

    const printFromLocalStorage = () => {
        listaTareas.forEach(tarea => {
            if (tarea.status !== 'borrado') {
                mostrarGuardado(tarea);
            }
        });
    };

    const mostrarGuardado = (tarea) => {
        const blockCategoria = obtenerblockCategoria(tarea.categoria_description);
        blockCategoria.style.display = 'block';
        blockCategoria.insertAdjacentHTML('beforeend', unaTarea(tarea));
    };

    const unaTarea = (tarea) => `
    <article id="${tarea.id}" class="tarea">
        <h4>${tarea.title}</h4>
        <div class="tarea-actions">
            <button name="preview" class="preview">Vista previa</button>
            <button name="edit" class="edit">Editar</button>
            <button name="delete" class="delete">Eliminar</button>
        </div>
    </article>
    `;

    const obtenerblockCategoria = (categoriaName) => {
        let blockCategoria = document.querySelector(`.categoria-block[data-categoria="${categoriaName}"]`);
        if (!blockCategoria) {
            blockCategoria = document.createElement('div');
            blockCategoria.classList.add('categoria-block');
            blockCategoria.dataset.categoria = categoriaName;
            blockCategoria.innerHTML = `<h3>${categoriaName}</h3>`;
            blockContenedorCatg.appendChild(blockCategoria);
        }
        return blockCategoria;
    };

    const ocultarCategoriaVacia = () => {
        document.querySelectorAll('.categoria-block').forEach(block => {
            if (block.querySelectorAll('.tarea').length === 0) {
                block.style.display = 'none';
            }
        });
    };

    // Función de eliminar categoría y tareas relacionadas
    botonEliminarCatg.addEventListener('click', (event) => {
        // Prevenir el envío del formulario
        event.preventDefault();
    
        const categoriaToDelete = categoriaToDeleteSelect.value;
        if (categoriaToDelete && categorias.includes(categoriaToDelete)) {
            categorias = categorias.filter(categoria => categoria !== categoriaToDelete);
            localStorage.setItem('categorias', JSON.stringify(categorias));
    
            listaTareas = listaTareas.filter(tarea => tarea.categoria_description !== categoriaToDelete);
            localStorage.setItem('listaTareas', JSON.stringify(listaTareas));
    
            const blockCategoria = document.querySelector(`.categoria-block[data-categoria="${categoriaToDelete}"]`);
            if (blockCategoria) {
                blockCategoria.remove();
            }
    
            const categoriaOption = document.querySelector(`#categoriaToDelete option[value="${categoriaToDelete}"]`);
            if (categoriaOption) {
                categoriaOption.remove();
            }
    
            const tareacategoriaOption = document.querySelector(`#categoria option[value="${categoriaToDelete}"]`);
            if (tareacategoriaOption) {
                tareacategoriaOption.remove();
            }
    
            toggleDeletecategoriaElements();
            ocultarCategoriaVacia();
    
            alert("Categoría y sus tareas asociadas eliminadas exitosamente.");
        } else {
            alert("La categoría no existe o no fue seleccionada.");
        }
    });
    
    
    
    // VISTA
    document.addEventListener('click', (event) => {
        if (event.target.name === 'preview') {
            const tareaElement = event.target.closest('article');
            const tareaId = tareaElement?.id;
            const tarea = listaTareas.find(t => t.id === tareaId);
    
            if (tarea) {
                document.getElementById('previewTitle').textContent = tarea.title;
                document.getElementById('previewDescription').innerHTML = tarea.description;
                document.getElementById('previewAsignadoA').textContent = tarea.assigned_to;
                document.getElementById('previewfechaFin').textContent = tarea.fechaFin;
                document.getElementById('previewcategoria').textContent = tarea.categoria_description;
    
                document.getElementById('previewModal').style.display = 'block';
            }
        }
    });
    
    // Cerrar el modal al hacer clic en el botón de cerrar
    document.getElementById('closePreview').addEventListener('click', () => {
        document.getElementById('previewModal').style.display = 'none';
    });
    

    crearBotonCategoria.addEventListener('click', () => {
        event.preventDefault();
        nuevoFormularioCategoria.style.display = 'block';
    });

    eliminarCategoriaBtn.addEventListener('click', () => {
        event.preventDefault();
        eliminarCategoriaForm.style.display = 'block';
    });

    botonCancelarCategoria.addEventListener('click', () => {
        event.preventDefault();
        nuevoFormularioCategoria.style.display = 'none';
        document.getElementById('nuevoNombreCategoria').value = '';
    });

    CancelarEliminar.addEventListener('click', () => {
        event.preventDefault();
        eliminarCategoriaForm.style.display = 'none';
        document.getElementById('eliminarCategoria').value = '';
    });

    botonGuardarCategoria.addEventListener('click', () => {
        const nuevoNombreCategoria = document.getElementById('nuevoNombreCategoria').value.trim();
        if (nuevoNombreCategoria && !categorias.includes(nuevoNombreCategoria)) {
            categorias.push(nuevoNombreCategoria);
            localStorage.setItem('categorias', JSON.stringify(categorias));
            addcategoriaToUI(nuevoNombreCategoria);
            document.getElementById('nuevoNombreCategoria').value = '';
            nuevoFormularioCategoria.style.display = 'none';
            toggleDeletecategoriaElements();
        } else {
            alert("Por favor, ingresa un nombre válido para la categoría o asegúrate de que no exista.");
        }
    });

        // Limitar el campo de descripción a 100 caracteres en el archivo app.js
    const descriptionField = document.getElementById('description');

    descriptionField.addEventListener('input', () => {
        if (descriptionField.value.length > 100) {
            descriptionField.value = descriptionField.value.slice(0, 100);
            alert('La descripción no puede exceder los 100 caracteres.');
        }
    });

    const addcategoriaToUI = (categoriaName) => {
        const newOption = document.createElement('option');
        newOption.value = categoriaName;
        newOption.textContent = categoriaName;
        categoriaSelect.appendChild(newOption);

        const newDeleteOption = document.createElement('option');
        newDeleteOption.value = categoriaName;
        newDeleteOption.textContent = categoriaName;
        categoriaToDeleteSelect.appendChild(newDeleteOption);

        const blockCategoria = obtenerblockCategoria(categoriaName);
        blockCategoria.style.display = 'none';
    };

    formularioTareas.addEventListener('submit', event => {
        event.preventDefault();
        const tarea = {
            id: editandotareaId || Math.random().toString(16).slice(2),
            title: formularioTareas.title.value,
            description: formularioTareas.description.value,
            assigned_to: formularioTareas.AsignadoA.value,
            fechaFin: formularioTareas.fechaFin.value,
            categoria: formularioTareas.categoria.value,
            categoria_description: formularioTareas.categoria.options[formularioTareas.categoria.selectedIndex].text,
            status: "active"
        };

        if (editandotareaId) {
            const tareaIndex = listaTareas.findIndex(t => t.id === editandotareaId);
            listaTareas[tareaIndex] = tarea;
            localStorage.setItem('listaTareas', JSON.stringify(listaTareas));
            document.getElementById(editandotareaId).outerHTML = unaTarea(tarea);
            editandotareaId = null;
            document.getElementById('guardar').textContent = 'Guardar Tarea';
        } else {
            listaTareas.push(tarea);
            localStorage.setItem('listaTareas', JSON.stringify(listaTareas));
            mostrarGuardado(tarea);
        }

        formularioTareas.reset();
        setInitialDate('fechaFin');
    });

    handletareaClick(document.querySelector('#blockContenedorCatg'));
    handleTrashClick();

    function handletareaClick(container) {
        container.addEventListener('change', event => {
            if (event.target.classList.contains('move-dropdown')) {
                const tareaElement = event.target.closest('article');
                const tareaId = tareaElement?.id;
                const newcategoria = event.target.value;

                const tarea = listaTareas.find(t => t.id === tareaId);
                if (tarea) {
                    tarea.categoria = newcategoria;
                    tarea.categoria_description = newcategoria;
                    updatelistaTareas(tarea);
                    tareaElement.remove();
                    mostrarGuardado(tarea);
                    ocultarCategoriaVacia();
                }
            }
        });

        container.addEventListener('click', event => {
            const tareaElement = event.target.closest('article');
            const tareaId = tareaElement?.id;
            if (!tareaId) return;

            const tarea = listaTareas.find(t => t.id === tareaId);

            if (event.target.name === 'delete') {
                tarea.status = 'borrado';
                updatelistaTareas(tarea);
                tareaElement.remove();
                ocultarCategoriaVacia();
            }

            if (event.target.name === 'edit') {
                populateformularioTareas(tarea);
            }
        });
    }

    function handleTrashClick() {
        contenedorTareasEliminadas.addEventListener('click', event => {
            const tareaElement = event.target.closest('article');
            const tareaId = tareaElement?.id;
            if (!tareaId) return;

            const tarea = listaTareas.find(t => t.id === tareaId);

            if (event.target.name === 'restore') {
                tarea.status = 'active';
                updatelistaTareas(tarea);
                tareaElement.remove();
                mostrarGuardado(tarea);
                ocultarCategoriaVacia();
            }

            if (event.target.name === 'deletePermanent') {
                deletetareaPermanently(tareaId);
                tareaElement.remove();
                ocultarCategoriaVacia();
            }
        });
    }

    function populateformularioTareas(tarea) {
        formularioTareas.title.value = tarea.title;
        formularioTareas.description.value = tarea.description;
        formularioTareas.AsignadoA.value = tarea.assigned_to;
        formularioTareas.fechaFin.value = tarea.fechaFin;
        formularioTareas.categoria.value = tarea.categoria;
        editandotareaId = tarea.id;
        document.getElementById('guardar').textContent = 'Actualizar Tarea';
    }

    function deletetareaPermanently(tareaId) {
        listaTareas = listaTareas.filter(tarea => tarea.id !== tareaId);
        localStorage.setItem('listaTareas', JSON.stringify(listaTareas));
    }

    function updatelistaTareas(tarea) {
        const tareaIndex = listaTareas.findIndex(t => t.id === tarea.id);
        listaTareas[tareaIndex] = tarea;
        localStorage.setItem('listaTareas', JSON.stringify(listaTareas));
    }

    const toggleDeletecategoriaElements = () => {
        const categoriaOptionsExist = categoriaToDeleteSelect.options.length > 1;
        categoriaToDeleteSelect.disabled = !categoriaOptionsExist;
        botonEliminarCatg.disabled = !categoriaOptionsExist;
    };

    loadcategorias();
    printFromLocalStorage();
});
