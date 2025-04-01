window.addEventListener("load", function () {
    let preloader = document.getElementById("preloader");
    preloader.classList.add("fade-out");
    setTimeout(() => {
        preloader.style.display = "none";
        document.getElementById("contenido").classList.remove("hidden");
    }, 1000);
});

/* document.addEventListener("DOMContentLoaded", function () {
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
}); */


// PETICIONES A LA API 

const urlUser = "http://localhost:8080/api/users";


async function peticionPost(url, data) {
    try {
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJjYW1wdXNjbCIsInN1YiI6IlBhekVuRWxBcmlwb3JvQGVtYWlsLmNvbSIsImF1dGhvcml0aWVzIjpbIlJPTEVfVVNFUiJdLCJpYXQiOjE3NDM1NDEzNDgsImV4cCI6MTc0NDQwNTM0OH0.cPn1sda_Umpp138VUdSwNIId11zdhSOFwFOPN5zjFseCvjosOrBXorwMRiiVraxjPmcWE30loUm-9hlPKMKlNA'
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
        Swal.fire({
            title: "All fields are required.",
            confirmButtonColor: "#6f523b"
        });
        return;
    }

    if (!emailRegex.test(mail)) {
        Swal.fire({
            title: "Please enter a valid email.",
            confirmButtonColor: "#6f523b"
        });
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
            Swal.fire({
                title: "User added successfully!",
                icon: "success",
                draggable: true
            }).then(() => {
                window.location.href = "../Login.html";
            });
            
        } else {
            Swal.fire({
                icon: "error",
                title: "Error registering user",
                text: "Something went wrong! Please try again",
                confirmButtonColor: "#6f523b"
            });
        }
    } catch (error) {
        console.error("Error in request:", error);
        Swal.fire({
            icon: "error",
            title: "An error occurred while trying to register the user.",
            confirmButtonColor: "#6f523b"
        });
    }
}

document.getElementById("btn-register").addEventListener("click", () => {
    agregarUsuario(urlUser);
});