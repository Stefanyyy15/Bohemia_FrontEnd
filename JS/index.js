window.addEventListener("load", function() {
    let preloader = document.getElementById("preloader");
    preloader.classList.add("fade-out");
    setTimeout(() => {
        preloader.style.display = "none";
        document.getElementById("contenido").classList.remove("hidden");
    }, 700);
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

// FUNCION PARA LA PAGINA LOGIN

async function loginUsuario(username, password) {
    const usuarios = await peticionGet(urlUser);
    const usuarioExistente = usuarios.find(usuario => usuario.username === username);
    if (usuarioExistente && usuarioExistente.password === password) {
      window.location.href = "../Index.html";
      return true;
    } else {
      alert("Incorrect username or password");
      return false;
    }
  }
  
  // BOTONES
  
  document.getElementById("btn-login").addEventListener("click", () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if (username && password) {
      loginUsuario(username, password);
    } else {
      alert("Please enter your email and password.");
    }
  });