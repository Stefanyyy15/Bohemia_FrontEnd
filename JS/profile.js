window.addEventListener("load", function () {
    let preloader = document.getElementById("preloader");
    preloader.classList.add("fade-out");
    setTimeout(() => {
        preloader.style.display = "none";
        document.getElementById("contenido").classList.remove("hidden");
    }, 1000);
});

const obtenerToken = () => localStorage.getItem("token");

const peticionAutenticada = async (url, metodo = "GET", data = null) => {
    const token = obtenerToken();
    if (!token) {
        Swal.fire({
            title: "You are not authenticated.",
            confirmButtonColor: "#6f523b"
        });
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
            Swal.fire({
                title: "Session expired. Please log in again.",
                confirmButtonColor: "#6f523b"
            });
            localStorage.removeItem("token");
            window.location.href = "./login.html";
            return null;
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error in the request", error);
        return null;
    }
};

// MOSTRAR INFO DEL USUARIO

const showUserProfile = () => {
    let token = localStorage.getItem('token');
    if (!token) {
        Swal.fire({
            icon: "info",
            title: "No listings found. Please log in.",
            confirmButtonColor: "#6f523b"
        });
        window.location.href = '../login.html';
        return;
    }
    if (token.startsWith('Bearer ')) {
        token = token.slice(7);
    }

    fetch('http://localhost:8080/api/users/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.user) {
                const user = data.user;

                const fullnameElement = document.getElementById('userFullname');
                const usernameElement = document.getElementById('userUsername');
                const biographyElement = document.getElementById('userBiography');
                const profilePhotoElement = document.getElementById('userProfilePhoto');

                if (fullnameElement && usernameElement && biographyElement && profilePhotoElement) {
                    fullnameElement.textContent = user.fullname;
                    usernameElement.textContent = user.username;
                    biographyElement.textContent = user.biography;

                    if (user.profilePhoto) {
                        profilePhotoElement.src = user.profilePhoto;
                    }
                } else {
                    console.error('No elements were found in the DOM');
                }

                document.getElementById('contenido').classList.remove('hidden');
                document.getElementById('preloader').style.display = 'none';

                obtenerMisPosts();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (error.message.includes('401')) {
                Swal.fire({
                    icon: "info",
                    title: "Session expired. Please log in again.",
                    confirmButtonColor: "#6f523b"
                });
                window.location.href = '../login.html';
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Error loading profile. Please try again.",
                    confirmButtonColor: "#6f523b"
                });
            }
        });
}

// CERRAR SESION :P
function cerrarSesion() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "../login.html";
}


// MOSTRAR LOS POSTS 

async function obtenerMisPosts() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id_user) {
        console.error("No valid user found in localStorage.");
        return;
    }

    const url = `http://localhost:8080/api/post/user/${user.id_user}`;

    try {
        const respuesta = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        console.log("Response status for posts:", respuesta.status);

        if (!respuesta.ok) {
            const errorText = await respuesta.text();
            console.error("Error getting posts:", errorText);
            return;
        }

        const posts = await respuesta.json();
        mostrarMisPosts(posts);
    } catch (error) {
        console.error("Error getting posts:", error);
    }
}

function mostrarMisPosts(posts) {
    posts.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));
    const contenedorPost = document.querySelector(".contenedorMisPosts");
    if (!contenedorPost) {
        console.error("Posts container not found");
        return;
    }

    contenedorPost.innerHTML = '';

    if (!posts || posts.length === 0) {
        const mensajeNoPosts = document.createElement("div");
        mensajeNoPosts.classList.add("no-posts-message");
        mensajeNoPosts.textContent = "There are no posts to display";
        contenedorPost.appendChild(mensajeNoPosts);
        return;
    }

    posts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");

        let imageHTML = post.image
            ? `<div class="post-image-container"><img src="${post.image}" alt="Imagen del post" class="post-image"/></div>`
            : '';

        let userImage = post.user && post.user.profilePhoto
            ? `<img src="${post.user.profilePhoto}" alt="Foto de perfil" class="post-user-image"/>`
            : `<img src="/background/fotoPerfilPredeterminada.png" alt="Foto de perfil" class="post-user-image"/>`;

        postDiv.innerHTML = `
            <div class="post-header">
                <div class="post-user-info">
                    ${userImage}
                    <span class="post-user">${post.user.username}</span>
                </div>
                <span class="post-date">${new Date(post.publicationDate).toLocaleString()}</span>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
            </div>
            ${imageHTML}
            <div class="post-footer">
                <button class="btn-edit" data-post-id="${post.postId}"><i class="fa fa-edit"></i> Edit</button>
                <button class="btn-delete" data-post-id="${post.postId}"><i class="fa fa-trash"></i> Delete</button>
            </div>
        `;

        contenedorPost.appendChild(postDiv);

        // Añadimos el evento de edición
        const btnEdit = postDiv.querySelector('.btn-edit');
        btnEdit.addEventListener('click', (e) => {
            const postId = e.target.closest('button').dataset.postId;
            console.log("Post ID:", postId);
            if (!postId) {
                console.error("The postId was not found.");
                return;
            }
            editarPost(postId);
        });

        // Añadimos el evento de eliminación para cada botón
        const btnDelete = postDiv.querySelector('.btn-delete');
        btnDelete.addEventListener('click', (e) => {
            const postId = e.target.closest('button').dataset.postId;
            eliminarPost(postId);
        });
    });
}


document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('userFullname')) {
        showUserProfile();
        obtenerMisPosts();
    }
});

async function eliminarPerfil() {
    const token = obtenerToken();
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!user || !user.id_user) {
        Swal.fire({
            title: "Failed to get user ID.",
            confirmButtonColor: "#6f523b"
        });
        return;
    }

    const userId = user.id_user;

    const confirmacion = await Swal.fire({
        title: "Are you sure you want to delete your profile? This action is irreversible.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
        cancelButtonText: "No, cancel",
        confirmButtonColor: "#6f523b",
        cancelButtonColor: "#3085d6"
    });

    if (!confirmacion.isConfirmed) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");

            await Swal.fire({
                title: "Profile deleted successfully!",
                icon: "success",
                confirmButtonColor: "#6f523b"
            });

            window.location.href = "../login.html";
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: "error",
                title: "Error deleting profile",
                text: errorData.message || "Something went wrong! Please try again.",
                confirmButtonColor: "#6f523b"
            });
        }
    } catch (error) {
        console.error("Error deleting profile:", error);
        Swal.fire({
            icon: "error",
            title: "Error deleting profile",
            text: "There was an error. Please try again.",
            confirmButtonColor: "#6f523b"
        });
    }
}


// EDITAR PERFIL MUAJAJ


async function guardarCambios() {
    const token = obtenerToken();
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id_user) {
        Swal.fire({
            title: "Failed to get user ID.",
            confirmButtonColor: "#6f523b"
        });
        return;
    }

    const userId = user.id_user;
    const fullname = document.getElementById('editFullname').value.trim();
    let username = document.getElementById('editUsername').value.trim().replace(/\s+/g, "_");
    const email = document.getElementById('editEmail').value.trim();
    const password = document.getElementById('editPassword').value;
    const biography = document.getElementById('editBiography').value.trim();
    const profilePhotoUrl = document.getElementById('editProfilePhoto').value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullname || !username || !email) {
        Swal.fire({
            title: "Full name, username and email are required.",
            confirmButtonColor: "#6f523b"
        });
        return;
    }

    if (!emailRegex.test(email)) {
        Swal.fire({
            title: "Please enter a valid email.",
            confirmButtonColor: "#6f523b"
        });
        return;
    }

    const updatedProfileData = {
        fullname,
        username,
        mail: email,
        password,
        biography,
        profilePhoto: profilePhotoUrl
    };

    try {
        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedProfileData)
        });

        if (!response.ok) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "There was an error saving changes.",
                confirmButtonColor: "#6f523b"
            });
            return;
        }

        const data = await response.json();

        if (data) {
            localStorage.setItem("user", JSON.stringify(data));

            const fullnameElement = document.getElementById('userFullname');
            const usernameElement = document.getElementById('userUsername');
            const emailElement = document.getElementById('userEmail');
            const biographyElement = document.getElementById('userBiography');
            const profilePhotoElement = document.getElementById('userProfilePhoto');

            if (fullnameElement) fullnameElement.textContent = data.fullname;
            if (usernameElement) usernameElement.textContent = data.username;
            if (emailElement) emailElement.textContent = data.mail;
            if (biographyElement) biographyElement.textContent = data.biography;

            if (profilePhotoElement && data.profilePhoto) {
                profilePhotoElement.src = data.profilePhoto;
            }

            document.getElementById('oscuro').style.display = "none";
            Swal.fire({
                title: "Profile updated successfully!",
                icon: "success",
                draggable: true,
                confirmButtonColor: "#6f523b"
              });
        }
    } catch (error) {
        console.error("Error saving changes:", error);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "There was an error. Please try again.",
            confirmButtonColor: "#6f523b"
        });
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const btnEdit = document.getElementById('btn-edit');
    const saveChangesBtn = document.getElementById('saveChanges');
    const cancelEditBtn = document.getElementById('cancelEdit');

    if (btnEdit) {
        btnEdit.addEventListener('click', editarPerfil);
    }

    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', guardarCambios);
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', cancelarEdicion);
    }
});

function editarPerfil() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        const editFullnameInput = document.getElementById('editFullname');
        const editUsernameInput = document.getElementById('editUsername');
        const editBiographyInput = document.getElementById('editBiography');
        const editEmailInput = document.getElementById('editEmail');
        if (editFullnameInput) editFullnameInput.placeholder = user.fullname || 'Nombre completo';
        if (editUsernameInput) editUsernameInput.placeholder = user.username || 'Nombre de usuario';
        if (editBiographyInput) editBiographyInput.placeholder = user.biography || 'Biografía';
        if (editEmailInput) editEmailInput.placeholder = user.mail || 'Correo electrónico';

        if (editFullnameInput) editFullnameInput.value = user.fullname || '';
        if (editUsernameInput) editUsernameInput.value = user.username || '';
        if (editBiographyInput) editBiographyInput.value = user.biography || '';
        if (editEmailInput) editEmailInput.value = user.mail || '';
    } else {
        console.error("No user data found in localStorage");
    }
    const oscuro = document.getElementById('oscuro');
    if (oscuro) {
        oscuro.style.display = 'block';
    }
}

function cancelarEdicion() {
    const oscuro = document.getElementById('oscuro');
    if (oscuro) {
        oscuro.style.display = "none";
    } else {
        console.error('Edit form not found');
    }
}

// POSSSSSSSTTTT

function crearModalEditarPost() {
    const modal = document.getElementById('editPostModal');
    if (!modal) {
        console.error('Edit modal not found');
        return;
    }

    document.getElementById('saveEditPost').addEventListener('click', async () => {
        const postId = modal.dataset.postId;
        const nuevoContenido = document.getElementById('editPostContent').value;
        const nuevaImagen = document.getElementById('editPostImage').value;

        try {
            const response = await fetch(`http://localhost:8080/api/post/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    content: nuevoContenido,
                    image: nuevaImagen
                })
            });

            if (!response.ok) {
                throw new Error('The post could not be updated');
            }
            modal.style.display = 'none';
            obtenerMisPosts();
            Swal.fire({
                title: "Post updated successfully!",
                icon: "success",
                draggable: true,
                confirmButtonColor: "#6f523b"
              });
        } catch (error) {
            console.error('Error updating post:', error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "The post could not be updated",
                confirmButtonColor: "#6f523b"
            });
        }
    });

    document.getElementById('cancelEditPost').addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

async function editarPost(postId) {
    try {
        const response = await fetch(`http://localhost:8080/api/post/${postId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Could not get post details.');
        }

        const post = await response.json();
        const editModal = document.getElementById('editPostModal');

        if (!editModal) {
            console.error('Edit modal not found');
            return;
        }

        document.getElementById('editPostContent').value = post.content;
        document.getElementById('editPostImage').value = post.image || '';
        
        const currentDate = new Date().toISOString();
        post.publicationDate = currentDate;
        document.getElementById('editPostDate').textContent = new Date(currentDate).toLocaleString();

        editModal.dataset.postId = postId;
        editModal.style.display = 'block';

    } catch (error) {
        console.error('Error loading post details:', error);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "The post could not be loaded for editing",
            confirmButtonColor: "#6f523b"
        });
    }
}

async function guardarPostEditado(postId) {
    const postEditado = {
        content: document.getElementById('editPostContent').value.trim(),
        image: document.getElementById('editPostImage').value.trim()
    };

    try {
        const response = await fetch(`http://localhost:8080/api/post/${postId}`, {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(postEditado)
        });

        if (!response.ok) {
            throw new Error('Error al guardar el post');
        }

        const updatedPost = await response.json();
        Swal.fire({
            title: "Post updated successfully!",
            icon: "success",
            draggable: true,
            confirmButtonColor: "#6f523b"
          });
        
        document.getElementById('postContent').textContent = updatedPost.content;
        document.getElementById('postImage').src = updatedPost.image || 'default-image.png';

    } catch (error) {
        console.error('Error updating post:', error);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "The post could not be updated",
            confirmButtonColor: "#6f523b"
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    crearModalEditarPost();
});

async function eliminarPost(postId) {
    const result = await Swal.fire({
        title: "Are you sure you want to delete this post?",
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
        confirmButtonColor: "#6f523b",
        cancelButtonColor: "#3085d6"
    });

    if (!result.isConfirmed) {
        Swal.fire({
            title: "Changes are not saved",
            icon: "info",
            confirmButtonColor: "#6f523b" 
        });
        return; 
    }

    try {
        const response = await fetch(`http://localhost:8080/api/post/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Could not delete post');
        }

        document.getElementById(postId)?.remove();
        Swal.fire({
            title: "Post successfully deleted!",
            icon: "success",
            confirmButtonColor: "#6f523b"
        }).then(() => {
            location.reload(); 
        });

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Could not delete post",
            confirmButtonColor: "#6f523b"
        });
    }
}



function createEditPostModal() {
    const modal = document.createElement('div');
    modal.id = 'editPostModal';
    modal.className = 'modal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Edit Post</h2>
            <textarea id="editPostContent" rows="4" cols="50"></textarea>
            <input type="text" id="editPostImage" placeholder="Image URL (optional)">
            <div class="modal-buttons">
                <button id="saveEditPost">Save Changes</button>
                <button id="cancelEditPost">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('saveEditPost').addEventListener('click', async () => {
        const postId = modal.dataset.postId;
        const nuevoContenido = document.getElementById('editPostContent').value;
        const nuevaImagen = document.getElementById('editPostImage').value;

        try {
            const response = await fetch(`http://localhost:8080/api/post/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    content: nuevoContenido,
                    image: nuevaImagen
                })
            });

            if (!response.ok) {
                throw new Error('The post could not be updated ${response.status}');
            }
            modal.style.display = 'none';
            obtenerMisPosts();

            Swal.fire({
                title: "Post updated successfully!",
                icon: "success",
                draggable: true,
                confirmButtonColor: "#6f523b"
              });

        } catch (error) {
            console.error('Error updating post:', error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Could not update the post",
                confirmButtonColor: "#6f523b"
            });
        }
    });

    document.getElementById('cancelEditPost').addEventListener('click', () => {
        modal.style.display = 'none';
    });
}


function obtenerIdUsuarioDesdeToken(token) {
    const user = JSON.parse(localStorage.getItem("user"));
    return user ? user.id_user : null;
}


document.addEventListener("DOMContentLoaded", () => {
    actualizarContadoresSeguidores();
});

async function actualizarContadoresSeguidores() {
    const token = obtenerToken();
    const currentUserId = obtenerIdUsuarioDesdeToken(token);
    if (!currentUserId) return;

    try {
        const response = await fetch(`http://localhost:8080/api/users/${currentUserId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Error updating counters");

        const userData = await response.json();
        console.log("Data received:", userData); 

        const followersCount = Array.isArray(userData.followers) ? userData.followers.length : 0;
        const followingCount = Array.isArray(userData.following) ? userData.following.length : 0;

        document.getElementById("followers").textContent = `${followersCount} Followers`;
        document.getElementById("following").textContent = `${followingCount} Following`;

    } catch (error) {
        console.error("Error updating counters:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("userFullname")) {
        showUserProfile();
    }
});

document.addEventListener("DOMContentLoaded", createEditPostModal);

document.getElementById("followers").addEventListener("click", () => showUserList("followers"));
document.getElementById("following").addEventListener("click", () => showUserList("following"));

async function showUserList(type) {
    const token = obtenerToken();
    const userId = obtenerIdUsuarioDesdeToken(token);
    if (!userId) return;

    try {
        const response = await fetch(`http://localhost:8080/api/users/${userId}/${type}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Error al obtener los datos");

        const users = await response.json();
        console.log(`Datos recibidos para ${type}:`, users);

        const modal = document.getElementById("userListModal");
        const modalTitle = document.getElementById("modalTitle");
        const modalUserList = document.getElementById("modalUserList");

        modalTitle.textContent = type === "followers" ? "Seguidores" : "Seguidos";
        modalUserList.innerHTML = "";

        if (users.length > 0) {
            users.forEach(user => {
                const li = document.createElement("li");
                li.classList.add("user-item");

                const img = document.createElement("img");
                img.src = user.profilePhoto || "/background/fotoPerfilPredeterminada.png"; 
                img.alt = "Foto de perfil";
                img.classList.add("user-photo");

                const span = document.createElement("span");
                span.textContent = user.username;
                span.classList.add("user-name");

                li.appendChild(img);
                li.appendChild(span);
                modalUserList.appendChild(li);
            });
        } else {
            modalUserList.innerHTML = "<li>No hay usuarios</li>";
        }

        modal.style.display = "block";

    } catch (error) {
        console.error("Error al obtener usuarios:", error);
    }
}

function closeUserListModal() {
    document.getElementById("userListModal").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("userModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};
