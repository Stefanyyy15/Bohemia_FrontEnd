document.addEventListener("DOMContentLoaded", function () {
    let preloader = document.getElementById("preloader");
    preloader.classList.add("fade-out");
    setTimeout(() => {
        preloader.style.display = "none";
        document.getElementById("contenido").classList.remove("hidden");
    }, 500);

    const userId = localStorage.getItem("id_user"); // Verifica el nombre correcto en localStorage
    if (userId) {
        getUnreadNotifications(userId);
    }
});

async function getUnreadNotifications(userId) {
    try {
        const response = await fetch(`/api/notifications/unread/${userId}`);
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Error ${response.status}: ${errorMessage}`);
        }
        const notifications = await response.json();
        displayNotifications(notifications);
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
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
        const response = await fetch(`/api/notifications/read/${notificationId}`, {
            method: "PUT",
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Error ${response.status}: ${errorMessage}`);
        }

        // Ocultar la notificación después de marcarla como leída
        button.parentElement.remove();
    } catch (error) {
        console.error("Error al marcar como leída:", error);
    }
}
