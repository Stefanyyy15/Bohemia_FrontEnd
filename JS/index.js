window.addEventListener("load", function() {
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
  
  function mostrarPosts(posts) {
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
                  <div 
                 id="${post.postId}" class="post-user-info">
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
              <div class="comentarios"></div>
              <div class="comentario-input">
                  <input type="text" class="comentario-texto" placeholder="Escribe un comentario...">
                  <button class="btn-enviar-comentario">Enviar</button>
              </div>
          `;
  
          contenedorPost.appendChild(postDiv);
  
          // LOGICA PAL COMMENT
          const btnEnviarComentario = postDiv.querySelector(".btn-enviar-comentario");
          btnEnviarComentario.addEventListener("click", () => {
              const inputComentario = postDiv.querySelector(".comentario-texto");
              const contenidoComentario = inputComentario.value.trim();
              if (contenidoComentario) {
                  agregarComentario(post.postId, contenidoComentario);
                  inputComentario.value = "";
              }
          });

          postDiv.querySelector(".btn-comment").addEventListener("click", () => {
            if(postDiv.querySelector(".comentarios").style.display === "none" && postDiv.querySelector(".comentario-input").style.display === "none"){
                postDiv.querySelector(".comentarios").style.display = "block";
                postDiv.querySelector(".comentario-input").style.display = "block";
            }else{
                postDiv.querySelector(".comentarios").style.display = "none";
                postDiv.querySelector(".comentario-input").style.display = "none";
            }
            
            
          });
      });
  }
  
  obtenerPosts(urlPosts);
  
  // AGREGAR COMENTARIO
  
  async function agregarComentario(postId, contenidoComentario) {
    const usuario = JSON.parse(localStorage.getItem("user"));
    if (!usuario) {
        console.error("Usuario no autenticado");
        return;
    }

    const comentario = {
        user: { id_user: usuario.id_user },
        comment: contenidoComentario,
        commentDate: new Date(),
        post: { id_post: postId }
    };

    // Validación antes de enviar
    if (!comentario.user.id_user || !comentario.post.id_post || !comentario.comment) {
        console.error("Datos inválidos para el comentario");
        return;
    }

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
            mostrarComentarioEnInterfaz(postId, nuevoComentario);
        } else {
            console.error("Error al agregar el comentario", respuesta);
        }
    } catch (error) {
        console.error("Error en la solicitud", error);
    }
}

  
  function mostrarComentarioEnInterfaz(postId, comentario) {
      const postElement = document.getElementById(`post-${postId}`);
      if (!postElement) return;
  
      const comentariosContainer = postElement.querySelector(".comentarios");
  
      const comentarioDiv = document.createElement("div");
      comentarioDiv.classList.add("comentario");
  
      let userImage = comentario.user.profilePhoto
          ? `<img src="${comentario.user.profilePhoto}" alt="Foto de perfil" class="comment-user-image"/>`
          : `<img src="/images/fotoPerfilPredeterminada.png" alt="Foto de perfil" class="comment-user-image"/>`;
  
      const fechaLocal = new Date(comentario.commentDate).toLocaleString("es-ES", {
          hour12: true
      });
  
      comentarioDiv.innerHTML = `
          <div class="comentario-header">
              ${userImage}
              <span class="comentario-usuario">${comentario.user.username}</span>
              <span class="comentario-fecha">${fechaLocal}</span>
          </div>
          <p class="comentario-texto">${comentario.comment}</p>
      `;
  
      comentariosContainer.appendChild(comentarioDiv);
  }
  