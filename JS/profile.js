window.addEventListener("load", function() {
    let preloader = document.getElementById("preloader");
    preloader.classList.add("fade-out");
    setTimeout(() => {
        preloader.style.display = "none";
        document.getElementById("contenido").classList.remove("hidden");
    }, 1000);
});

// Función para obtener el token
const obtenerToken = () => localStorage.getItem("token");

// Función para hacer peticiones autenticadas con el token
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

// Ejemplo de uso: Obtener usuarios autenticado
const obtenerUsuarios = async () => {
    const data = await peticionAutenticada("http://localhost:8080/api/users");
    console.log(data);
};


function showUserProfile() {
    const token = localStorage.getItem('token');
    console.log('Token almacenado:', token); // Verificar el token
    
    if (!token) {
        alert("No se encontró un token. Por favor, inicie sesión.");
        window.location.href = '../login/login.html';
        return;
    }

    // Verificar el formato del token en los headers
    console.log('Token enviado en headers:', `Bearer ${token}`);

    fetch('http://localhost:8080/api/users/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Código de respuesta:', response.status); // Ver el código de respuesta
        if (!response.ok) {
            return response.json().then(errorData => {
                console.log('Datos de error:', errorData); // Ver el error completo
                throw new Error(errorData.error || 'Error desconocido');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Datos recibidos:', data); // Ver los datos si la respuesta es exitosa
        if (data && data.user) {
            const user = data.user;
            document.getElementById('userFullname').innerText = user.fullname;
            document.getElementById('userUsername').innerText = user.username;
            document.getElementById('userBiography').innerText = user.biography;
            document.getElementById('userProfilePhoto').src = user.profilePhoto;
            
            document.getElementById('contenido').classList.remove('hidden');
            document.getElementById('preloader').style.display = 'none';
        } else {
            throw new Error('No se pudo obtener la información del usuario');
        }
    })
    .catch(error => {
        console.error("Error al obtener los datos del usuario:", error.message);
        alert(error.message);
        if (error.message.includes('Token inválido') || error.message.includes('No autorizado')) {
            
            //window.location.href = './Login.html';
        }
    });
}   