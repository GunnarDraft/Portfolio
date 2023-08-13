const VS = /*glsl*/`
  uniform float scale; // Declara una variable uniforme de tipo float llamada "scale"
  uniform float factor; // Declara una variable uniforme de tipo float llamada "factor"
  varying vec2 vUv; // Declara una variable varying de tipo vec2 llamada "vUv"
  void main() { // Inicia la función principal que se ejecuta en cada vértice
    vec3 pos = position; // Crea una variable vec3 "pos" y la asigna al valor de la posición del vértice actual
    pos.x = pos.x + ((sin(uv.y * 3.1415926535897932384626433832795) * factor * 2.0) * 0.125); // Modifica el valor de x de "pos" basado en la función seno y los valores de "uv", "factor" y algunas constantes
    vUv = uv; // Asigna el valor de "uv" a "vUv"
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.); // Calcula la posición final del vértice en la pantalla usando las matrices de proyección y de modelView y la posición modificada del vértice
  } 
`

const FS = /*glsl*/`
  uniform sampler2D tex; // Declara una variable uniforme de tipo sampler2D llamada "tex"
  uniform float factor; // Declara una variable uniforme de tipo float llamada "factor"
  uniform float scale; // Declara una variable uniforme de tipo float llamada "scale"
  varying vec2 vUv; // Declara una variable varying de tipo vec2 llamada "vUv"
  void main() { // Inicia la función principal que se ejecuta en cada fragmento (píxel)
    float angle = 0.0; // Crea una variable float "angle" y le asigna el valor 0.0
    vec2 p = (vUv - vec2(0.5, 0.5)) * (1.0 - scale) + vec2(0.5, 0.5); // Calcula un valor basado en "vUv" y "scale"
    vec2 offset = factor / 50.0 * vec2(cos(angle), sin(angle)); // Calcula un desplazamiento basado en "factor" y "angle"
    vec4 cr = texture2D(tex, p + offset); // Obtiene el color del píxel en la textura "tex" en la posición "p + offset"
    vec4 cga = texture2D(tex, p); // Obtiene el color del píxel en la textura "tex" en la posición "p"
    vec4 cb = texture2D(tex, p - offset); // Obtiene el color del píxel en la textura "tex" en la posición "p - offset"
    gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a); // Asigna el color final del fragmento (píxel) en base a los colores obtenidos anteriormente
  }
`