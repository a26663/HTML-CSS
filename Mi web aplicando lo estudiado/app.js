document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed")
  
    // Elementos del DOM
    const peliculasContainer = document.getElementById("peliculas")
    const generoSelect = document.getElementById("genero")
    const ordenarButton = document.getElementById("ordenar")
    const buscarInput = document.getElementById("buscar")
    const botonBuscar = document.getElementById("botonBuscar")
  
    // Verificar que los elementos del DOM se han encontrado correctamente
    console.log("peliculasContainer:", peliculasContainer)
    console.log("generoSelect:", generoSelect)
    console.log("ordenarButton:", ordenarButton)
    console.log("buscarInput:", buscarInput)
    console.log("botonBuscar:", botonBuscar)
  
    // Estado de la aplicación
    let peliculas = []
    let peliculasFiltradas = []
    let ordenAscendente = true
    let filtroActual = {
      genero: "todos",
      busqueda: "",
      ordenamiento: "año",
    }
  
    // Cargar y mostrar películas
    async function inicializarAplicacion() {
      try {
        console.log("Iniciando carga de películas...")
        const response = await fetch("peliculas.json")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
  
        const data = await response.json()
        console.log("Datos cargados:", data)
  
        if (!Array.isArray(data)) {
          throw new Error("Los datos cargados no son un array")
        }
  
        peliculas = data
        peliculasFiltradas = [...peliculas]
  
        console.log("Películas cargadas:", peliculas.length)
  
        cargarGeneros()
        mostrarPeliculas(peliculas)
        actualizarContador()
      } catch (error) {
        console.error("Error al cargar las películas:", error)
        mostrarError("Error al cargar las películas. Por favor, intenta más tarde.")
      }
    }
  
    // Mostrar películas
    function mostrarPeliculas(peliculasAMostrar) {
      console.log("Mostrando películas:", peliculasAMostrar.length)
      peliculasContainer.innerHTML = ""
  
      if (peliculasAMostrar.length === 0) {
        mostrarMensajeNoResultados()
        return
      }
  
      peliculasAMostrar.forEach((pelicula, index) => {
        const peliculaDiv = crearTarjetaPelicula(pelicula)
        peliculaDiv.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s backwards`
        peliculasContainer.appendChild(peliculaDiv)
      })
    }
  
    // Crear tarjeta de película
    function crearTarjetaPelicula(pelicula) {
      const peliculaDiv = document.createElement("div")
      peliculaDiv.className = "pelicula"
  
      const imagenUrl = pelicula.imagen || "https://via.placeholder.com/300x450"
  
      peliculaDiv.innerHTML = `
              <div class="pelicula-imagen">
                  <img src="${imagenUrl}" alt="${pelicula.titulo}" 
                      onerror="this.src='https://via.placeholder.com/300x450'">
                  <span class="año">${pelicula.año}</span>
              </div>
              <div class="pelicula-info">
                  <h3>${pelicula.titulo}</h3>
                  <span class="genero">${pelicula.genero}</span>
                  ${pelicula.descripcion ? `<p class="descripcion">${pelicula.descripcion}</p>` : ""}
              </div>
          `
  
      return peliculaDiv
    }
  
    // Cargar géneros únicos
    function cargarGeneros() {
      const generos = [...new Set(peliculas.map((pelicula) => pelicula.genero))].sort()
      generoSelect.innerHTML = '<option value="todos">Todos los géneros</option>'
  
      generos.forEach((genero) => {
        const option = document.createElement("option")
        option.value = genero
        option.textContent = genero
        generoSelect.appendChild(option)
      })
    }
  
    // Aplicar todos los filtros activos
    function aplicarFiltros() {
      console.log("Aplicando filtros:", filtroActual)
      peliculasFiltradas = peliculas
        .filter(
          (pelicula) =>
            (filtroActual.genero === "todos" || pelicula.genero === filtroActual.genero) &&
            (pelicula.titulo.toLowerCase().includes(filtroActual.busqueda.toLowerCase()) ||
              pelicula.genero.toLowerCase().includes(filtroActual.busqueda.toLowerCase()) ||
              pelicula.año.toString().includes(filtroActual.busqueda)),
        )
        .sort((a, b) => {
          const factor = ordenAscendente ? 1 : -1
          return (a.año - b.año) * factor
        })
  
      console.log("Películas filtradas:", peliculasFiltradas.length)
      mostrarPeliculas(peliculasFiltradas)
      actualizarContador()
    }
  
    // Mostrar mensaje cuando no hay resultados
    function mostrarMensajeNoResultados() {
      peliculasContainer.innerHTML = `
              <div class="no-resultados">
                  <p>No se encontraron películas que coincidan con tu búsqueda.</p>
                  <button onclick="resetearFiltros()">Mostrar todas las películas</button>
              </div>
          `
    }
  
    // Mostrar mensaje de error
    function mostrarError(mensaje) {
      peliculasContainer.innerHTML = `
              <div class="error-mensaje">
                  <p>${mensaje}</p>
              </div>
          `
    }
  
    // Actualizar contador de películas
    function actualizarContador() {
      const contadorExistente = document.querySelector(".contador")
      if (contadorExistente) {
        contadorExistente.remove()
      }
      const contador = document.createElement("div")
      contador.className = "contador"
      contador.textContent = `Mostrando ${peliculasFiltradas.length} de ${peliculas.length} películas`
      peliculasContainer.insertAdjacentElement("beforebegin", contador)
    }
  
    // Event Listeners
    generoSelect.addEventListener("change", function () {
      filtroActual.genero = this.value
      aplicarFiltros()
    })
  
    ordenarButton.addEventListener("click", () => {
      ordenAscendente = !ordenAscendente
      aplicarFiltros()
    })
  
    buscarInput.addEventListener("input", function () {
      filtroActual.busqueda = this.value
      aplicarFiltros()
    })
  
    botonBuscar.addEventListener("click", () => {
      filtroActual.busqueda = buscarInput.value
      aplicarFiltros()
    })
  
    // Búsqueda al presionar Enter
    buscarInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        filtroActual.busqueda = this.value
        aplicarFiltros()
      }
    })
  
    // Resetear filtros
    window.resetearFiltros = () => {
      filtroActual = {
        genero: "todos",
        busqueda: "",
        ordenamiento: "año",
      }
      buscarInput.value = ""
      generoSelect.value = "todos"
      aplicarFiltros()
    }
  
    // Iniciar la aplicación
    inicializarAplicacion()
  })
  
  