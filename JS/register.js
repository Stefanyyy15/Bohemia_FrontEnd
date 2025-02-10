window.addEventListener("load", function () {
    let preloader = document.getElementById("preloader");
    preloader.classList.add("fade-out");
    setTimeout(() => {
        preloader.style.display = "none";
        document.getElementById("contenido").classList.remove("hidden");
    }, 1000);
});

document.addEventListener("DOMContentLoaded", function () {
    const passwordField = document.getElementById("password");
    const toggleButton = document.getElementById("togglePassword");
    const toggleIcon = document.getElementById("toggleIcon");

    toggleButton.addEventListener("click", function () {
        if (passwordField.type === "password") {
            passwordField.type = "text";
            toggleIcon.classList.remove("fa-eye-slash");
            toggleIcon.classList.add("fa-eye");
        } else {
            passwordField.type = "password";
            toggleIcon.classList.remove("fa-eye");
            toggleIcon.classList.add("fa-eye-slash");
        }
    });
});


// PETICIONES A LA API 

const urlUser = "http://localhost:8080/bohemia-0.0.1-SNAPSHOT/api/users";


async function peticionPost(url, data) {
    try {
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJjYW1wdXNjbCIsInN1YiI6IlBhekVuRWxBcmlwb3JvQGVtYWlsLmNvbSIsImF1dGhvcml0aWVzIjpbIlJPTEVfVVNFUiJdLCJpYXQiOjE3MzgyNTM2OTIsImV4cCI6MTczOTExNzY5Mn0.NF7WvRmMlRBj5qJ5BciFg2nT_Hs02WhhyMLdjSX7euf9Vx9X_zV914fxWPkNuQJJO7qZ0_nYNzh7j3GmLVxmgw'
            },
            body: JSON.stringify(data)
        });
        console.log('Response Status', respuesta.status);
        if (respuesta.ok) {
            return await respuesta.json();
        } else {
            console.error('Error', respuesta.status);
            const textoError = await respuesta.text();
            console.error('Detalle del error:', textoError);
            return null;
        }
    } catch (error) {
        console.error("Error POST", error);
        return null;
    }
}

// FUNCION PARA LA PAGINA REGISTRO

async function agregarUsuario(url) {
    const fullname = document.getElementById("fullname").value.trim();
    let username = document.getElementById("username").value.trim().replace(/\s+/g, "_");
    const mail = document.getElementById("mail").value.trim();
    const password = document.getElementById("password").value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullname || !username || !mail || !password) {
        alert("All fields are required.");
        return;
    }

    if (!emailRegex.test(mail)) {
        alert("Please enter a valid email.");
        return;
    }

    const nuevoUsuario = {
        fullname,
        username,
        mail,
        password,
        profilePhoto: "",
        biography: ""
    };

    try {
        const usuarioCreado = await peticionPost(url, nuevoUsuario);

        if (usuarioCreado) {
            console.log("User added successfully:", usuarioCreado);
            alert("User added successfully:");
            window.location.href = "../login.html";
        } else {
            alert("Error registering user");
        }
    } catch (error) {
        console.error("Error in request:", error);
        alert("An error occurred while trying to register the user.");
    }
}

document.getElementById("btn-register").addEventListener("click", () => {
    agregarUsuario(urlUser);
});

