const url1 = "http://localhost:8080/api/users";

const peticionGet = async (url) => {
    try {
        const respuesta = await fetch(url, {
            //credentials: 'include',
            headers: {
                'Accept': 'aplication/json',
                'Content-Type': 'aplication/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJjYW1wdXNjbCIsInN1YiI6IlBhekVuRWxBcmlwb3JvQGVtYWlsLmNvbSIsImF1dGhvcml0aWVzIjpbIlJPTEVfVVNFUiJdLCJpYXQiOjE3MzgyNTM2OTIsImV4cCI6MTczOTExNzY5Mn0.NF7WvRmMlRBj5qJ5BciFg2nT_Hs02WhhyMLdjSX7euf9Vx9X_zV914fxWPkNuQJJO7qZ0_nYNzh7j3GmLVxmgw'
            }
        });
        console.log('Response status: ', respuesta.status);
        if (respuesta.ok) {
            const info = await respuesta.json();
            console.log(info);
            return info;
        } else {
            console.log('Error ', respuesta.status);
            return null;
        }
    } catch (error) {
        console.error('Error ', error);
        return null;
    }
}

const mostrarDatos = async(url)=>{
    const respuesta = await peticionGet(url);
    console.log(respuesta);
}

mostrarDatos(url1);