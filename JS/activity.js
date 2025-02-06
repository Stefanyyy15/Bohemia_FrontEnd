window.addEventListener("load", function () {
    let preloader = document.getElementById("preloader");
    preloader.classList.add("fade-out");
    setTimeout(() => {
        preloader.style.display = "none";
        document.getElementById("contenido").classList.remove("hidden");
    }, 1000);
});

async function getUnreadNotifications(userId) {
    try {
        const response = await fetch(`/api/notification/unread/${userId}`);
        if (!response.ok) {
            throw new Error("Error al obtener las notificaciones");
        }
        const notifications = await response.json();
        displayNotifications(notifications);
    } catch (error) {
        console.error("Error:", error);
    }
}
function displayNotifications(notifications) {
    const container = document.getElementById("notifications-container");
    container.innerHTML = ""; // Limpiar antes de agregar nuevas

    if (notifications.length === 0) {
        container.innerHTML = "<p>No tienes notificaciones nuevas</p>";
        return;
    }

    notifications.forEach(notification => {
        const notificationItem = document.createElement("div");
        notificationItem.classList.add("notification");
        notificationItem.innerHTML = `
            <p>${notification.message}</p>
            <button onclick="markAsRead(${notification.id_notification}, this)">Marcar como leída</button>
        `;
        container.appendChild(notificationItem);
    });
}
async function markAsRead(notificationId, button) {
    try {
        const response = await fetch(`/api/notification/read/${notificationId}`, {
            method: "PUT",
        });

        if (!response.ok) {
            throw new Error("Error al marcar como leída");
        }

        // Ocultar la notificación después de marcarla como leída
        button.parentElement.remove();
    } catch (error) {
        console.error("Error:", error);
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("id_user"); // Obtener el ID del usuario autenticado
    if (userId) {
        getUnreadNotifications(userId);
    }
});
