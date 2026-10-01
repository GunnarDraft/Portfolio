const vertexShader = /*glsl*/\`
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
\`;

const fragmentShader = /*glsl*/\`
precision highp float;
precision highp int;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform sampler2D u_mode_texture;
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

#define MODE_TEXTURE_WIDTH 8.0
#define MODE_TEXTURE_HEIGHT 119.0

#define CAM_Y_OFFSET -0.90
#define CAM_DIST_GRID 9.5
#define CAM_DIST_QUANT 5.5
#define CAM_MOUSE_SENS 3.1416
#define GRID_SCALE_X 0.85
#define GRID_SCALE_Y 0.85
#define QUANT_SCALE 0.75
#define ATOM_BOUNDING_R 0.40

// Visual scale: the local ray-march coordinate is converted to atomic units (bohr).
#define BOHR_SCALE 380.0
#define ELECTRON_DENSITY 12000000.0
#define WAVE_STEP_SIZE 0.03

vec4 modeTex(int id, int slot) {
    float x = (float(slot) + 0.5) / MODE_TEXTURE_WIDTH;
    float y = (float(id) + 0.5) / MODE_TEXTURE_HEIGHT;
    return texture2D(u_mode_texture, vec2(x, y));
}

void getMode(int id, out float qn, out float ql, out float qm, out float qs,
            out float zeff, out float norm) {
    vec4 a = modeTex(id, 0);
    vec4 b = modeTex(id, 1);
    qn = a.x; ql = a.y; qm = a.z; qs = a.w;
    zeff = b.x; norm = b.y;
}

bool isElementEnabled(int id, float qn, float ql, float qm, float qs) {
    if (u_filter_active == 0) return true;

    if (u_enable_id_filter == 1 && u_filter_id_end >= u_filter_id_start) {
        int minId = u_filter_id_start + 1;
        int maxId = u_filter_id_end + 1;
        if (id < minId || id > maxId) return false;
    }
    if (u_enable_l_filter == 1 && u_filter_l_end >= u_filter_l_start) {
        if (ql < float(u_filter_l_start) || ql > float(u_filter_l_end)) return false;
    }
    if (u_enable_n_filter == 1 && u_filter_n_end >= u_filter_n_start) {
        if (qn < float(u_filter_n_start) || qn > float(u_filter_n_end)) return false;
    }
    if (u_enable_spin_filter == 1 && u_filter_spin_end >= u_filter_spin_start) {
        float targetSpin = (u_filter_spin_start == 0) ? 0.5 : -0.5;
        if (abs(qs - targetSpin) > 0.001) return false;
    }
    if (u_enable_m_filter == 1 && u_filter_m_end >= u_filter_m_start) {
        if (qm < float(u_filter_m_start) || qm > float(u_filter_m_end)) return false;
    }
    return true;
}

float ipow(float x, float p) {
    return pow(max(x, 0.0), p);
}

float polynomial7(float x, vec4 c0, vec3 c1) {
    return c0.x + x * (c0.y + x * (c0.z + x * (c0.w + x * (c1.x + x * (c1.y + x * c1.z)))));
}

float orbitalAmplitude(vec3 p, int id, out float signedAmplitude, out float qs) {
    float n, l, m, spin, zeff, norm;
    getMode(id, n, l, m, spin, zeff, norm);
    qs = spin;

    float r = length(p);
    if (r < 1e-7) {
        signedAmplitude = 0.0;
        return 0.0;
    }

    vec3 v = p / r;
    float ct = clamp(v.y, -1.0, 1.0);
    float st = sqrt(max(0.0, 1.0 - ct * ct));
    float phi = atan(-p.z, p.x);
    float am = abs(m);

    vec4 lag0 = modeTex(id, 2);
    vec4 lag1 = modeTex(id, 3);
    vec4 leg0 = modeTex(id, 3);
    vec4 leg1 = modeTex(id, 4);

    float lag = polynomial7(2.0 * r * zeff / n, lag0, lag1.xyz);
    float leg = polynomial7(ct, vec4(leg0.w, leg1.x, leg1.y, leg1.z), vec3(leg1.w, 0.0, 0.0));

    float rho = 2.0 * r * zeff / n;
    float radial = norm * exp(-0.5 * rho) * ipow(rho, l) * lag;
    float angular = ipow(st, am) * leg;

    float azimuth;
    if (m == 0.0) azimuth = 1.0;
    else if (m > 0.0) azimuth = cos(m * phi);
    else azimuth = sin(-m * phi);

    float psi = radial * angular * azimuth;
    signedAmplitude = psi;
    return psi * psi;
}

vec3 getElementCenter(int id, float qn, float ql, float qm, float qs) {
    if (u_layout_mode == 0) {
        float row = 1.0;
        float col = 1.0;

        if (id == 1)       { row = 1.0; col = 1.0; }
        else if (id == 2)  { row = 1.0; col = 18.0; }
        else if (id <= 4)  { row = 2.0; col = float(id - 2); }
        else if (id <= 10) { row = 2.0; col = float(id + 8); }
        else if (id <= 12) { row = 3.0; col = float(id - 10); }
        else if (id <= 18) { row = 3.0; col = float(id + 6); }
        else if (id <= 36) { row = 4.0; col = float(id - 18); }
        else if (id <= 54) { row = 5.0; col = float(id - 36); }
        else if (id <= 56) { row = 6.0; col = float(id - 54); }
        else if (id == 57) { row = 6.0; col = 3.0; }
        else if (id <= 71) { row = 8.0; col = float(id - 54); }
        else if (id <= 86) { row = 6.0; col = float(id - 68); }
        else if (id <= 88) { row = 7.0; col = float(id - 86); }
        else if (id == 89) { row = 7.0; col = 3.0; }
        else if (id <= 103){ row = 9.0; col = float(id - 86); }
        else if (id <= 118){ row = 7.0; col = float(id - 100); }

        float posX = (col - 9.5) * GRID_SCALE_X;
        float posY = (4.0 - row) * GRID_SCALE_Y;
        if (row >= 8.0) posY -= 0.4;
        return vec3(posX, posY, 0.0);
    }

    float posX = qm * QUANT_SCALE;
    float posY = (4.0 - qn) * QUANT_SCALE;
    float posZ = (ql - 1.5) * QUANT_SCALE;
    posY -= 1.0;
    posX += qs * 0.15;
    return vec3(posX, posY, posZ);
}

vec3 colorFor(int id, float psi) {
    vec4 c5 = modeTex(id, 5);
    vec4 c6 = modeTex(id, 6);
    vec4 c7 = modeTex(id, 7);

    vec3 visible = vec3(c5.z, c5.w, c6.x);
    vec3 absorption = vec3(c6.y, c6.z, c6.w);
    vec3 real = c7.rgb;

    if (u_color_mode == 1) return visible * (psi < 0.0 ? 0.5 : 1.0);
    if (u_color_mode == 2) return absorption * (psi < 0.0 ? 0.5 : 1.0);
    if (u_color_mode == 3) return real * (psi < 0.0 ? 0.5 : 1.0);

    float spin = modeTex(id, 0).w;
    vec3 posCol = spin > 0.0 ? vec3(1.0,0.0,1.0) : vec3(1.0,0.5,0.0);
    vec3 negCol = spin > 0.0 ? vec3(0.0,1.0,1.0) : vec3(0.0,1.0,0.5);
    return psi >= 0.0 ? posCol : negCol;
}

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

void main() {
    vec2 pp = (-u_resolution.xy + 2.0 * gl_FragCoord.xy) / u_resolution.y;
    float eyeRadius = (u_layout_mode == 0) ? CAM_DIST_GRID : CAM_DIST_QUANT;

    float eyea = 3.14159;
    float eyef = 1.5708;
    vec2 mouse = u_mouse / u_resolution;

    if (dot(u_mouse, u_mouse) > 100.0) {
        eyea += (mouse.x - 0.5) * CAM_MOUSE_SENS * 0.40;
        eyef += (mouse.y - 0.5) * CAM_MOUSE_SENS * 0.20;
    }
    eyef = clamp(eyef, 0.1, 3.04);

    vec3 cam = vec3(
        eyeRadius * sin(eyea) * sin(eyef),
        eyeRadius * cos(eyef) + CAM_Y_OFFSET,
        eyeRadius * cos(eyea) * sin(eyef)
    );

    vec3 target = vec3(0.0, CAM_Y_OFFSET, 0.0);
    vec3 front = normalize(target - cam);
    vec3 left = normalize(cross(vec3(0.0,1.0,0.0), front));
    vec3 up = normalize(cross(front, left));
    vec3 ray = normalize(front * 1.85 + left * pp.x + up * pp.y);

    vec3 finalColor = vec3(0.0);
    float densityAccum = 0.0;

    for (int id = 1; id <= 118; id++) {
        float qn, ql, qm, qs;
        getMode(id, qn, ql, qm, qs, qn, qn);

        if (!isElementEnabled(id, qn, ql, qm, qs)) continue;

        vec3 center = getElementCenter(id, qn, ql, qm, qs);

        float t0, t1;
        if (!raySphereIntersect(cam, ray, center, ATOM_BOUNDING_R, t0, t1)) continue;
        t0 = max(t0, 0.0);

        float rotAngle = (qm == 0.0 ? 1.0 : sign(qm)) *
                         (u_layout_mode == 1 ? qs * 2.0 : sign(qs) * 0.7) * u_time;
        float rc = cos(rotAngle), rs = sin(rotAngle);

        for (float t = t0; t < t1; t += WAVE_STEP_SIZE) {
            vec3 p = cam + ray * t - center;

            float px = p.x, pz = p.z;
            p.x = rc * px + rs * pz;
            p.z = rc * pz - rs * px;

            float psi, spin;
            float density = orbitalAmplitude(p * BOHR_SCALE, id, psi, spin) * ELECTRON_DENSITY;

            if (density > 0.002) {
                vec3 sampleColor = colorFor(id, psi);
                finalColor += sampleColor * density * 0.05;
                densityAccum += density * 0.05;
            }
            if (densityAccum >= 1.0) break;
        }
        if (densityAccum >= 1.0) break;
    }

    vec3 background = vec3(0.008,0.008,0.015) * (1.0 - min(densityAccum,1.0));
    finalColor = 1.0 - exp(-finalColor * 1.6);
    gl_FragColor = vec4(finalColor + background, 1.0);
}
\`;

export { vertexShader, fragmentShader };
