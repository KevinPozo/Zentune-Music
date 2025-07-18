# Zentune Music

**Autor:** Kevin Fernando Pozo Maldonado  
**Correo:** kevinferpozo@gmail.com  
**Demo online:** [Zentune Music en GitHub Pages](https://kevinpozo.github.io/Zentune-Music/)

---

## ¿Qué es Zentune Music?
Zentune Music es un reproductor web moderno y visualmente atractivo para escuchar música electrónica, NCS, NCN, Lo-Fi y más. Permite explorar artistas, buscar canciones, gestionar favoritos, crear una cola de reproducción y disfrutar de radios Lo-Fi, todo con una interfaz neón y responsiva.

### Características principales
- Búsqueda rápida de artistas y canciones.
- Reproductor de YouTube integrado.
- Radios Lo-Fi y colecciones especiales.
- Favoritos, cola de reproducción y compartir.
- Fondos animados y visuales neón personalizables.
- Responsive: funciona en PC y móvil.

## Estructura del proyecto
```
Zentune Music/
│
├── index.html           # Página principal
├── script.js            # Lógica y funcionalidad JS
├── assets/              # Estilos, imágenes, gifs
│   ├── style.css
│   ├── Fondo.gif
│   ├── FondoLoffi.gif
│   ├── Fondo2.png
│   └── ...
└── data/
    └── ncs_tracks.json  # Base de datos de canciones y radios
```

## ¿Cómo ejecutar el proyecto localmente?
1. Abre una terminal y navega a la carpeta del proyecto:
   ```sh
   cd /ruta/a/Zentune\ Music
   ```
2. Inicia un servidor local con Python 3:
   ```sh
   python3 -m http.server 8000
   ```
3. Abre tu navegador y visita:
   ```
   http://localhost:8000/
   ```

---

¡Disfruta de la música y la experiencia visual de Zentune Music! 