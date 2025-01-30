window.addEventListener("load", function() {
    let preloader = document.getElementById("preloader");
    preloader.classList.add("fade-out");
    setTimeout(() => {
        preloader.style.display = "none";
        document.getElementById("contenido").classList.remove("hidden");
    }, 500);
});


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

const mostrarDatos = async (url) => {
    const respuesta = await peticionGet(url);
    console.log(respuesta);
}

mostrarDatos(urlUser);

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
    }catch(error){
        console.error("Error POST", error);
    return null;
    }
}

async function agregarUsuario(url) {
    const nuevoUsuario = {
        fullname: null,
        username: document.getElementById("username").value.trim(),
        mail: document.getElementById("mail").value.trim(),
        password: document.getElementById("password").value,
        profilePhoto: null,
        biography: null
    };
    const usuarioCreado = await peticionPost(url, nuevoUsuario);

    if (usuarioCreado) {
        console.log("Usuario agregado con éxito:", usuarioCreado);
        alert("Usuario registrado correctamente");
    } else {
        alert("Error al registrar el usuario");
    }
}

document.getElementById("btn-register").addEventListener("click", () => {
    agregarUsuario(urlUser);
    //window.location.href = "./style.css";
  });