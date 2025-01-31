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
async function loginUsuario(email, password) {
  const usuarios = await peticionGet(urlUser);
  const usuarioExistente = usuarios.find(users => users.mail === email);
  if (usuarioExistente && usuarioExistente.password === password) {
    window.location.href = "../Index.html";
    return true;
  } else {
    alert("Usuario o contraseña incorrectos.");
    return false;
  }
}

// BOTONES

document.getElementById("btn-login").addEventListener("click", () => {
  const email = document.getElementById("mail").value;
  const password = document.getElementById("password").value;
  if (email && password) {
    loginUsuario(email, password);
  } else {
    alert("Por favor ingrese su correo y contraseña.");
  }
});
