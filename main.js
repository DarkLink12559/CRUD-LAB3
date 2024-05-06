var db;
var editMode = false;
var editStudentId;

var request = indexedDB.open("studentsDB", 1);

request.onerror = function(event) {
    console.log("Error abriendo la base de datos.");
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    var objectStore = db.createObjectStore("students", { keyPath: "id", autoIncrement:true });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("lastName", "lastName", { unique: false });
    objectStore.createIndex("grade", "grade", { unique: false });
};

request.onsuccess = function(event) {
    console.log("Base de datos abierta correctamente.");
    db = event.target.result;
    showStudents();
};

function addStudent() {
    var transaction = db.transaction(["students"], "readwrite");
    var objectStore = transaction.objectStore("students");
    var name = document.getElementById("name").value;
    var lastName = document.getElementById("lastName").value;
    var grade = parseInt(document.getElementById("grade").value);

    if (editMode) {
        var student = {
            id: editStudentId,
            name: name,
            lastName: lastName,
            grade: grade
        };

        var request = objectStore.put(student);
        request.onsuccess = function(event) {
            console.log("Estudiante actualizado correctamente.");
            showStudents();
            resetForm();
        };

        request.onerror = function(event) {
            console.log("Error actualizando estudiante.");
        };

        editMode = false;
    } else {
        var student = {
            name: name,
            lastName: lastName,
            grade: grade
        };

        var request = objectStore.add(student);
        request.onsuccess = function(event) {
            console.log("Estudiante agregado correctamente.");
            showStudents();
            resetForm();
        };

        request.onerror = function(event) {
            console.log("Error agregando estudiante.");
        };
    }
}

function showStudents() {
    var transaction = db.transaction(["students"], "readonly");
    var objectStore = transaction.objectStore("students");
    var studentTable = document.getElementById("studentTable").getElementsByTagName("tbody")[0];
    studentTable.innerHTML = "";

    objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            var row = studentTable.insertRow();
            row.insertCell(0).textContent = cursor.value.name;
            row.insertCell(1).textContent = cursor.value.lastName;
            row.insertCell(2).textContent = cursor.value.grade;
            var actionsCell = row.insertCell(3);
            var editButton = document.createElement("button");
            editButton.textContent = "Editar";
            editButton.onclick = () => editStudent(cursor.key);
            actionsCell.appendChild(editButton);
            var deleteButton = document.createElement("button");
            deleteButton.textContent = "Eliminar";
            deleteButton.onclick = () => deleteStudent(cursor.key);
            actionsCell.appendChild(deleteButton);

            cursor.continue();
        }
    };
}

function editStudent(id) {
    var transaction = db.transaction(["students"], "readonly");
    var objectStore = transaction.objectStore("students");
    var request = objectStore.get(id);
    request.onsuccess = (event) => {
        var student = event.target.result;
        if (student) {
            document.getElementById("name").value = student.name;
            document.getElementById("lastName").value = student.lastName;
            document.getElementById("grade").value = student.grade;
            document.getElementById("studentId").value = id;
            document.getElementById("submitButton").textContent = "Guardar Cambios";
            document.getElementById("cancelButton").style.display = "inline";
            editMode = true;
            editStudentId = id;
        }
    };
}

function deleteStudent(id) {
    var transaction = db.transaction(["students"], "readwrite");
    var objectStore = transaction.objectStore("students");
    var request = objectStore.delete(id);
    request.onsuccess = (event) => {
        console.log("Estudiante eliminado correctamente.");
        showStudents();
    };
}

function resetForm() {
    document.getElementById("name").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("grade").value = "";
    document.getElementById("studentId").value = "";
    document.getElementById("submitButton").textContent = "Agregar";
    document.getElementById("cancelButton").style.display = "none";
    editMode = false;
    editStudentId = null;
}

document.getElementById("studentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    addStudent();
});

document.getElementById("cancelButton").addEventListener("click", () => {
    resetForm();
});
