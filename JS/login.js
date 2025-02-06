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

const urlUser = "http://localhost:8080/api/users";

const peticionGet = async (url) => {
    try {
        const respuesta = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJjYW1wdXNjbCIsInN1YiI6IlBhekVuRWxBcmlwb3JvQGVtYWlsLmNvbSIsImF1dGhvcml0aWVzIjpbIlJPTEVfVVNFUiJdLCJpYXQiOjE3MzgyNTM2OTIsImV4cCI6MTczOTExNzY5Mn0.NF7WvRmMlRBj5qJ5BciFg2nT_Hs02WhhyMLdjSX7euf9Vx9X_zV914fxWPkNuQJJO7qZ0_nYNzh7j3GmLVxmgw'
            }
        });
        console.log('Response status: ', respuesta.status);
        if (respuesta.ok) {
            const info = await respuesta.json();
            console.log(info);
            return info;
        } else {
            console.log('Error ', respuesta.status);
            return null;
        }
    } catch (error) {
        console.error('Error ', error);
        return null;
    }
}

var token = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJjYW1wdXNjbCIsInN1YiI6IlBhekVuRWxBcmlwb3JvQGVtYWlsLmNvbSIsImF1dGhvcml0aWVzIjpbIlJPTEVfVVNFUiJdLCJpYXQiOjE3MzgyNTM2OTIsImV4cCI6MTczOTExNzY5Mn0.NF7WvRmMlRBj5qJ5BciFg2nT_Hs02WhhyMLdjSX7euf9Vx9X_zV914fxWPkNuQJJO7qZ0_nYNzh7j3GmLVxmgw';

async function peticionPost(url, data, token) {
    try {
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(data)
        });
        console.log('Response Status', respuesta.status);
        if (respuesta.ok) {
            return await respuesta.json();
        } else {
            console.error('Error', respuesta.status);
            const textoError = await respuesta.text();
            console.error('Error detail:', textoError);
            return null;
        }
    } catch (error) {
        console.error("Error POST", error);
        return null;
    }
}

// FUNCION PARA LA PAGINA LOGIN
const loginUsuario = async (email, password) => {
    try {
        const respuesta = await fetch("http://localhost:8080/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ mail: email, password: password })
        });

        if (!respuesta.ok) {
            alert("Incorrect username or password.");
            return false;
        }

        const data = await respuesta.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login successful.");
        window.location.href = "/Pages/Index.html";

        return true;
    } catch (error) {
        console.error("Error logging in:", error);
        alert("Error. Please try again");
        return false;
    }
};

// Manejo del botón de login
document.getElementById("btn-login").addEventListener("click", () => {
    const email = document.getElementById("mail").value;
    const password = document.getElementById("password").value;

    if (email && password) {
        loginUsuario(email, password);
    } else {
        alert("Please enter your email and password.");
    }
});


