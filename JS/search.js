// search.js
const obtenerToken = () => localStorage.getItem("token");

const searchUsers = async (event) => {
    event.preventDefault();

    const searchInput = document.getElementById("searchInput").value;
    const token = obtenerToken();

    if (!token) {
        alert("No estás autenticado. Inicia sesión.");
        window.location.href = "../login.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/users/search?term=${encodeURIComponent(searchInput)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const user = await response.json();
        displaySearchResults(user);
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        alert("Hubo un problema al intentar buscar usuarios.");
    }
};

const displaySearchResults = (user) => {
    const resultsContainer = document.getElementById("searchResults");
    resultsContainer.innerHTML = "";

    if (!user) {
        resultsContainer.innerHTML = "<p>No se encontró ningún usuario.</p>";
        return;
    }

    const currentUserId = obtenerIdUsuarioDesdeToken(obtenerToken());

    // No mostrar botones de seguir si el usuario encontrado es el mismo usuario actual
    const showFollowButtons = currentUserId !== user.id_user;

    const userElement = document.createElement("div");
    userElement.classList.add("user-result");

    userElement.innerHTML = `
        <div class="user-info">
            <h3>${user.fullname} (@${user.username})</h3>
            <p>${user.biography || "Sin biografía"}</p>
            <img src="${user.profilePhoto || '/background/fotoPerfilPredeterminada.png'}" 
                alt="Foto de perfil" width="50">
        </div>
        ${showFollowButtons ? `
            <div class="follow-buttons">
                <button id="followButton_${user.id_user}" 
                        onclick="seguirUsuario(${user.id_user})" 
                        class="follow-btn">Seguir</button>
                <button id="unfollowButton_${user.id_user}" 
                        onclick="dejarDeSeguirUsuario(${user.id_user})" 
                        class="unfollow-btn" 
                        style="display: none;">Dejar de seguir</button>
            </div>
        ` : ''}
        <hr>
    `;

    resultsContainer.appendChild(userElement);

    if (showFollowButtons) {
        verificarEstadoSeguimiento(user.id_user);
    }
};

function obtenerIdUsuarioDesdeToken(token) {
    if (!token) return null;

    try {
        const partes = token.split('.');
        if (partes.length !== 3) return null;

        const payload = JSON.parse(atob(partes[1]));
        return payload.id;
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
    }
}

async function verificarEstadoSeguimiento(targetUserId) {
    const token = obtenerToken();
    const currentUserId = obtenerIdUsuarioDesdeToken(token);

    if (!currentUserId || !targetUserId) return;

    try {
        const response = await fetch(`http://localhost:8080/api/users/${currentUserId}/following`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const following = await response.json();
        const isFollowing = following.some(user => user.id_user === targetUserId);

        actualizarBotonesSeguimiento(targetUserId, isFollowing);
    } catch (error) {
        console.error("Error al verificar estado de seguimiento:", error);
    }
}

function actualizarBotonesSeguimiento(targetUserId, isFollowing) {
    const followBtn = document.getElementById(`followButton_${targetUserId}`);
    const unfollowBtn = document.getElementById(`unfollowButton_${targetUserId}`);

    if (followBtn && unfollowBtn) {
        followBtn.style.display = isFollowing ? 'none' : 'inline-block';
        unfollowBtn.style.display = isFollowing ? 'inline-block' : 'none';
    }
}

async function seguirUsuario(targetUserId) {
    const token = obtenerToken();
    const currentUserId = obtenerIdUsuarioDesdeToken(token);

    if (!token || !currentUserId) {
        alert("No estás autenticado.");
        window.location.href = "../Pages/login.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/users/${currentUserId}/follow/${targetUserId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.text();
        console.log(result);
        verificarEstadoSeguimiento(targetUserId);
        actualizarContadoresSeguidores();
    } catch (error) {
        console.error("Error al seguir usuario:", error);
        alert("Error al intentar seguir al usuario");
    }
}

async function dejarDeSeguirUsuario(targetUserId) {
    const token = obtenerToken();
    const currentUserId = obtenerIdUsuarioDesdeToken(token);

    if (!token || !currentUserId) {
        alert("No estás autenticado.");
        window.location.href = "../login.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/users/${currentUserId}/unfollow/${targetUserId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.text();
        console.log(result);
        verificarEstadoSeguimiento(targetUserId);
        actualizarContadoresSeguidores();
    } catch (error) {
        console.error("Error al dejar de seguir usuario:", error);
        alert("Error al intentar dejar de seguir al usuario");
    }
}

// profile.js additions
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

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const userData = await response.json();

        // Actualizar contadores en el DOM si existen los elementos
        const followersCount = document.getElementById('followersCount');
        const followingCount = document.getElementById('followingCount');

        if (followersCount) {
            followersCount.textContent = userData.followers.length;
        }
        if (followingCount) {
            followingCount.textContent = userData.following.length;
        }
    } catch (error) {
        console.error("Error al actualizar contadores:", error);
    }
}

// Asegurarse de que los contadores se actualicen cuando se carga el perfil
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('userFullname')) {
        showUserProfile();
        actualizarContadoresSeguidores();
    }
});