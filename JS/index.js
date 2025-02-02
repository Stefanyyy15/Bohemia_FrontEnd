window.addEventListener("load", function() {
  let preloader = document.getElementById("preloader");
  preloader.classList.add("fade-out");
  setTimeout(() => {
      preloader.style.display = "none";
      document.getElementById("contenido").classList.remove("hidden");
  }, 1000);
});

document.addEventListener("DOMContentLoaded", () => {
  verificarSesion();
});

function verificarSesion() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.token) {
      window.location.href = "./Pages/login.html";
  } else {
      document.getElementById("contenido").classList.remove("hidden");
      document.querySelectorAll(".iconos a").forEach((btn) => {
          btn.classList.remove("disabled");
      });
  }
}

const urlPosts = "http://localhost:8080/api/post";  // Endpoint de posts

// Función para obtener los posts
async function obtenerPosts(url) {
    try {
        const respuesta = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token') // Obtener el token desde localStorage
            }
        });

        if (respuesta.ok) {
            const posts = await respuesta.json();
            mostrarPosts(posts);
        } else {
            console.error("Error al obtener los posts");
        }
    } catch (error) {
        console.error("Error", error);
    }
}

function mostrarPosts(posts) {
    const contenedorPost = document.querySelector(".ContenedorPost");
    contenedorPost.innerHTML = ''; 
    posts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");
        let imageHTML = '';
        if (post.image) {
            imageHTML = `<div class="post-image-container">
                            <img src="${post.image}" alt="Imagen del post" class="post-image"/>
                          </div>`;
        }

        postDiv.innerHTML = `
            <div class="post-header">
                <span class="post-user">${post.user.username}</span>
                <span class="post-date">${new Date(post.publicationDate).toLocaleString()}</span>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
            </div>
            ${imageHTML}  <!-- Aquí se incluye la imagen si existe -->
            <div class="post-footer">
                <button class="btn-like"><i class="fa fa-heart"></i> Like</button>
                <button class="btn-comment"><i class="fa fa-comment"></i> Comment</button>
            </div>
        `;
        
        contenedorPost.appendChild(postDiv);
    });
}

obtenerPosts(urlPosts);