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

// MOSTRAR INFO DEL USUARIO

const showUserProfile = () => {
    let token = localStorage.getItem('token');
    if (!token) {
        alert("No se encontró un token. Por favor, inicie sesión.");
        window.location.href = '../login/login.html';
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
            console.log('Estado de la respuesta:', response.status);
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
                    console.error('No se encontraron los elementos en el DOM');
                }

                document.getElementById('contenido').classList.remove('hidden');
                document.getElementById('preloader').style.display = 'none';

                obtenerMisPosts();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (error.message.includes('401')) {
                alert('Sesión expirada. Por favor, inicie sesión nuevamente.');
                window.location.href = '../login.html';
            } else {
                alert('Error al cargar el perfil. Por favor, intente nuevamente.');
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
        console.error("No se encontró un usuario válido en localStorage.");
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

        console.log("Estado de la respuesta para posts:", respuesta.status);

        if (!respuesta.ok) {
            const errorText = await respuesta.text();
            console.error("Error al obtener los posts:", errorText);
            return;
        }

        const posts = await respuesta.json();
        mostrarMisPosts(posts);
    } catch (error) {
        console.error("Error al obtener los posts:", error);
    }
}


function editarPerfil() {
    document.getElementById('editProfileForm').classList.remove('hidden');
    const fullnameElement = document.getElementById('userFullname');
    const usernameElement = document.getElementById('userUsername');
    const biographyElement = document.getElementById('userBiography');
    if (fullnameElement && usernameElement && biographyElement) {
        document.getElementById('editFullname').value = fullnameElement.textContent;
        document.getElementById('editUsername').value = usernameElement.textContent;
        document.getElementById('editBiography').value = biographyElement.textContent;
    } else {
        console.error("No se encontraron los elementos para editar el perfil.");
    }
}


async function guardarCambios() {
    const token = obtenerToken(); 
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id_user) {
        alert("No se pudo obtener el ID del usuario.");
        return;
    }

    const userId = user.id_user;
    const fullname = document.getElementById('editFullname').value;
    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    const password = document.getElementById('editPassword').value;
    const biography = document.getElementById('editBiography').value;
    const profilePhotoUrl = document.getElementById('editProfilePhoto').value;

    if (!fullname || !username || !email) {
        alert("El nombre completo, nombre de usuario y correo son obligatorios.");
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
            alert("Hubo un error al guardar los cambios.");
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

            document.getElementById('editProfileForm').classList.add('hidden');

            alert("Perfil actualizado correctamente.");
        }
    } catch (error) {
        console.error("Error al guardar los cambios:", error);
        alert("Hubo un error. Intenta nuevamente.");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    guardarCambios();
});


function cancelarEdicion() {
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.classList.add('hidden');
    } else {
        console.error('No se encontró el formulario de edición');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const btnEdit = document.getElementById('btn-edit');
    const btnSaveChanges = document.getElementById('saveChanges');
    const btnCancelEdit = document.getElementById('cancelEdit');

    if (btnEdit) {
        btnEdit.addEventListener('click', () => {
            document.getElementById('editProfileForm').classList.remove('hidden');
        });
    }

    if (btnSaveChanges) {
        btnSaveChanges.addEventListener('click', guardarCambios);
    }

    if (btnCancelEdit) {
        btnCancelEdit.addEventListener('click', cancelarEdicion);
    }
});


function mostrarMisPosts(posts) {
    const contenedorPost = document.querySelector(".contenedorMisPosts");
    if (!contenedorPost) {
        console.error("No se encontró el contenedor de posts");
        return;
    }

    contenedorPost.innerHTML = ''; 

    if (!posts || posts.length === 0) {
        const mensajeNoPosts = document.createElement("div");
        mensajeNoPosts.classList.add("no-posts-message");
        mensajeNoPosts.textContent = "No hay publicaciones para mostrar";
        contenedorPost.appendChild(mensajeNoPosts);
        return;
    }

    posts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");

        let imageHTML = post.image 
            ? `<div class="post-image-container"><img src="${post.image}" alt="Imagen del post" class="post-image"/></div>`
            : '';

        let userImage = post.user.profilePicture 
            ? `<img src="${post.user.profilePicture}" alt="Foto de perfil" class="post-user-image"/>`
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
                <button class="btn-edit" onclick="editarPost(${post.id_post})"><i class="fa fa-edit"></i> Edit</button>
                <button class="btn-delete" onclick="eliminarPost(${post.id_post})"><i class="fa fa-trash"></i> Delete</button>
            </div>
        `;

        contenedorPost.appendChild(postDiv);
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
        alert("No se pudo obtener el ID del usuario.");
        return;
    }

    const userId = user.id_user;
    const confirmacion = confirm("¿Are you sure you want to delete your profile? This action is irreversible.");
    if (!confirmacion) {
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
            alert("Tu perfil ha sido eliminado correctamente.");
            window.location.href = "../login.html";
        } else {
            const errorData = await response.json();
            alert(`Error al eliminar el perfil: ${errorData.message || "Intenta nuevamente."}`);
        }
    } catch (error) {
        console.error("Error al eliminar el perfil:", error);
        alert("Hubo un error. Intenta nuevamente.");
    }
}
