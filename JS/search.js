const obtenerToken = () => localStorage.getItem("token");

const searchUsers = async (event) => {
    event.preventDefault();

    const searchInput = document.getElementById("searchInput").value;
    const token = obtenerToken();

    if (!token) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "You are not authenticated. Sign in.",
            confirmButtonColor: "#6f523b"
        });
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

        const users = await response.json();
        displaySearchResults(users);
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "There was a problem trying to search for users.",
            confirmButtonColor: "#6f523b"
        });
    }
};

const displaySearchResults = (users) => {
    const resultsContainer = document.getElementById("searchResults");
    resultsContainer.innerHTML = "";

    if (!users || users.length === 0) {
        resultsContainer.innerHTML = "<p>No se encontró ningún usuario.</p>";
        return;
    }

    const currentUserId = obtenerIdUsuarioDesdeToken(obtenerToken());

    users.forEach(user => {
        const showFollowButtons = currentUserId !== user.id_user;

        const userElement = document.createElement("div");
        userElement.classList.add("user-result");

        userElement.innerHTML = `
            <div class="user-profile-container">
                <div class="user-info-wrapper">
                    <div class="profile-image">
                        <img src="${user.profilePhoto || '/background/fotoPerfilPredeterminada.png'}" 
                            alt="Foto de perfil" width="50">
                    </div>
                    <div class="user-details">
                        <h3>${user.fullname}</h3>
                        <h4>@${user.username}</h4>
                    </div>
                    ${showFollowButtons ? `
                        <div class="follow-section">
                            <button id="followButton_${user.id_user}" 
                                    onclick="seguirUsuario(${user.id_user})" 
                                    class="follow-btn">Seguir</button>
                            <button id="unfollowButton_${user.id_user}" 
                                    onclick="dejarDeSeguirUsuario(${user.id_user})" 
                                    class="unfollow-btn" 
                                    style="display: none;">Dejar de seguir</button>
                        </div>
                    ` : ''}
                </div>
                <hr>
            </div>
        `;

        resultsContainer.appendChild(userElement);

        if (showFollowButtons) {
            verificarEstadoSeguimiento(user.id_user);
        }
    });
};

function obtenerIdUsuarioDesdeToken(token) {
    const user = JSON.parse(localStorage.getItem("user"));
    return user ? user.id_user : null;
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
    console.log("Token JWT:", token);

    const currentUserId = obtenerIdUsuarioDesdeToken(token); 

    if (!token || !currentUserId) {
        Swal.fire({
            title: "You are not authenticated.",
            confirmButtonColor: "#6f523b"
        });
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/users/${currentUserId}/follow/${targetUserId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({}) 
        });
        
        const responseText = await response.text();
        console.log("Response:", responseText);

        if (!response.ok) {
            console.error("Server error:", responseText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        await verificarEstadoSeguimiento(targetUserId);
    } catch (error) {
        console.error("Error al seguir usuario:", error);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Error trying to track user",
            confirmButtonColor: "#6f523b"
        });
    }
}


async function dejarDeSeguirUsuario(targetUserId) {
    const token = obtenerToken();
    const currentUserId = obtenerIdUsuarioDesdeToken(token);

    if (!token || !currentUserId) {
        Swal.fire({
            title: "You are not authenticated.",
            confirmButtonColor: "#6f523b"
        });
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
    } catch (error) {
        console.error("Error al dejar de seguir usuario:", error);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Error trying to track user",
            confirmButtonColor: "#6f523b"
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('userFullname')) {
        showUserProfile();
    }
});