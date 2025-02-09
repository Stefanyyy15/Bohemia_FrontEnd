document.addEventListener("DOMContentLoaded", async function () {
    let preloader = document.getElementById("preloader");
    preloader.classList.add("fade-out");
    setTimeout(() => {
        preloader.style.display = "none";
        document.getElementById("contenido").classList.remove("hidden");
    }, 500);

    const userId = localStorage.getItem("id_user");
    const token = localStorage.getItem("token"); // Obtener el token desde el localStorage
    if (userId && token) {
        console.log("Obteniendo notificaciones para el usuario:", userId);
        await getUnreadNotifications(userId, token); // Pasar token a la función
    } else {
        console.error("No se encontró ID de usuario o token en localStorage.");
    }
});

async function getUnreadNotifications(userId, token) {
    try {
        const response = await fetch(`http://localhost:8080/api/notification/unread/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // Enviar el token con la solicitud
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Error ${response.status}: ${errorMessage}`);
        }

        const notifications = await response.json();
        console.log("Notificaciones recibidas:", notifications);
        displayNotifications(notifications);
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
    }
}

function displayNotifications(notifications) {
    const container = document.getElementById("notifications-container");
    container.innerHTML = "";

    if (!notifications || notifications.length === 0) {
        container.innerHTML = "<p>No tienes notificaciones nuevas</p>";
        return;
    }

    notifications.forEach(notification => {
        const notificationItem = document.createElement("div");
        notificationItem.classList.add("notification");
        notificationItem.innerHTML = `
            <p>${notification.message}</p>
            <button onclick="markAsRead(${notification.id}, this)">Marcar como leída</button>
        `;
        container.appendChild(notificationItem);
    });
}

async function markAsRead(notificationId, button) {
    const token = localStorage.getItem("token"); // Obtener el token desde el localStorage

    try {
        const response = await fetch(`http://localhost:8080/api/notification/read/${notificationId}`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}` // Enviar el token con la solicitud
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Error ${response.status}: ${errorMessage}`);
        }

        console.log(`Notificación ${notificationId} marcada como leída.`);
        button.parentElement.remove();
    } catch (error) {
        console.error("Error al marcar como leída:", error);
    }
}
