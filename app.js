const url1 = "";

const peticionGet = async (url) => {
    try {
        const respuesta = await fetch(url, {
            credentials: 'include',
            headers: {
                'Accept': 'aplication/json',
                'Content-Type': 'aplication/json',
                'Authorization': ''
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