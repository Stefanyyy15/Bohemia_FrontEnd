window.addEventListener("load", function () {
    let preloader = document.getElementById("preloader");
    preloader.classList.add("fade-out");
    setTimeout(() => {
        preloader.style.display = "none";
        document.getElementById("contenido").classList.remove("hidden");
    }, 1000);
});

const urlPosts = "http://localhost:8080/api/post";

async function obtenerPosts(url) {
    try {
        const respuesta = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (respuesta.ok) {
            const posts = await respuesta.json();
            mostrarPosts(posts);
        } else {
            console.error("Error al obtener los posts", respuesta.status);
        }
    } catch (error) {
        console.error("Error en la petición", error);
    }
}

async function mostrarPosts(posts) {
    posts.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));

    const contenedorPost = document.querySelector(".ContenedorPost");
    contenedorPost.innerHTML = '';

    posts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");
        postDiv.setAttribute("id", `post-${post.postId}`);

        let imageHTML = post.image ? `<div class="post-image-container">
                              <img src="${post.image}" alt="Imagen del post" class="post-image"/>
                            </div>` : '';

        let userImage = post.user.profilePhoto
            ? `<img src="${post.user.profilePhoto}" alt="Foto de perfil" class="post-user-image"/>`
            : `<img src="/images/fotoPerfilPredeterminada.png" alt="Foto de perfil" class="post-user-image"/>`;

        const fechaLocal = new Date(post.publicationDate).toLocaleString("es-ES", { hour12: true });

        postDiv.innerHTML = `
              <div class="post-header">
                  <div data-post-id="${post.postId}" class="post-user-info">
                      ${userImage}
                      <span class="post-user">${post.user.username}</span>
                  </div>
                  <span class="post-date">${fechaLocal}</span>
              </div>
              <div class="post-content">
                  <p>${post.content}</p>
              </div>
              ${imageHTML}
              <div class="post-footer">
                  <button class="btn-like"><i class="fa fa-heart"></i> Like</button>
                  <button class="btn-comment"><i class="fa fa-comment"></i> Comment</button>
              </div>
              <div class="comentarios" style="display: none;"></div>
              <div class="comentario-input" style="display: none;">
                  <input type="text" class="comentario-texto" placeholder="Escribe un comentario...">
                  <button class="btn-enviar-comentario">Enviar</button>
              </div>
          `;

        contenedorPost.appendChild(postDiv);

        // Lógica para comentarios
        const btnEnviarComentario = postDiv.querySelector(".btn-enviar-comentario");
        btnEnviarComentario.addEventListener("click", () => {
            const inputComentario = postDiv.querySelector(".comentario-texto");
            const contenidoComentario = inputComentario.value.trim();
            if (contenidoComentario) {
                agregarComentario(post.postId, contenidoComentario);
                inputComentario.value = "";
            }
        });

        // Lógica para mostrar/ocultar comentarios
        postDiv.querySelector(".btn-comment").addEventListener("click", () => {
            const comentariosDiv = postDiv.querySelector(".comentarios");
            const comentarioInput = postDiv.querySelector(".comentario-input");

            if (comentariosDiv.style.display === "none") {
                comentariosDiv.style.display = "block";
                comentarioInput.style.display = "block";
                // Obtener los comentarios desde la base de datos cuando se muestran
                obtenerComentarios(post.postId);
            } else {
                comentariosDiv.style.display = "none";
                comentarioInput.style.display = "none";
            }
        });

        // Cargar los comentarios al cargar la página
        obtenerComentarios(post.postId);
    });
}


obtenerPosts(urlPosts);


async function eliminarComentario(commentId) {
    if (confirm("¿Estás seguro de que deseas eliminar este comentario?")) {
        try {
            const respuesta = await fetch(`http://localhost:8080/api/comment/${commentId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                }
            });

            if (respuesta.ok) {
                // Eliminar el comentario del DOM
                const comentarioElement = document.querySelector(`[data-comment-id="${commentId}"]`);
                if (comentarioElement) {
                    comentarioElement.remove();
                }
            } else {
                console.error("Error al eliminar el comentario");
            }
        } catch (error) {
            console.error("Error en la solicitud de eliminación:", error);
        }
    }
}

// Función para obtener los comentarios de un post específico
function obtenerComentarios(postId) {
    fetch(`http://localhost:8080/api/comments/post/${postId}`)
        .then(response => response.json())
        .then(data => {
            mostrarComentariosEnInterfaz(postId, data);
        })
        .catch(error => console.error('Error al cargar los comentarios:', error));
}

// Función para mostrar los comentarios en el contenedor correcto
function mostrarComentariosEnInterfaz(postId, comentarios) {
    const postDiv = document.getElementById(`post-${postId}`);
    const contenedorComentarios = postDiv.querySelector(".comentarios");
    contenedorComentarios.innerHTML = ''; // Limpiar el contenedor antes de agregar los comentarios

    comentarios.forEach(comentario => {
        const comentarioElement = document.createElement('div');
        comentarioElement.classList.add('comentario');
        comentarioElement.innerHTML = `
            <p>${comentario.comment}</p>
            <p><small>Publicado por ${comentario.user.fullname}</small></p>
        `;
        contenedorComentarios.appendChild(comentarioElement);
    });
}


// Lógica para mostrar/ocultar comentarios y cargarlos desde el backend
document.querySelectorAll(".btn-comment").forEach(btn => {
    btn.addEventListener("click", async (e) => {
        const postDiv = e.target.closest(".post");
        const postId = postDiv.getAttribute("id").split("-")[1]; // Obtener postId
        const comentariosDiv = postDiv.querySelector(".comentarios");
        const comentarioInput = postDiv.querySelector(".comentario-input");

        // Mostrar u ocultar los comentarios
        if (comentariosDiv.style.display === "none" || comentariosDiv.style.display === "") {
            comentariosDiv.style.display = "block";
            comentarioInput.style.display = "block";
            // Obtener los comentarios solo la primera vez que se abre el contenedor
            await obtenerComentarios(postId);
        } else {
            comentariosDiv.style.display = "none";
            comentarioInput.style.display = "none";
        }
    });
});


// Función para mostrar un solo comentario
function mostrarComentarioEnInterfaz(postId, comentario) {
    const postDiv = document.getElementById(`post-${postId}`);
    const comentariosDiv = postDiv.querySelector(".comentarios");

    const comentarioDiv = document.createElement("div");
    comentarioDiv.classList.add("comentario");
    comentarioDiv.setAttribute("data-comment-id", comentario.id_comment);

    let userImage = comentario.user.profilePhoto
        ? `<img src="${comentario.user.profilePhoto}" alt="Foto de perfil" class="comment-user-image"/>`
        : `<img src="/images/fotoPerfilPredeterminada.png" alt="Foto de perfil" class="comment-user-image"/>`;

    const fechaLocal = new Date(comentario.commentDate).toLocaleString("es-ES", {
        hour12: true
    });

    comentarioDiv.innerHTML = `
        <div class="comentario-header">
            <div class="comentario-user-info">
                ${userImage}
                <span class="comentario-usuario">${comentario.user.username}</span>
                <span class="comentario-fecha">${fechaLocal}</span>
            </div>
        </div>
        <div class="comentario-contenido">
            <p class="comentario-texto">${comentario.comment}</p>
        </div>
    `;

    comentariosDiv.appendChild(comentarioDiv);
}

// Y luego en la función agregarComentario:
async function agregarComentario(postId, contenidoComentario) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id_user) {
        console.error("Usuario no autenticado o sin ID válido");
        return;
    }

    const postDiv = document.getElementById(`post-${postId}`);
    if (!postDiv) {
        console.error("No se encontró el post con ID:", postId);
        return;
    }

    const postUserInfo = postDiv.querySelector(".post-user-info");
    const extractedPostId = postUserInfo ? postUserInfo.getAttribute("data-post-id") : null;

    if (!extractedPostId) {
        console.error("No se pudo obtener el ID del post desde post-user-info");
        return;
    }

    const comentario = {
        user: { id_user: user.id_user },
        comment: contenidoComentario,
        commentDate: new Date(),
        post: { postId: parseInt(extractedPostId, 10) }
    };

    try {
        const respuesta = await fetch("http://localhost:8080/api/comment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token"),
            },
            body: JSON.stringify(comentario),
        });

        if (respuesta.ok) {
            const nuevoComentario = await respuesta.json();
            console.log("Comentario agregado con éxito:", nuevoComentario);
            mostrarComentarioEnInterfaz(extractedPostId, nuevoComentario);
        } else {
            const errorData = await respuesta.json();
            console.error("Error al agregar el comentario:", errorData);
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
    }
}
