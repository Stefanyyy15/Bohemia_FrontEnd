window.addEventListener("load", function() {
    let preloader = document.getElementById("preloader");
    preloader.classList.add("fade-out");
    setTimeout(() => {
        preloader.style.display = "none";
        document.getElementById("contenido").classList.remove("hidden");
    }, 1000);
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
          console.error('Detalle del error:', textoError);
          return null;
      }
  }catch(error){
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
            alert("Usuario o contraseña incorrectos.");
            return false;
        }

        const data = await respuesta.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user)); 

        alert("Inicio de sesión exitoso.");
        window.location.href = "../Index.html"; // Redirige a la página principal

        return true;
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Ocurrió un error, intenta nuevamente.");
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
        alert("Por favor ingrese su correo y contraseña.");
    }
});

// Función para obtener el token
const obtenerToken = () => localStorage.getItem("token");

// Función para hacer peticiones autenticadas con el token
const peticionAutenticada = async (url, metodo = "GET", data = null) => {
    const token = obtenerToken();
    if (!token) {
        alert("No estás autenticado.");
        window.location.href = "./login.html";
        return null;
    }

    try {
        const opciones = {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        };

        if (data) {
            opciones.body = JSON.stringify(data);
        }

        const respuesta = await fetch(url, opciones);

        if (respuesta.status === 401) {
            alert("Sesión expirada. Inicia sesión nuevamente.");
            localStorage.removeItem("token");
            window.location.href = "./login.html";
            return null;
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error en la petición:", error);
        return null;
    }
};

// Ejemplo de uso: Obtener usuarios autenticado
const obtenerUsuarios = async () => {
    const data = await peticionAutenticada("http://localhost:8080/api/users");
    console.log(data);
};
