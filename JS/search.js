

function searchUsers(event) {
    event.preventDefault();
    const searchTerm = document.getElementById("searchInput").value.trim();

    if (!searchTerm) {
        console.error("El término de búsqueda está vacío");
        return;
    }

    fetch(`http://localhost:8080/api/users/search?term=${encodeURIComponent(searchTerm)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la respuesta del servidor");
            }
            return response.json();
        })
        .then(users => {
            console.log("Usuarios encontrados:", users);
        })
        .catch(error => {
            console.error("Error en la búsqueda:", error);
        });
}



async function followUser(userId) {
    const currentUserId = JSON.parse(localStorage.getItem("user")).id_user;

    try {
        const response = await fetch(`/api/users/${currentUserId}/follow/${userId}`, {
            method: "POST"
        });

        if (response.ok) {
            alert("Has seguido a este usuario");
        } else {
            alert("Error al seguir usuario");
        }
    } catch (error) {
        console.error("Error al seguir:", error);
    }
}
