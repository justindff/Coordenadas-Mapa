async function buscarUbicacion(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=es`;

  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error("Error en la petición");
  }

  const datos = await respuesta.json();

  if (datos.error) {
    throw new Error("No se encontró ubicación para esas coordenadas");
  }

  return datos;
}


// 1. Buscar los elementos del HTML
const formulario = document.getElementById("formulario");
const inputLatitud = document.getElementById("latitud");
const inputLongitud = document.getElementById("longitud");
const boton = document.getElementById("boton");
const resultado = document.getElementById("resultado");



// Crear el mapa (empieza centrado en el mundo)
// Crear el mapa (empieza centrado en el mundo)
const mapa = L.map("mapa").setView([0, 0], 2);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(mapa);

let marcador = null;

// 2. Escuchar cuando el usuario envía el formulario
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const lat = parseFloat(inputLatitud.value);
  const lon = parseFloat(inputLongitud.value);

  if (isNaN(lat) || isNaN(lon)) {
    resultado.textContent = "Por favor ingresa ambos valores.";
    return;
  }

  if (lat < -90 || lat > 90) {
    resultado.textContent = "La latitud debe estar entre -90 y 90.";
    return;
  }

  if (lon < -180 || lon > 180) {
    resultado.textContent = "La longitud debe estar entre -180 y 180.";
    return;
  }

  resultado.textContent = "Cargando...";
  boton.disabled = true;

    try {
    const datos = await buscarUbicacion(lat, lon);

    const direccion = datos.address;
    const ciudad = direccion.city || direccion.town || direccion.village || "No disponible";
    const estado = direccion.state || "No disponible";
    const pais = direccion.country || "No disponible";

    resultado.innerHTML = `
      <p><strong>Dirección:</strong> ${datos.display_name}</p>
      <p><strong>Ciudad:</strong> ${ciudad}</p>
      <p><strong>Estado/Departamento:</strong> ${estado}</p>
      <p><strong>País:</strong> ${pais}</p>
    `;

    // Mover el mapa y poner el marcador
    mapa.setView([lat, lon], 13);

    if (marcador) {
      mapa.removeLayer(marcador);
    }

    marcador = L.marker([lat, lon]).addTo(mapa);
    marcador.bindPopup(datos.display_name).openPopup();
  } catch (error) {
    resultado.textContent = "Error: " + error.message;
  } finally {
    boton.disabled = false;
  }
});
