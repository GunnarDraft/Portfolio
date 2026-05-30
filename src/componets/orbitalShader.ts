const vertexShader = /*glsl*/`
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;
}
`;


const fragmentShader = /*glsl*/`
precision highp float;
precision highp int;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

// --- UNIFORMS DINÁMICOS ---
uniform int u_layout_mode;
uniform int u_filter_active;
uniform int u_color_mode;
uniform int u_enable_id_filter;
uniform int u_filter_id_start;
uniform int u_filter_id_end;
uniform int u_enable_l_filter;
uniform int u_filter_l_start;
uniform int u_filter_l_end;
uniform int u_enable_n_filter;
uniform int u_filter_n_start;
uniform int u_filter_n_end;
uniform int u_enable_spin_filter;
uniform int u_filter_spin_start;
uniform int u_filter_spin_end;
uniform int u_enable_m_filter;
uniform int u_filter_m_start;
uniform int u_filter_m_end;

#define CAM_Y_OFFSET 0.0      // Desplazamiento vertical de la cámara
#define CAM_INERTIA 0.92      // Reservado para suavizado/persistencia futura

// Paletas de color para diferenciar el estado de espín (Usado si u_color_modees 0)
#define POS_COL_UP vec3(1.000, 0.000, 1.000) // Púrpura (Spin +1/2)
#define NEG_COL_UP vec3(0.000, 1.000, 1.000) // Cian (Spin +1/2)
#define POS_COL_DN vec3(1.000, 0.500, 0.000) // Naranja (Spin -1/2)
#define NEG_COL_DN vec3(0.000, 1.000, 0.500) // Verde claro (Spin -1/2)


// --- PARÁMETROS DE CÁMARA Y ANIMACIÓN COLECTIVA ---
#define CAM_DIST_GRID 9.5     // Distancia focal de la cámara en modo Tabla Periódica
#define CAM_DIST_QUANT 5.5    // Distancia focal de la cámara en modo Espacio Cuántico
#define CAM_AUTO_SPEED 0.0  // Velocidad de rotación automática de la cámara en Rad/Seg
#define CAM_MOUSE_SENS 3.1416 // Sensibilidad del control por Mouse/Click-Arrastre

// --- ESCALADO DE ESPACIOS TRIDIMENSIONALES ---
#define GRID_SCALE_X 0.85     // Separación horizontal en Tabla Periódica
#define GRID_SCALE_Y 0.85     // Separación vertical en Tabla Periódica
#define QUANT_SCALE 0.75      // Escala tridimensional en modo cuántico
#define ATOM_BOUNDING_R 0.40  // Radio de contención esférica

// --- INTENSIDAD VOLUMÉTRICA INDIVIDUAL ---
#define ELECTRON_DENSITY 12000000.0
#define WAVE_STEP_SIZE 0.03
 #define ROTATE(p, a) p=cos(a)*p+sin(a)*vec2(p.y, -p.x)

// =========================================================================
// FILTROS (RANGOS INCLUSIVOS)
// =========================================================================
// Si END es menor que START, el filtro no se procesará.

#define MAX_FILTER_ITEMS 120

const int FILTER_IDS[MAX_FILTER_ITEMS] = int[](
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 10, 11, 12,
    13, 14, 15, 16,
    17, 18, 19, 20,
    21, 22, 23, 24,
    25, 26, 27, 28,
    29, 30, 31, 32,
    33, 34, 35, 36,
    37, 38, 39, 40,
    41, 42, 43, 44,
    45, 46, 47, 48,
    49, 50, 51, 52,
    53, 54, 55, 56,
    57, 58, 59, 60,
    61, 62, 63, 64,
    65, 66, 67, 68,
    69, 70, 71, 72,
    73, 74, 75, 76,
    77, 78, 79, 80,
    81, 82, 83, 84,
    85, 86, 87, 88,
    89, 90, 91, 92,
    93, 94, 95, 96,
    97, 98, 99, 100,
    101, 102, 103, 104,
    105, 106, 107, 108,
    109, 110, 111, 112,
    113, 114, 115, 116,
    117, 118, 119, 120
);

const float FILTER_L_VALUES[MAX_FILTER_ITEMS] = float[](
    0.0, 1.0, 2.0, 3.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0
);

const float FILTER_N_VALUES[MAX_FILTER_ITEMS] = float[](
    1.0, 2.0, 3.0, 4.0,
    5.0, 6.0, 7.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0
);

const float FILTER_SPIN_VALUES[MAX_FILTER_ITEMS] = float[](
    0.5, -0.5, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0
);

const float FILTER_M_VALUES[MAX_FILTER_ITEMS] = float[](
    0.0, 1.0, -1.0, 2.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0
);

// --- BASE DE DATOS DE COLORES POR NÚMERO ATÓMICO (HEX a RGB Normalizado) ---
const vec3 ELEMENT_VISIBLE[119] = vec3[](
    vec3(0.000, 0.000, 0.000), // Index 0
    vec3(0.950, 0.980, 0.880), // H
    vec3(0.880, 0.820, 0.980), // He
    vec3(0.280, 0.880, 0.950), // Li
    vec3(0.360, 0.580, 0.920), // Be
    vec3(0.820, 0.280, 0.480), // B
    vec3(0.120, 0.820, 0.880), // C
    vec3(0.860, 0.820, 0.080), // N
    vec3(0.150, 0.880, 0.920), // O
    vec3(0.280, 0.180, 0.880), // F
    vec3(0.820, 0.220, 0.120), // Ne
    vec3(0.020, 0.180, 0.950), // Na
    vec3(0.280, 0.280, 0.420), // Mg
    vec3(0.420, 0.380, 0.300), // Al
    vec3(0.580, 0.480, 0.280), // Si
    vec3(0.220, 0.480, 0.880), // P
    vec3(0.120, 0.280, 0.820), // S
    vec3(0.780, 0.220, 0.820), // Cl
    vec3(0.880, 0.380, 0.120), // Ar
    vec3(0.020, 0.320, 0.920), // K
    vec3(0.240, 0.380, 0.580), // Ca
    vec3(0.680, 0.580, 0.240), // Sc
    vec3(0.780, 0.580, 0.220), // Ti
    vec3(0.820, 0.480, 0.180), // V
    vec3(0.820, 0.380, 0.180), // Cr
    vec3(0.780, 0.480, 0.280), // Mn
    vec3(0.680, 0.620, 0.380), // Fe
    vec3(0.780, 0.580, 0.380), // Co
    vec3(0.820, 0.480, 0.420), // Ni
    vec3(0.880, 0.280, 0.380), // Cu
    vec3(0.820, 0.380, 0.320), // Zn
    vec3(0.580, 0.480, 0.380), // Ga
    vec3(0.680, 0.580, 0.480), // Ge
    vec3(0.220, 0.580, 0.880), // As
    vec3(0.080, 0.280, 0.820), // Se
    vec3(0.780, 0.180, 0.780), // Br
    vec3(0.880, 0.180, 0.080), // Kr
    vec3(0.020, 0.380, 0.880), // Rb
    vec3(0.280, 0.380, 0.520), // Sr
    vec3(0.720, 0.580, 0.280), // Y
    vec3(0.780, 0.480, 0.180), // Zr
    vec3(0.820, 0.480, 0.080), // Nb
    vec3(0.820, 0.380, 0.080), // Mo
    vec3(0.780, 0.380, 0.180), // Tc
    vec3(0.680, 0.580, 0.280), // Ru
    vec3(0.780, 0.580, 0.280), // Rh
    vec3(0.820, 0.480, 0.280), // Pd
    vec3(0.880, 0.280, 0.180), // Ag
    vec3(0.820, 0.280, 0.080), // Cd
    vec3(0.480, 0.480, 0.380), // In
    vec3(0.580, 0.480, 0.380), // Sn
    vec3(0.180, 0.580, 0.880), // Sb
    vec3(0.080, 0.280, 0.780), // Te
    vec3(0.680, 0.180, 0.820), // I
    vec3(0.880, 0.280, 0.080), // Xe
    vec3(0.020, 0.420, 0.880), // Cs
    vec3(0.280, 0.380, 0.480), // Ba
    vec3(0.680, 0.580, 0.380), // La
    vec3(0.720, 0.580, 0.320), // Ce
    vec3(0.740, 0.580, 0.280), // Pr
    vec3(0.780, 0.580, 0.240), // Nd
    vec3(0.780, 0.620, 0.280), // Pm
    vec3(0.820, 0.580, 0.280), // Sm
    vec3(0.820, 0.680, 0.220), // Eu
    vec3(0.820, 0.580, 0.180), // Gd
    vec3(0.820, 0.480, 0.220), // Tb
    vec3(0.780, 0.380, 0.220), // Dy
    vec3(0.780, 0.480, 0.280), // Ho
    vec3(0.820, 0.480, 0.320), // Er
    vec3(0.820, 0.380, 0.320), // Tm
    vec3(0.780, 0.280, 0.280), // Yb
    vec3(0.680, 0.380, 0.280), // Lu
    vec3(0.780, 0.480, 0.180), // Hf
    vec3(0.820, 0.480, 0.080), // Ta
    vec3(0.820, 0.380, 0.020), // W
    vec3(0.780, 0.380, 0.080), // Re
    vec3(0.680, 0.580, 0.180), // Os
    vec3(0.780, 0.580, 0.180), // Ir
    vec3(0.820, 0.480, 0.180), // Pt
    vec3(0.880, 0.180, 0.380), // Au
    vec3(0.820, 0.280, 0.180), // Hg
    vec3(0.380, 0.480, 0.380), // Tl
    vec3(0.480, 0.480, 0.380), // Pb
    vec3(0.180, 0.580, 0.780), // Bi
    vec3(0.080, 0.380, 0.680), // Po
    vec3(0.680, 0.180, 0.680), // At
    vec3(0.880, 0.280, 0.180), // Rn
    vec3(0.020, 0.480, 0.820), // Fr
    vec3(0.280, 0.380, 0.420), // Ra
    vec3(0.680, 0.580, 0.280), // Ac
    vec3(0.720, 0.580, 0.220), // Th
    vec3(0.780, 0.580, 0.180), // Pa
    vec3(0.820, 0.580, 0.120), // U
    vec3(0.820, 0.680, 0.180), // Np
    vec3(0.820, 0.580, 0.220), // Pu
    vec3(0.780, 0.480, 0.220), // Am
    vec3(0.780, 0.380, 0.280), // Cm
    vec3(0.680, 0.480, 0.280), // Bk
    vec3(0.780, 0.580, 0.280), // Cf
    vec3(0.820, 0.480, 0.280), // Es
    vec3(0.820, 0.380, 0.280), // Fm
    vec3(0.780, 0.280, 0.280), // Md
    vec3(0.680, 0.380, 0.280), // No
    vec3(0.580, 0.380, 0.280), // Lr
    vec3(0.780, 0.480, 0.180), // Rf
    vec3(0.820, 0.480, 0.080), // Db
    vec3(0.820, 0.380, 0.020), // Sg
    vec3(0.780, 0.380, 0.080), // Bh
    vec3(0.680, 0.580, 0.180), // Hs
    vec3(0.780, 0.580, 0.180), // Mt
    vec3(0.820, 0.480, 0.180), // Ds
    vec3(0.880, 0.180, 0.280), // Rg
    vec3(0.820, 0.280, 0.180), // Cn
    vec3(0.380, 0.480, 0.280), // Nh
    vec3(0.480, 0.480, 0.280), // Fl
    vec3(0.180, 0.580, 0.680), // Mc
    vec3(0.080, 0.380, 0.580), // Lv
    vec3(0.680, 0.180, 0.580), // Ts
    vec3(0.880, 0.180, 0.080)  // Og
);

const vec3 ELEMENT_ABSORPTION[119] = vec3[](
    vec3(0.000, 0.000, 0.000), // Index 0
    vec3(0.050, 0.020, 0.120), // H
    vec3(0.120, 0.180, 0.020), // He
    vec3(0.720, 0.120, 0.050), // Li
    vec3(0.640, 0.420, 0.080), // Be
    vec3(0.180, 0.720, 0.520), // B
    vec3(0.920, 0.180, 0.120), // C
    vec3(0.140, 0.180, 0.920), // N
    vec3(0.850, 0.120, 0.080), // O
    vec3(0.720, 0.820, 0.120), // F
    vec3(0.180, 0.780, 0.880), // Ne
    vec3(0.980, 0.820, 0.050), // Na
    vec3(0.720, 0.720, 0.580), // Mg
    vec3(0.580, 0.620, 0.700), // Al
    vec3(0.420, 0.520, 0.720), // Si
    vec3(0.780, 0.520, 0.120), // P
    vec3(0.880, 0.720, 0.180), // S
    vec3(0.220, 0.780, 0.180), // Cl
    vec3(0.120, 0.620, 0.880), // Ar
    vec3(0.980, 0.680, 0.080), // K
    vec3(0.760, 0.620, 0.420), // Ca
    vec3(0.320, 0.420, 0.760), // Sc
    vec3(0.220, 0.420, 0.780), // Ti
    vec3(0.180, 0.520, 0.820), // V
    vec3(0.180, 0.620, 0.820), // Cr
    vec3(0.220, 0.520, 0.720), // Mn
    vec3(0.320, 0.380, 0.620), // Fe
    vec3(0.220, 0.420, 0.620), // Co
    vec3(0.180, 0.520, 0.580), // Ni
    vec3(0.120, 0.720, 0.620), // Cu
    vec3(0.180, 0.620, 0.680), // Zn
    vec3(0.420, 0.520, 0.620), // Ga
    vec3(0.320, 0.420, 0.520), // Ge
    vec3(0.780, 0.420, 0.120), // As
    vec3(0.920, 0.720, 0.180), // Se
    vec3(0.220, 0.820, 0.220), // Br
    vec3(0.120, 0.820, 0.920), // Kr
    vec3(0.980, 0.620, 0.120), // Rb
    vec3(0.720, 0.620, 0.480), // Sr
    vec3(0.280, 0.420, 0.720), // Y
    vec3(0.220, 0.520, 0.820), // Zr
    vec3(0.180, 0.520, 0.920), // Nb
    vec3(0.180, 0.620, 0.920), // Mo
    vec3(0.220, 0.620, 0.820), // Tc
    vec3(0.320, 0.420, 0.720), // Ru
    vec3(0.220, 0.420, 0.720), // Rh
    vec3(0.180, 0.520, 0.720), // Pd
    vec3(0.120, 0.720, 0.820), // Ag
    vec3(0.180, 0.720, 0.920), // Cd
    vec3(0.520, 0.520, 0.620), // In
    vec3(0.420, 0.520, 0.620), // Sn
    vec3(0.820, 0.420, 0.120), // Sb
    vec3(0.920, 0.720, 0.220), // Te
    vec3(0.320, 0.820, 0.180), // I
    vec3(0.120, 0.720, 0.920), // Xe
    vec3(0.980, 0.580, 0.120), // Cs
    vec3(0.720, 0.620, 0.520), // Ba
    vec3(0.320, 0.420, 0.620), // La
    vec3(0.280, 0.420, 0.680), // Ce
    vec3(0.260, 0.420, 0.720), // Pr
    vec3(0.220, 0.420, 0.760), // Nd
    vec3(0.220, 0.380, 0.720), // Pm
    vec3(0.180, 0.420, 0.720), // Sm
    vec3(0.180, 0.320, 0.780), // Eu
    vec3(0.180, 0.420, 0.820), // Gd
    vec3(0.180, 0.520, 0.780), // Tb
    vec3(0.220, 0.620, 0.780), // Dy
    vec3(0.220, 0.520, 0.720), // Ho
    vec3(0.180, 0.520, 0.680), // Er
    vec3(0.180, 0.620, 0.680), // Tm
    vec3(0.220, 0.720, 0.720), // Yb
    vec3(0.320, 0.620, 0.720), // Lu
    vec3(0.220, 0.520, 0.820), // Hf
    vec3(0.180, 0.520, 0.920), // Ta
    vec3(0.180, 0.620, 0.980), // W
    vec3(0.220, 0.620, 0.920), // Re
    vec3(0.320, 0.420, 0.820), // Os
    vec3(0.220, 0.420, 0.820), // Ir
    vec3(0.180, 0.520, 0.820), // Pt
    vec3(0.120, 0.820, 0.620), // Au
    vec3(0.180, 0.720, 0.820), // Hg
    vec3(0.620, 0.520, 0.620), // Tl
    vec3(0.520, 0.520, 0.620), // Pb
    vec3(0.820, 0.420, 0.220), // Bi
    vec3(0.920, 0.620, 0.320), // Po
    vec3(0.320, 0.820, 0.320), // At
    vec3(0.120, 0.720, 0.820), // Rn
    vec3(0.980, 0.520, 0.180), // Fr
    vec3(0.720, 0.620, 0.580), // Ra
    vec3(0.320, 0.420, 0.720), // Ac
    vec3(0.280, 0.420, 0.780), // Th
    vec3(0.220, 0.420, 0.820), // Pa
    vec3(0.180, 0.420, 0.880), // U
    vec3(0.180, 0.320, 0.820), // Np
    vec3(0.180, 0.420, 0.780), // Pu
    vec3(0.220, 0.520, 0.780), // Am
    vec3(0.220, 0.620, 0.720), // Cm
    vec3(0.320, 0.520, 0.720), // Bk
    vec3(0.220, 0.420, 0.720), // Cf
    vec3(0.180, 0.520, 0.720), // Es
    vec3(0.180, 0.620, 0.720), // Fm
    vec3(0.220, 0.720, 0.720), // Md
    vec3(0.320, 0.620, 0.720), // No
    vec3(0.420, 0.620, 0.720), // Lr
    vec3(0.220, 0.520, 0.820), // Rf
    vec3(0.180, 0.520, 0.920), // Db
    vec3(0.180, 0.620, 0.980), // Sg
    vec3(0.220, 0.620, 0.920), // Bh
    vec3(0.320, 0.420, 0.820), // Hs
    vec3(0.220, 0.420, 0.820), // Mt
    vec3(0.180, 0.520, 0.820), // Ds
    vec3(0.120, 0.820, 0.720), // Rg
    vec3(0.180, 0.720, 0.820), // Cn
    vec3(0.620, 0.520, 0.720), // Nh
    vec3(0.520, 0.520, 0.720), // Fl
    vec3(0.820, 0.420, 0.320), // Mc
    vec3(0.920, 0.620, 0.420), // Lv
    vec3(0.320, 0.820, 0.420), // Ts
    vec3(0.120, 0.820, 0.920)  // Og
);

const vec3 ELEMENT_REAL[119] = vec3[](
    vec3(0.000, 0.000, 0.000), // Index 0
    vec3(1.000, 1.000, 1.000), // H  (1)
    vec3(0.851, 1.000, 1.000), // He (2)
    vec3(0.800, 0.502, 1.000), // Li (3)
    vec3(0.761, 1.000, 0.000), // Be (4)
    vec3(1.000, 0.710, 0.710), // B  (5)
    vec3(0.565, 0.565, 0.565), // C  (6)
    vec3(0.188, 0.314, 0.973), // N  (7)
    vec3(1.000, 0.051, 0.051), // O  (8)
    vec3(0.565, 0.878, 0.314), // F  (9)
    vec3(0.702, 0.890, 0.961), // Ne (10)
    vec3(0.671, 0.361, 0.949), // Na (11)
    vec3(0.541, 1.000, 0.000), // Mg (12)
    vec3(0.749, 0.651, 0.651), // Al (13)
    vec3(0.941, 0.784, 0.627), // Si (14)
    vec3(1.000, 0.502, 0.000), // P  (15)
    vec3(1.000, 1.000, 0.188), // S  (16)
    vec3(0.122, 0.941, 0.122), // Cl (17)
    vec3(0.502, 0.820, 0.890), // Ar (18)
    vec3(0.561, 0.251, 0.831), // K  (19)
    vec3(0.239, 1.000, 0.000), // Ca (20)
    vec3(0.902, 0.902, 0.902), // Sc (21)
    vec3(0.749, 0.761, 0.780), // Ti (22)
    vec3(0.651, 0.651, 0.671), // V  (23)
    vec3(0.541, 0.600, 0.780), // Cr (24)
    vec3(0.612, 0.478, 0.780), // Mn (25)
    vec3(0.878, 0.400, 0.200), // Fe (26)
    vec3(0.941, 0.565, 0.627), // Co (27)
    vec3(0.314, 0.816, 0.314), // Ni (28)
    vec3(0.784, 0.502, 0.200), // Cu (29)
    vec3(0.490, 0.502, 0.690), // Zn (30)
    vec3(0.761, 0.561, 0.561), // Ga (31)
    vec3(0.400, 0.561, 0.561), // Ge (32)
    vec3(0.741, 0.502, 0.890), // As (33)
    vec3(1.000, 0.631, 0.000), // Se (34)
    vec3(0.651, 0.161, 0.161), // Br (35)
    vec3(0.361, 0.722, 0.820), // Kr (36)
    vec3(0.439, 0.180, 0.690), // Rb (37)
    vec3(0.000, 1.000, 0.000), // Sr (38)
    vec3(0.580, 1.000, 1.000), // Y  (39)
    vec3(0.580, 0.878, 0.878), // Zr (40)
    vec3(0.451, 0.761, 0.788), // Nb (41)
    vec3(0.329, 0.710, 0.710), // Mo (42)
    vec3(0.231, 0.620, 0.620), // Tc (43)
    vec3(0.141, 0.561, 0.561), // Ru (44)
    vec3(0.039, 0.490, 0.549), // Rh (45)
    vec3(0.000, 0.412, 0.522), // Pd (46)
    vec3(0.753, 0.753, 0.753), // Ag (47)
    vec3(1.000, 0.851, 0.561), // Cd (48)
    vec3(0.651, 0.459, 0.451), // In (49)
    vec3(0.400, 0.502, 0.502), // Sn (50)
    vec3(0.620, 0.388, 0.710), // Sb (51)
    vec3(0.831, 0.478, 0.000), // Te (52)
    vec3(0.580, 0.000, 0.580), // I  (53)
    vec3(0.259, 0.620, 0.690), // Xe (54)
    vec3(0.341, 0.090, 0.561), // Cs (55)
    vec3(0.000, 0.788, 0.000), // Ba (56)
    vec3(0.439, 0.831, 1.000), // La (57)
    vec3(1.000, 1.000, 0.780), // Ce (58)
    vec3(0.851, 1.000, 0.780), // Pr (59)
    vec3(0.780, 1.000, 0.780), // Nd (60)
    vec3(0.639, 1.000, 0.780), // Pm (61)
    vec3(0.561, 1.000, 0.780), // Sm (62)
    vec3(0.380, 1.000, 0.780), // Eu (63)
    vec3(0.271, 1.000, 0.780), // Gd (64)
    vec3(0.188, 1.000, 0.780), // Tb (65)
    vec3(0.122, 1.000, 0.780), // Dy (66)
    vec3(0.000, 1.000, 0.612), // Ho (67)
    vec3(0.000, 0.902, 0.459), // Er (68)
    vec3(0.000, 0.831, 0.322), // Tm (69)
    vec3(0.000, 0.749, 0.220), // Yb (70)
    vec3(0.000, 0.671, 0.141), // Lu (71)
    vec3(0.302, 0.761, 1.000), // Hf (72)
    vec3(0.302, 0.651, 1.000), // Ta (73)
    vec3(0.129, 0.580, 0.839), // W  (74)
    vec3(0.149, 0.490, 0.671), // Re (75)
    vec3(0.149, 0.400, 0.588), // Os (76)
    vec3(0.090, 0.329, 0.529), // Ir (77)
    vec3(0.816, 0.816, 0.878), // Pt (78)
    vec3(1.000, 0.820, 0.137), // Au (79)
    vec3(0.722, 0.722, 0.816), // Hg (80)
    vec3(0.651, 0.329, 0.302), // Tl (81)
    vec3(0.341, 0.349, 0.380), // Pb (82)
    vec3(0.620, 0.310, 0.710), // Bi (83)
    vec3(0.671, 0.361, 0.000), // Po (84)
    vec3(0.459, 0.310, 0.271), // At (85)
    vec3(0.259, 0.510, 0.588), // Rn (86)
    vec3(0.259, 0.000, 0.400), // Fr (87)
    vec3(0.000, 0.490, 0.000), // Ra (88)
    vec3(0.439, 0.671, 0.980), // Ac (89)
    vec3(0.000, 0.729, 1.000), // Th (90)
    vec3(0.000, 0.631, 1.000), // Pa (91)
    vec3(0.000, 0.561, 1.000), // U  (92)
    vec3(0.000, 0.502, 1.000), // Np (93)
    vec3(0.000, 0.420, 1.000), // Pu (94)
    vec3(0.329, 0.361, 0.949), // Am (95)
    vec3(0.471, 0.361, 0.890), // Cm (96)
    vec3(0.541, 0.310, 0.890), // Bk (97)
    vec3(0.631, 0.212, 0.831), // Cf (98)
    vec3(0.702, 0.122, 0.831), // Es (99)
    vec3(0.702, 0.122, 0.729), // Fm (100)
    vec3(0.702, 0.051, 0.651), // Md (101)
    vec3(0.741, 0.051, 0.529), // No (102)
    vec3(0.780, 0.000, 0.400), // Lr (103)
    vec3(0.800, 0.000, 0.349), // Rf (104)
    vec3(0.820, 0.000, 0.310), // Db (105)
    vec3(0.851, 0.000, 0.271), // Sg (106)
    vec3(0.878, 0.000, 0.220), // Bh (107)
    vec3(0.902, 0.000, 0.180), // Hs (108)
    vec3(0.922, 0.000, 0.141), // Mt (109)
    vec3(0.941, 0.000, 0.122), // Ds (110)
    vec3(0.961, 0.000, 0.090), // Rg (111)
    vec3(0.980, 0.000, 0.051), // Cn (112)
    vec3(1.000, 0.120, 0.120), // Nh (113)
    vec3(1.000, 0.180, 0.180), // Fl (114)
    vec3(1.000, 0.239, 0.239), // Mc (115)
    vec3(1.000, 0.302, 0.302), // Lv (116)
    vec3(1.000, 0.361, 0.361), // Ts (117)
    vec3(1.000, 0.420, 0.420)  // Og (118)
);

// =========================================================================
// ESTADO CUÁNTICO GLOBAL
// =========================================================================
float a0 = 5.1;
float n  = 5.0;
float l  = 2.0;
float m  = 2.0;
float ms = 0.5;

float A  = 0.0;
float Y0 = 0.0;

// =========================================================================
// UTILIDADES DE BÚSQUEDA EN ARREGLOS POR RANGOS
// =========================================================================
// =========================================================================
// FILTRO PRINCIPAL DE RENDERIZADO
// =========================================================================
bool isElementEnabled(
    int id,
    float q_n,
    float q_l,
    float q_m,
    float q_s
){
    if (u_filter_active == 0)
        return true;

    // 1) Filtro por ID. El slider usa indices 0..117 y el ID real es 1..118.
    if (u_enable_id_filter == 1 && u_filter_id_end >= u_filter_id_start)
    {
        int minId = u_filter_id_start + 1;
        int maxId = u_filter_id_end + 1;
        if (id < minId || id > maxId)
            return false;
    }

    // 2) Filtro por l
    if (u_enable_l_filter == 1 && u_filter_l_end >= u_filter_l_start)
    {
        if (q_l < float(u_filter_l_start) || q_l > float(u_filter_l_end))
            return false;
    }

    // 3) Filtro por n
    if (u_enable_n_filter == 1 && u_filter_n_end >= u_filter_n_start)
    {
        if (q_n < float(u_filter_n_start) || q_n > float(u_filter_n_end))
            return false;
    }

    // 4) Filtro por spin
    if (u_enable_spin_filter == 1 && u_filter_spin_end >= u_filter_spin_start)
    {
        float targetSpin = (u_filter_spin_start == 0) ? 0.5 : -0.5;
        if (abs(q_s - targetSpin) > 0.001)
            return false;
    }

    // 5) Filtro por m
    if (u_enable_m_filter == 1 && u_filter_m_end >= u_filter_m_start)
    {
        if (q_m < float(u_filter_m_start) || q_m > float(u_filter_m_end))
            return false;
    }

    return true;
}

// =========================================================================
// FACTORIALES
// =========================================================================
const float FACT_LUT[15] = float[](
    1.0, 1.0, 2.0, 6.0, 24.0, 120.0, 720.0, 5040.0, 40320.0,
    362880.0, 3628800.0, 39916800.0, 479001600.0, 6227020800.0, 87178291200.0
);

float factorial(float n) {
    return FACT_LUT[clamp(int(n), 0, 14)];
}

float doubleFactorial(float n) {
    int in_n = int(n);
    if (in_n <= 0) return 1.0;
    // Precomputado para los límites de l y m esperados
    if (in_n == 1) return 1.0;
    if (in_n == 2) return 2.0;
    if (in_n == 3) return 3.0;
    if (in_n == 4) return 8.0;
    if (in_n == 5) return 15.0;
    if (in_n == 6) return 48.0;
    if (in_n == 7) return 105.0;

    float res = 1.0;
    for (float i = n; i > 1.0; i -= 2.0) res *= i;
    return res;
}

float stableFactorialRatio(float l, float m) {
    float am = abs(m);
    if (am > l) return 0.0;
    float res = 1.0;
    for (float i = max(l - am + 1.0, 2.0); i <= l + am; i += 1.0)
        res *= i;
    return (m < 0.0) ? res : 1.0 / res;
}

// =========================================================================
// POLINOMIO DE LAGUERRE ASOCIADO
// =========================================================================
float associatedLaguerrePolynomial(float x, float s, float k) {
    if (s <= 0.0) return 1.0;
    float lp1 = 1.0;
    float lp2 = 1.0 - x + k;
    for (float i = 1.0; i < s; i += 1.0) {
        float lp = ((2.0 * i + k + 1.0 - x) * lp2 - (i + k) * lp1) / (i + 1.0);
        lp1 = lp2;
        lp2 = lp;
    }
    return lp2;
}

// =========================================================================
// POLINOMIOS ASOCIADOS DE LEGENDRE
// =========================================================================
float associatedLegendrePolynomials(float x, float l, float m) {
    float am = abs(m);
    if (l < am) return 0.0;
    if (l == 0.0) return 1.0;

    float mul = m >= 0.0 ? 1.0 : (mod(-m, 2.0) * 2.0 - 1.0) * stableFactorialRatio(l, m);

    float lp1 = 0.0;
    float lp2 = (mod(-am, 2.0) * 2.0 - 1.0) * doubleFactorial(2.0 * am - 1.0) * pow(max(1.0 - x * x, 1e-7), am / 2.0);

    for (float i = am + 1.0; i <= l; i += 1.0) {
        float lp = (x * (2.0 * i - 1.0) * lp2 - (i + am - 1.0) * lp1) / (i - am);
        lp1 = lp2;
        lp2 = lp;
    }
    return lp2 / mul;
}

float calcRadialPart(float r) {
    float B = pow(2.0 * r / (n * a0), l);
    float C = associatedLaguerrePolynomial(2.0 * r / (n * a0), n - l - 1.0, 2.0 * l + 1.0);
    float E = exp(-(r / (n * a0)));
    return A * B * C * E;
}

float calcAngularPart(float cosang) {
    float pml = associatedLegendrePolynomials(cosang, l, m);
    return Y0 * pml;
}

float calcAzimuthalPart(float fai) {
    if (m == 0.0) return 1.0;
    // GPU es más rápida multiplicando que llamando a abs() y ramificando innecesariamente
    return (m > 0.0) ? cos(m * fai) : sin(-m * fai);
}

// =========================================================================
// CÁLCULO DE COLOR
// =========================================================================
bool calculateColor(vec3 p, inout vec3 accumulatedColor, inout float accumulatedDensity, int id) {
    float r = length(p);
    if (r < 1e-4) return false;

    vec3 v = p / r;
    vec2 xz = vec2(0.0);
    if (length(p.xz) > 1e-4) {
        xz = normalize(p.xz);
    }

    float R = calcRadialPart(r);
    float Y = calcAngularPart(v.y);

    float fai = atan(-xz.y, xz.x);
    float F = calcAzimuthalPart(fai);

    float psi = R * Y * F;
    float psi_magnitude_sq = psi * psi;

    float density = psi_magnitude_sq * ELECTRON_DENSITY;

    if (density > 0.002) {
        vec3 sampleColor;

        if (u_color_mode == 1) {
            // Se usa el color de la tabla visible basado en el ID
            sampleColor = ELEMENT_VISIBLE[id];
            if (psi < 0.0) sampleColor *= 0.5;
        } else if (u_color_mode == 2) {
            // Se usa el color de la tabla de absorción basado en el ID
            sampleColor = ELEMENT_ABSORPTION[id];
            if (psi < 0.0) sampleColor *= 0.5;
        } else if (u_color_mode == 3) {
            // Se usa el color basado en el aspecto macroscópico del mundo real
            sampleColor = ELEMENT_REAL[id];
            if (psi < 0.0) sampleColor *= 0.5;
        } else {
            // Lógica original de color por espín y fase
            vec3 posCol = (ms > 0.0) ? POS_COL_UP : POS_COL_DN;
            vec3 negCol = (ms > 0.0) ? NEG_COL_UP : NEG_COL_DN;
            sampleColor = (psi >= 0.0) ? posCol : negCol;
        }

        accumulatedColor += sampleColor * density * 0.05;
        accumulatedDensity += density * 0.05;
    }

    if (accumulatedDensity >= 1.0) {
        accumulatedDensity = 1.0;
        return true;
    }

    return false;
}

// =========================================================================
// INTERSECCIÓN RAYO-ESFERA
// =========================================================================
bool raySphereIntersect(vec3 ro, vec3 rd, vec3 center, float radius, out float t0, out float t1) {
    vec3 oc = ro - center;
    float b = dot(oc, rd);
    float c = dot(oc, oc) - radius * radius;
    float h = b*b - c;
    if (h < 0.0) return false;
    h = sqrt(h);
    t0 = -b - h;
    t1 = -b + h;
    return true;
}

// =========================================================================
// BASE DE DATOS PROCEDIMENTAL DE NÚMEROS CUÁNTICOS
// =========================================================================
void getElementQuantum(
    int id,
    out float q_n,
    out float q_l,
    out float q_m,
    out float q_s
){
    const int ORBITAL_COUNT = 19;

    int orbitN[ORBITAL_COUNT] = int[](
        1,2,2,3,3,4,3,4,5,4,
        5,6,4,5,6,7,5,6,7
    );

    int orbitL[ORBITAL_COUNT] = int[](
        0,0,1,0,1,0,2,1,0,2,
        1,0,3,2,1,0,3,2,1
    );

    int orbitCap[ORBITAL_COUNT] = int[](
        2,2,6,2,6,2,10,6,2,10,
        6,2,14,10,6,2,14,10,6
    );

    if(u_layout_mode==0){
        if (id == 57) {
            q_n = 5.0;
            q_l = 2.0;
            q_m = -2.0;
            q_s = 0.5;
            return;
        }

        if (id == 89) {
            q_n = 6.0;
            q_l = 2.0;
            q_m = -2.0;
            q_s = 0.5;
            return;
        }

        // Correcciones especiales
        if(id >= 58 && id <= 71)
            id--;

        if(id >= 90 && id <= 103)
            id--;
    }

    int e = id;

    q_n = 1.0;
    q_l = 0.0;
    q_m = 0.0;
    q_s = 0.5;

    for(int i = 0; i < ORBITAL_COUNT; i++)
    {
        if(e > orbitCap[i])
        {
            e -= orbitCap[i];
            continue;
        }

        int nn = orbitN[i];
        int ll = orbitL[i];

        int orbitalCount = 2 * ll + 1;
        int ml_index = (e - 1) % orbitalCount;
        int spinPhase = (e - 1) / orbitalCount;

        q_n = float(nn);
        q_l = float(ll);
        q_m = float(ml_index - ll);
        q_s = (spinPhase == 0) ? 0.5 : -0.5;
        return;
    }
}

// =========================================================================
// POSICIÓN SEGÚN DISTRIBUCIÓN
// =========================================================================
vec3 getElementCenter(int id, float q_n, float q_l, float q_m, float q_s) {
    if (u_layout_mode == 0) {
        float row = 1.0;
        float col = 1.0;

        if (id == 1)       { row = 1.0; col = 1.0; }
        else if (id == 2)  { row = 1.0; col = 18.0; }
        else if (id <= 4)  { row = 2.0; col = float(id - 3 + 1); }
        else if (id <= 10) { row = 2.0; col = float(id - 5 + 13); }
        else if (id <= 12) { row = 3.0; col = float(id - 11 + 1); }
        else if (id <= 18) { row = 3.0; col = float(id - 13 + 13); }
        else if (id <= 36) { row = 4.0; col = float(id - 19 + 1); }
        else if (id <= 54) { row = 5.0; col = float(id - 37 + 1); }
        else if (id <= 56) { row = 6.0; col = float(id - 55 + 1); }
        else if (id == 57) { row = 6.0; col = 3.0; }
        else if (id <= 71) { row = 8.0; col = float(id - 58 + 4); }
        else if (id <= 86) { row = 6.0; col = float(id - 72 + 4); }
        else if (id <= 88) { row = 7.0; col = float(id - 87 + 1); }
        else if (id == 89) { row = 7.0; col = 3.0; }
        else if (id <= 103){ row = 9.0; col = float(id - 90 + 4); }
        else if (id <= 118){ row = 7.0; col = float(id - 104 + 4); }

        float posX = (col - 9.5) * GRID_SCALE_X;
        float posY = (4.0 - row) * GRID_SCALE_Y;

        if (row >= 8.0) posY -= 0.4;

        return vec3(posX, posY, 0.0);
    }
    else {
        float posX = q_m * QUANT_SCALE;
        float posY = (q_n - 4.0) * QUANT_SCALE;
        float posZ = (q_l - 1.5) * QUANT_SCALE;
        posX += q_s * 0.15;
        return vec3(posX, posY, posZ);
    }
}

// =========================================================================
// MAIN
// =========================================================================
void main() {
    vec2 fragCoord = gl_FragCoord.xy;
 vec2 pp = (-u_resolution.xy + 2.0 * fragCoord.xy) / u_resolution.y;

    float eyer = (u_layout_mode == 0) ? CAM_DIST_GRID : CAM_DIST_QUANT;

    // Cámara con rotación base en el tiempo
    float eyea = u_time * CAM_AUTO_SPEED;
    float eyef = 1.5708;

    vec2 mouse = u_mouse.xy / u_resolution.xy;

    if(length(u_mouse.xy) > 10.0)
    {
        eyea += (mouse.x - 0.5) * CAM_MOUSE_SENS * 0.40;
        eyef += (mouse.y - 0.5) * CAM_MOUSE_SENS * 0.20;
    }

    eyef = clamp(eyef, 0.1, 3.04);

    vec3 cam = vec3(
        eyer * sin(eyea) * sin(eyef),
        eyer * cos(eyef) + CAM_Y_OFFSET,
        eyer * cos(eyea) * sin(eyef)
    );

    vec3 target = vec3(0.0, CAM_Y_OFFSET, 0.0);

    vec3 front = normalize(target - cam);
    vec3 left = normalize(cross(vec3(0.0, 1.0, 0.0), front));
    vec3 up = normalize(cross(front, left));
    vec3 v = normalize(front * 1.85 + left * pp.x + up * pp.y);

    vec3 finalColor = vec3(0.0);
    float densityAccum = 0.0;

    for(int id = 1; id <= 118; id++)
    {
        float q_n, q_l, q_m, q_s;
        getElementQuantum(id, q_n, q_l, q_m, q_s);

        if (!isElementEnabled(id, q_n, q_l, q_m, q_s))
            continue;

        vec3 center = getElementCenter(id, q_n, q_l, q_m, q_s);

        float t0, t1;
        if (raySphereIntersect(cam, v, center, ATOM_BOUNDING_R, t0, t1))
        {
            t0 = max(t0, 0.0);

            n  = q_n;
            l  = q_l;
            m  = q_m;
            ms = q_s;

            A = sqrt(
                pow(2.0 / (n * a0), 3.0) *
                (factorial(n - l - 1.0) / (2.0 * n * factorial(n + l)))
            );

            float m_factor = (m == 0.0) ? 1.0 : 2.0;
            Y0 = sqrt(
                ((2.0 * l + 1.0) / (4.0 * 3.14159265359)) *
                stableFactorialRatio(l, m) *
                m_factor
            );

            for(float t = t0; t < t1; t += WAVE_STEP_SIZE)
            {
                vec3 p_world = cam + v * t;
                vec3 p_local = p_world - center;

                float mSign = (q_m == 0.0) ? 1.0 : sign(q_m);

                if (u_layout_mode == 1)
                {
                    ROTATE(
                        p_local.xz,
                        mSign * q_s * 2.0 * u_time
                    );
                }
                else
                {
                    ROTATE(
                        p_local.xz,
                        mSign * sign(q_s) * 0.7 * u_time
                    );
                }

                if (calculateColor(p_local * 380.0, finalColor, densityAccum, id))
                {
                    break;
                }
            }
        }
    }

    vec3 background = vec3(0.008, 0.008, 0.015) * (1.0 - densityAccum);
    finalColor = 1.0 - exp(-finalColor * 1.6);

    gl_FragColor = vec4(finalColor + background, 1.0);
}     
`;

export { vertexShader, fragmentShader };
