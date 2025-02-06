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
            console.error("Error getting posts", respuesta.status);
        }
    } catch (error) {
        console.error("Error in request", error);
    }
}

function mostrarPosts(posts) {
    posts.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));

    const contenedorPost = document.querySelector(".ContenedorPost");
    contenedorPost.innerHTML = '';

    posts.forEach(async (post) => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");
        postDiv.setAttribute("id", `post-${post.postId}`);

        let imageHTML = post.image ? `<div class="post-image-container">
                            <img src="${post.image}" alt="Imagen del post" class="post-image"/>
                            </div>` : '';

        let userImage = post.user.profilePhoto
            ? `<img src="${post.user.profilePhoto}" alt="Foto de perfil" class="post-user-image"/>`
            : `<img src="/background/fotoPerfilPredeterminada.png" alt="Foto de perfil" class="post-user-image"/>`;

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
                  <button class="btn-like" data-post-id="${post.postId}">
                      <i class="fa fa-heart"></i> <span class="like-count">0</span> Likes
                  </button>
                  <button class="btn-comment"><i class="fa fa-comment"></i> Comment</button>
              </div>
              <div class="comentarios" style="display: none;"></div>
              <div class="comentario-input" style="display: none;">
                  <input type="text" class="comentario-texto" placeholder="Escribe un comentario...">
                  <button class="btn-enviar-comentario">Enviar</button>
              </div>
          `;

        contenedorPost.appendChild(postDiv);
        obtenerLikes(post.postId);
        postDiv.querySelector(".btn-like").addEventListener("click", () => {
            agregarLike(post.postId);
        });

        const btnEnviarComentario = postDiv.querySelector(".btn-enviar-comentario");
        btnEnviarComentario.addEventListener("click", () => {
            const comentarioInput = postDiv.querySelector("input.comentario-texto");
            const contenidoComentario = comentarioInput.value.trim();

            if (contenidoComentario) {
                agregarComentario(post.postId, contenidoComentario);
                comentarioInput.value = "";
            }
        });

        postDiv.querySelector(".btn-comment").addEventListener("click", async () => {
            const comentariosDiv = postDiv.querySelector(".comentarios");
            const comentarioInput = postDiv.querySelector(".comentario-input");

            comentarioInput.style.display = comentarioInput.style.display === "none" ? "block" : "none";

            if (comentariosDiv.style.display === "none") {
                comentariosDiv.style.display = "block";
                await obtenerComentarios(post.postId);
            } else {
                comentariosDiv.style.display = "none";
            }
        });
    });
}

async function agregarLike(postId) {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await fetch(`http://localhost:8080/api/reaction/like`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token"),
            },
            body: JSON.stringify({
                user: { id_user: user.id_user },
                post: { postId: postId }
            }),
        });

        if (response.ok) {
            obtenerLikes(postId);
        } else {
            console.error("Error liking");
        }
    } catch (error) {
        console.error("Error in like request:", error);
    }
}

async function obtenerLikes(postId) {
    try {
        const response = await fetch(`http://localhost:8080/api/reaction/post/${postId}/likes`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token"),
            },
        });

        if (response.ok) {
            const likeCount = await response.json();
            const postDiv = document.getElementById(`post-${postId}`);
            if (postDiv) {
                const likeCountElement = postDiv.querySelector(".like-count");
                likeCountElement.textContent = likeCount || 0;
            }
        } else {
            console.error("Error getting likes:", response.status);
        }
    } catch (error) {
        console.error("Error in request for likes:", error);
    }
}

// COMENTARIOOOOOOOOOS ÑAÑAÑA

async function obtenerComentarios(postId) {
    try {
        const response = await fetch(`http://localhost:8080/api/comment/post/${postId}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        mostrarComentariosEnInterfaz(postId, data);
    } catch (error) {
        console.error('Error loading post comments ' + postId + ':', error);
        const postDiv = document.getElementById(`post-${postId}`);
        if (postDiv) {
            const comentariosDiv = postDiv.querySelector(".comentarios");
            comentariosDiv.innerHTML = '<p class="error-comentarios"></p>';
        }
    }
}

function mostrarComentariosEnInterfaz(postId, comentarios) {
    comentarios.sort((a, b) => new Date(b.commentDate) - new Date(a.commentDate));
    const postDiv = document.getElementById(`post-${postId}`);
    if (!postDiv) return;

    const contenedorComentarios = postDiv.querySelector(".comentarios");
    contenedorComentarios.innerHTML = '';

    if (comentarios.length === 0) {
        contenedorComentarios.innerHTML = '<p class="no-comentarios">No hay comentarios aún.</p>';
        return;
    }

    comentarios.forEach(comentario => {
        const comentarioElement = document.createElement('div');
        comentarioElement.classList.add('comentario');
        comentarioElement.setAttribute("data-comment-id", comentario.id_comment);

        let userImage = comentario.user.profilePhoto
            ? `<img src="${comentario.user.profilePhoto}" alt="Foto de perfil" class="comment-user-image"/>`
            : `<img src="/background/fotoPerfilPredeterminada.png" alt="Foto de perfil" class="comment-user-image"/>`;

        const fechaLocal = new Date(comentario.commentDate).toLocaleString("es-ES", {
            hour12: true
        });

        comentarioElement.innerHTML = `
            <div class="comentario-header">
                <div class="comentario-user-info">
                    <div class="imageUsername">
                        ${userImage}
                        <span class="comentario-usuario">${comentario.user.username}</span>
                    </div>
                    <h6 class="comentario-fecha">${fechaLocal}</h6>
                </div>
            </div>
            <div class="comentario-contenido">
                <p class="comentario-texto">${comentario.comment}</p>
                <button class="eliminar-comentario" id="botonesComment"><i class="fa-solid fa-trash fa-1x"></i></button>
                <button class="editar-comentario"  id="botonesComment"><i class="fa-solid fa-pen-to-square fa-1x"></i></button>
                <div class="editar-form" style="display: none;">
                    <textarea class="textarea-editar">${comentario.comment}</textarea>
                    <button class="guardar-edicion">Guardar</button>
                </div>
            </div>
        `;

        const eliminarBoton = comentarioElement.querySelector('.eliminar-comentario');
        eliminarBoton.addEventListener('click', function () {
            eliminarComentario(postId, comentario.id_comment);
        });

        const editarBoton = comentarioElement.querySelector('.editar-comentario');
        editarBoton.addEventListener('click', function () {
            const editarForm = comentarioElement.querySelector('.editar-form');
            const comentarioTexto = comentarioElement.querySelector('.comentario-texto');

            comentarioTexto.style.display = 'none';
            editarForm.style.display = 'block';
        });

        const guardarEdicionBoton = comentarioElement.querySelector('.guardar-edicion');
        guardarEdicionBoton.addEventListener('click', function () {
            const nuevoComentario = comentarioElement.querySelector('.textarea-editar').value.trim();
            if (nuevoComentario) {
                // Llamar a la función para actualizar el comentario
                editarComentario(postId, comentario.id_comment, nuevoComentario);
            }
        });

        contenedorComentarios.appendChild(comentarioElement);
    });
}


async function eliminarComentario(postId, commentId) {
    if (confirm("Are you sure you want to delete this comment?")) {
        try {
            const respuesta = await fetch(`http://localhost:8080/api/comment/${commentId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                }
            });
            if (respuesta.ok) {
                const comentarioElement = document.querySelector(`[data-comment-id="${commentId}"]`);
                if (comentarioElement) {
                    comentarioElement.remove();
                }
            } else {
                console.error("Error deleting comment");
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    }
}

async function agregarComentario(postId, contenidoComentario) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id_user) {
        console.error("User not authenticated or without valid ID");
        return;
    }

    const comentario = {
        user: { id_user: user.id_user },
        comment: contenidoComentario,
        commentDate: new Date(),
        post: { postId: parseInt(postId, 10) }
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
            mostrarComentarioEnInterfaz(postId, nuevoComentario);
        } else {
            console.error("Error adding comment");
        }
    } catch (error) {
        console.error("Error in request", error);
    }
}

async function editarComentario(postId, commentId, nuevoComentario) {
    try {
        const respuesta = await fetch(`http://localhost:8080/api/comment/${commentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token"),
            },
            body: JSON.stringify({ comment: nuevoComentario }),
        });

        if (respuesta.ok) {
            const comentarioElement = document.querySelector(`[data-comment-id="${commentId}"]`);
            if (comentarioElement) {
                comentarioElement.querySelector('.comentario-texto').textContent = nuevoComentario;
                const comentarioContenido = comentarioElement.querySelector('.comentario-contenido');
                comentarioContenido.querySelector('.editar-form').style.display = 'none';
                comentarioContenido.querySelector('.comentario-texto').style.display = 'block';
            }
        } else {
            const errorData = await respuesta.json();
            console.error("Error updating comment:", errorData);
        }
    } catch (error) {
        console.error("Error updating comment:", error);
    }
}





obtenerPosts(urlPosts);
