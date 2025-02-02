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

const obtenerUsuarios = async () => {
    const data = await peticionAutenticada("http://localhost:8080/api/users");
    console.log(data);
};


function showUserProfile() {
    let token = localStorage.getItem('token');
    console.log('Token almacenado:', token);

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
            console.log('Datos recibidos:', data);
            if (data && data.user) {
                const user = data.user;
                document.getElementById('userFullname').textContent = user.fullname;
                document.getElementById('userUsername').textContent = user.username;
                document.getElementById('userBiography').textContent = user.biography;
                if (user.profilePhoto) {
                    document.getElementById('userProfilePhoto').src = user.profilePhoto;
                }

                document.getElementById('contenido').classList.remove('hidden');
                document.getElementById('preloader').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (error.message.includes('401')) {
                alert('Sesión expirada. Por favor, inicie sesión nuevamente.');
                window.location.href = '../login/login.html';
            } else {
                alert('Error al cargar el perfil. Por favor, intente nuevamente.');
            }
        });
}

// Llamada a esta función cuando se cargue el perfil
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('userFullname')) {
        showUserProfile();
        actualizarSeguidores();  // Asegurarse de que los seguidores estén actualizados cuando se cargue el perfil
    }
});


document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('userFullname')) {
        showUserProfile();
    }
});



function cerrarSesion() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "./login.html";
}