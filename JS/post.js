window.addEventListener("load", function () {
    let preloader = document.getElementById("preloader");
    preloader.classList.add("fade-out");
    setTimeout(() => {
        preloader.style.display = "none";
        document.getElementById("contenido").classList.remove("hidden");
    }, 1000);
});

const urlPost = "http://localhost:8080/api/post";

async function peticionPost(url, data) {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            alert("There is no valid token. Please log in.");
            return;
        }
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(data)
        });

        console.log('Response Status', respuesta.status);
        if (respuesta.ok) {
            const postCreado = await respuesta.json();
            return postCreado;
        } else {
            console.error('Error', respuesta.status);
            const textoError = await respuesta.text();
            console.error('Error detail:', textoError);
            return null;
        }
    } catch (error) {
        console.error("Error POST", error);
        return null;
    }
}

async function agregarPost(url) {
    const content = document.getElementById("content").value.trim();
    const image = document.getElementById("image").value.trim() || null;
    const user = JSON.parse(localStorage.getItem('user'));
    if (content.length < 5 || content.length > 500) {
        alert("The content of the post must be between 5 and 500 characters.");
        return;
    }

    const nuevoPost = {
        content,
        image,
        user: { id_user: user.id_user },
        publicationDate: new Date().toISOString()
    };

    try {
        const postCreado = await peticionPost(url, nuevoPost);

        if (postCreado) {
            console.log("Post created successfully:", postCreado);
            alert("Post created successfully");
            window.location.href = "/Pages/Index.html";
        } else {
            alert("Error creating post");
        }
    } catch (error) {
        console.error("Error in request:", error);
        alert("An error occurred while trying to create the post.");
    }
}


document.getElementById("btn-create-post").addEventListener("click", () => {
    agregarPost(urlPost);
});
