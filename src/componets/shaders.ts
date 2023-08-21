const vertexShader = /*glsl*/`
void main() { 

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}

`


const matrixFragmentShader = /*glsl*/`
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution; 
varying vec3 vPosition;



 const int ITERATIONS = 40;   //use less value if you need more performance
const float SPEED = 1.;

const float STRIP_CHARS_MIN =  7.;
const float STRIP_CHARS_MAX = 40.;
const float STRIP_CHAR_HEIGHT = 0.15;
const float STRIP_CHAR_WIDTH = 0.10;
const float ZCELL_SIZE = 1. * (STRIP_CHAR_HEIGHT * STRIP_CHARS_MAX);  //the multiplier can't be less than 1.
const float XYCELL_SIZE = 12. * STRIP_CHAR_WIDTH;  //the multiplier can't be less than 1.

const int BLOCK_SIZE = 10;  //in cells
const int BLOCK_GAP = 2;    //in cells

const float WALK_SPEED = 1. * XYCELL_SIZE;
const float BLOCKS_BEFORE_TURN = 3.;


const float PI = 3.14159265359;


//        ----  random  ----

float hash(float v) {
    return fract(sin(v)*43758.5453123);
}

float hash(vec2 v) {
    return hash(dot(v, vec2(5.3983, 5.4427)));
}

vec2 hash2(vec2 v)
{
    v = vec2(v * mat2(127.1, 311.7,  269.5, 183.3));
	return fract(sin(v)*43758.5453123);
}

vec4 hash4(vec2 v)
{
    vec4 p = vec4(v * mat4x2( 127.1, 311.7,
                              269.5, 183.3,
                              113.5, 271.9,
                              246.1, 124.6 ));
    return fract(sin(p)*43758.5453123);
}

vec4 hash4(vec3 v)
{
    vec4 p = vec4(v * mat4x3( 127.1, 311.7, 74.7,
                              269.5, 183.3, 246.1,
                              113.5, 271.9, 124.6,
                              271.9, 269.5, 311.7 ) );
    return fract(sin(p)*43758.5453123);
}


//        ----  symbols  ----
//  Slightly modified version of "runes" by FabriceNeyret2 -  https://www.shadertoy.com/view/4ltyDM
//  Which is based on "runes" by otaviogood -  https://shadertoy.com/view/MsXSRn

float rune_line(vec2 p, vec2 a, vec2 b) {   // from https://www.shadertoy.com/view/4dcfW8
    p -= a, b -= a;
	float h = clamp(dot(p, b) / dot(b, b), 0., 1.);   // proj coord on line
	return length(p - b * h);                         // dist to segment
}

float rune(vec2 U, vec2 seed, float highlight)
{
	float d = 1e5;
	for (int i = 0; i < 4; i++)	// number of strokes
	{
        vec4 pos = hash4(seed);
		seed += 1.;

		// each rune touches the edge of its box on all 4 sides
		if (i == 0) pos.y = .0;
		if (i == 1) pos.x = .999;
		if (i == 2) pos.x = .0;
		if (i == 3) pos.y = .999;
		// snap the random line endpoints to a grid 2x3
		vec4 snaps = vec4(2, 3, 2, 3);
		pos = ( floor(pos * snaps) + .5) / snaps;

		if (pos.xy != pos.zw)  //filter out single points (when start and end are the same)
		    d = min(d, rune_line(U, pos.xy, pos.zw + .001) ); // closest line
	}
	return smoothstep(0.1, 0., d) + highlight*smoothstep(0.4, 0., d);
}

float random_char(vec2 outer, vec2 inner, float highlight) {
    vec2 seed = vec2(dot(outer, vec2(269.5, 183.3)), dot(outer, vec2(113.5, 271.9)));
    return rune(inner, seed, highlight);
}


//        ----  digital rain  ----

// xy - horizontal, z - vertical
vec3 rain(vec3 ro3, vec3 rd3, float time) {
    vec4 result = vec4(0.);

    // normalized 2d projection
    vec2 ro2 = vec2(ro3);
    vec2 rd2 = normalize(vec2(rd3));
 
    bool prefer_dx = abs(rd2.x) > abs(rd2.y);
    float t3_to_t2 = prefer_dx ? rd3.x / rd2.x : rd3.y / rd2.y;

    // at first, horizontal space (xy) is divided into cells (which are columns in 3D)
    // then each xy-cell is divided into vertical cells (along z) - each of these cells contains one raindrop

    ivec3 cell_side = ivec3(step(0., rd3));      //for positive rd.x use cell side with higher x (1) as the next side, for negative - with lower x (0), the same for y and z
    ivec3 cell_shift = ivec3(sign(rd3));         //shift to move to the next cell

    //  move through xy-cells in the ray direction
    float t2 = 0.;  // the ray formula is: ro2 + rd2 * t2, where t2 is positive as the ray has a direction.
    ivec2 next_cell = ivec2(floor(ro2/XYCELL_SIZE));  //first cell index where ray origin is located
    for (int i=0; i<ITERATIONS; i++) {
        ivec2 cell = next_cell;  //save cell value before changing
        float t2s = t2;          //and t

        //  find the intersection with the nearest side of the current xy-cell (since we know the direction, we only need to check one vertical side and one horizontal side)
        vec2 side = vec2(next_cell + cell_side.xy) * XYCELL_SIZE;  //side.x is x coord of the y-axis side, side.y - y of the x-axis side
        vec2 t2_side = (side - ro2) / rd2;  // t2_side.x and t2_side.y are two candidates for the next value of t2, we need the nearest
        if (t2_side.x < t2_side.y) {
            t2 = t2_side.x;
            next_cell.x += cell_shift.x;  //cross through the y-axis side
        } else {
            t2 = t2_side.y;
            next_cell.y += cell_shift.y;  //cross through the x-axis side
        }
        //now t2 is the value of the end point in the current cell (and the same point is the start value in the next cell)

        //  gap cells
        vec2 cell_in_block = fract(vec2(cell) / float(BLOCK_SIZE));
        float gap = float(BLOCK_GAP) / float(BLOCK_SIZE);
        if (cell_in_block.x < gap || cell_in_block.y < gap || (cell_in_block.x < (gap+0.1) && cell_in_block.y < (gap+0.1))) {
            continue;
        }

        //  return to 3d - we have start and end points of the ray segment inside the column (t3s and t3e)
        float t3s = t2s / t3_to_t2;

        //  move through z-cells of the current column in the ray direction (don't need much to check, two nearest cells are enough)
        float pos_z = ro3.z + rd3.z * t3s;
        float xycell_hash = hash(vec2(cell));
        float z_shift = xycell_hash*11. - time * (0.5 + xycell_hash * 1.0 + xycell_hash * xycell_hash * 1.0 + pow(xycell_hash, 16.) * 3.0);  //a different z shift for each xy column
        float char_z_shift = floor(z_shift / STRIP_CHAR_HEIGHT);
        z_shift = char_z_shift * STRIP_CHAR_HEIGHT;
        int zcell = int(floor((pos_z - z_shift)/ZCELL_SIZE));  //z-cell index
        for (int j=0; j<2; j++) {  //2 iterations is enough if camera doesn't look much up or down
            //  calcaulate coordinates of the target (raindrop)
            vec4 cell_hash = hash4(vec3(ivec3(cell, zcell)));
            vec4 cell_hash2 = fract(cell_hash * vec4(127.1, 311.7, 271.9, 124.6));

            float chars_count = cell_hash.w * (STRIP_CHARS_MAX - STRIP_CHARS_MIN) + STRIP_CHARS_MIN;
            float target_length = chars_count * STRIP_CHAR_HEIGHT;
            float target_rad = STRIP_CHAR_WIDTH / 2.;
            float target_z = (float(zcell)*ZCELL_SIZE + z_shift) + cell_hash.z * (ZCELL_SIZE - target_length);
            vec2 target = vec2(cell) * XYCELL_SIZE + target_rad + cell_hash.xy * (XYCELL_SIZE - target_rad*2.);

            //  We have a line segment (t0,t). Now calculate the distance between line segment and cell target (it's easier in 2d)
            vec2 s = target - ro2;
            float tmin = dot(s, rd2);  //tmin - point with minimal distance to target
            if (tmin >= t2s && tmin <= t2) {
                float u = s.x * rd2.y - s.y * rd2.x;  //horizontal coord in the matrix strip
                if (abs(u) < target_rad) {
                    u = (u/target_rad + 1.) / 2.;
                    float z = ro3.z + rd3.z * tmin/t3_to_t2;
                    float v = (z - target_z) / target_length;  //vertical coord in the matrix strip
                    if (v >= 0.0 && v < 1.0) {
                        float c = floor(v * chars_count);  //symbol index relative to the start of the strip, with addition of char_z_shift it becomes an index relative to the whole cell
                        float q = fract(v * chars_count);
                        vec2 char_hash = hash2(vec2(c+char_z_shift, cell_hash2.x));
                        if (char_hash.x >= 0.1 || c == 0.) {  //10% of missed symbols
                            float time_factor = floor(c == 0. ? time*5.0 :  //first symbol is changed fast
                                    time*(1.0*cell_hash2.z +   //strips are changed sometime with different speed
                                            cell_hash2.w*cell_hash2.w*4.*pow(char_hash.y, 4.)));  //some symbols in some strips are changed relatively often
                            float a = random_char(vec2(char_hash.x, time_factor), vec2(u,q), max(1., 3. - c/2.)*0.2);  //alpha
                            a *= clamp((chars_count - 0.5 - c) / 2., 0., 1.);  //tail fade
                            if (a > 0.) {
                                float attenuation = 1. + pow(0.06*tmin/t3_to_t2, 2.);
                                vec3 col = (c == 0. ? vec3(0.67, 1.0, 0.82) : vec3(0.25, 0.80, 0.40)) / attenuation;
                                float a1 = result.a;
                                result.a = a1 + (1. - a1) * a;
                                result.xyz = (result.xyz * a1 + col * (1. - a1) * a) / result.a;
                                if (result.a > 0.98)  return result.xyz;
                            }
                        }
                    }
                }
            }
            // not found in this cell - go to next vertical cell
            zcell += cell_shift.z;
        }
        // go to next horizontal cell
    }

    return result.xyz * result.a;
}


//        ----  main, camera  ----

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
	float c = cos(a);
    mat2 m = mat2(c, -s, s, c);
    return m * v;
}

vec3 rotateX(vec3 v, float a) {
    float s = sin(a);
    float c = cos(a);
    return mat3(1.,0.,0.,0.,c,-s,0.,s,c) * v;
}

vec3 rotateY(vec3 v, float a) {
    float s = sin(a);
    float c = cos(a);
    return mat3(c,0.,-s,0.,1.,0.,s,0.,c) * v;
}

vec3 rotateZ(vec3 v, float a) {
    float s = sin(a);
    float c = cos(a);
    return mat3(c,-s,0.,s,c,0.,0.,0.,1.) * v;
}

float smoothstep1(float x) {
    return smoothstep(0., 1., x);
}

void main( )
{
    if (STRIP_CHAR_WIDTH > XYCELL_SIZE || STRIP_CHAR_HEIGHT * STRIP_CHARS_MAX > ZCELL_SIZE) {
        // error
        gl_FragColor = vec4(1., 0., 0., 1.);
        return;
    }

	vec2 uv = (gl_FragCoord.xy * 2. - u_resolution.xy) / u_resolution.y;

    float time = u_time * SPEED;

    const float turn_rad = 0.25 / BLOCKS_BEFORE_TURN;   //0 .. 0.5
    const float turn_abs_time = (PI/2.*turn_rad) * 1.5;  //multiplier different than 1 means a slow down on turns
    const float turn_time = turn_abs_time / (1. - 2.*turn_rad + turn_abs_time);  //0..1, but should be <= 0.5

    float level1_size = float(BLOCK_SIZE) * BLOCKS_BEFORE_TURN * XYCELL_SIZE;
    float level2_size = 4. * level1_size;
    float gap_size = float(BLOCK_GAP) * XYCELL_SIZE;

    vec3 ro = vec3(gap_size/2., gap_size/2., 0.);
    vec3 rd = vec3(uv.x, 2.0, uv.y);

    float tq = fract(time / (level2_size*4.) * WALK_SPEED);  //the whole cycle time counter
    float t8 = fract(tq*4.);  //time counter while walking on one of the four big sides
    float t1 = fract(t8*8.);  //time counter while walking on one of the eight sides of the big side

    vec2 prev;
    vec2 dir;
    if (tq < 0.25) {
        prev = vec2(0.,0.);
        dir = vec2(0.,1.);
    } else if (tq < 0.5) {
        prev = vec2(0.,1.);
        dir = vec2(1.,0.);
    } else if (tq < 0.75) {
        prev = vec2(1.,1.);
        dir = vec2(0.,-1.);
    } else {
        prev = vec2(1.,0.);
        dir = vec2(-1.,0.);
    }
    float angle = floor(tq * 4.);  //0..4 wich means 0..2*PI

    prev *= 4.;

    const float first_turn_look_angle = 0.4;
    const float second_turn_drift_angle = 0.5;
    const float fifth_turn_drift_angle = 0.25;

    vec2 turn;
    float turn_sign = 0.;
    vec2 dirL = rotate(dir, -PI/2.);
    vec2 dirR = -dirL;
    float up_down = 0.;
    float rotate_on_turns = 1.;
    float roll_on_turns = 1.;
    float add_angel = 0.;
    if (t8 < 0.125) {
        turn = dirL;
        //dir = dir;
        turn_sign = -1.;
        angle -= first_turn_look_angle * (max(0., t1 - (1. - turn_time*2.)) / turn_time - max(0., t1 - (1. - turn_time)) / turn_time * 2.5);
        roll_on_turns = 0.;
    } else if (t8 < 0.250) {
        prev += dir;
        turn = dir;
        dir = dirL;
        angle -= 1.;
        turn_sign = 1.;
        add_angel += first_turn_look_angle*0.5 + (-first_turn_look_angle*0.5+1.0+second_turn_drift_angle)*t1;
        rotate_on_turns = 0.;
        roll_on_turns = 0.;
    } else if (t8 < 0.375) {
        prev += dir + dirL;
        turn = dirR;
        //dir = dir;
        turn_sign = 1.;
        add_angel += second_turn_drift_angle*sqrt(1.-t1);
        //roll_on_turns = 0.;
    } else if (t8 < 0.5) {
        prev += dir + dir + dirL;
        turn = dirR;
        dir = dirR;
        angle += 1.;
        turn_sign = 0.;
        up_down = sin(t1*PI) * 0.37;
    } else if (t8 < 0.625) {
        prev += dir + dir;
        turn = dir;
        dir = dirR;
        angle += 1.;
        turn_sign = -1.;
        up_down = sin(-min(1., t1/(1.-turn_time))*PI) * 0.37;
    } else if (t8 < 0.750) {
        prev += dir + dir + dirR;
        turn = dirL;
        //dir = dir;
        turn_sign = -1.;
        add_angel -= (fifth_turn_drift_angle + 1.) * smoothstep1(t1);
        rotate_on_turns = 0.;
        roll_on_turns = 0.;
    } else if (t8 < 0.875) {
        prev += dir + dir + dir + dirR;
        turn = dir;
        dir = dirL;
        angle -= 1.;
        turn_sign = 1.;
        add_angel -= fifth_turn_drift_angle - smoothstep1(t1) * (fifth_turn_drift_angle * 2. + 1.);
        rotate_on_turns = 0.;
        roll_on_turns = 0.;
    } else {
        prev += dir + dir + dir;
        turn = dirR;
        //dir = dir;
        turn_sign = 1.;
        angle += fifth_turn_drift_angle * (1.5*min(1., (1.-t1)/turn_time) - 0.5*smoothstep1(1. - min(1.,t1/(1.-turn_time))));
    }

    if (u_mouse.x > 10. || u_mouse.y > 10.) {
        vec2 mouse = u_mouse.xy / u_resolution.xy * 2. - 1.;
        up_down = -0.7 * mouse.y;
        angle += mouse.x;
        rotate_on_turns = 1.;
        roll_on_turns = 0.;
    } else {
        angle += add_angel;
    }

    rd = rotateX(rd, up_down);

    vec2 p;
    if (turn_sign == 0.) {
        //  move forward
        p = prev + dir * (turn_rad + 1. * t1);
    }
    else if (t1 > (1. - turn_time)) {
        //  turn
        float tr = (t1 - (1. - turn_time)) / turn_time;
        vec2 c = prev + dir * (1. - turn_rad) + turn * turn_rad;
        p = c + turn_rad * rotate(dir, (tr - 1.) * turn_sign * PI/2.);
        angle += tr * turn_sign * rotate_on_turns;
        rd = rotateY(rd, sin(tr*turn_sign*PI) * 0.2 * roll_on_turns);  //roll
    }  else  {
        //  move forward
        t1 /= (1. - turn_time);
        p = prev + dir * (turn_rad + (1. - turn_rad*2.) * t1);
    }

    rd = rotateZ(rd, angle * PI/2.);

    ro.xy += level1_size * p;

    ro += rd * 0.2;
    rd = normalize(rd);

    vec3 col = rain(ro, rd, u_time);

   gl_FragColor = vec4(col, 1.);
}

` 
const atomFragmentShader = /*glsl*/ `


#define PI 3.14159265359
/*** math heavy part for spherical harmonics ***/
#define SQRT2PI 2.506628274631

uniform vec2 u_resolution;
uniform float u_time; 
uniform int n;
uniform int l;
uniform int m;
// factorial
float factorial(int n) {
    float res = 1.0;
    for (int i = n; i > 1; i--)
        res *= float(i);
    return res;
}

// double factorial
float doubleFactorial(int n) {
    float res = 1.0;
    for (int i = n; i > 1; i-=2)
        res *= float(i);
    return res;
}

// fac(l-m)/fac(l+m) but more stable
float stableFactorialRatio(int l, int m) {
    int am = abs(m);
    if (am > l)
        return 0.0;
    float res = 1.0;
    for (int i = max(l-am+1,2); i <= l+am; i++)
        res *= float(i);
    if (m < 0)
        return res;
    return 1.0 / res;
}

// complex exponential
vec2 complexExponential(vec2 c) {
    return exp(c.x)*vec2(cos(c.y), sin(c.y));
}

// complex multiplication
vec2 complexMultiply(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

// complex conjugation
vec2 complexConjugate(vec2 c) { return vec2(c.x, -c.y); }

// complex/real magnitude squared
float squareMagnitude(float x) { return x*x; }
float squareMagnitude(vec2 x) { return dot(x,x); }

// associated legendre polynomials
float associatedLegendrePolynomials(float x, int l, int m) {
    if (l < abs(m))
        return 0.0;
    if (l == 0)
        return 1.0;
    float mul = m >= 0 ? 1.0 : float((~m&1)*2-1)*stableFactorialRatio(l,m);
    m = abs(m);
    // recursive calculation of legendre polynomial
    float lp1 = 0.0;
    float lp2 = float((~m&1)*2-1)*doubleFactorial(2*m-1)*pow(max(1.0-x*x, 1e-7), float(m)/2.0);
    for (int i = m+1; i <= l; i++) {
        float lp = (x*float(2*i-1)*lp2 - float(i+m-1)*lp1)/float(i-m);
        lp1 = lp2; lp2 = lp;
    }
    return lp2 / mul;
}

// spherical harmonics function
vec2 sphericalHarmonics(float theta, float phi, int l, int m) {
    float abs_value = 1.0/SQRT2PI*sqrt(float(2*l+1)/2.0*stableFactorialRatio(l,m))
                        *associatedLegendrePolynomials(cos(theta), l, m);
    return complexExponential(vec2(0.0,float(m)*phi))*abs_value;
}

// associated laguerre polynomial L_s^k(x) with k > 0, s >= 0
float associatedLaguerrePolynomial(float x, int s, int k) {
    if (s <= 0)
        return 1.0;
    float lp1 = 1.0;
    float lp2 = 1.0 - x + float(k);
    for (int n = 1; n < s; n++) {
        float lp = ((float(2*n + k + 1) - x) * lp2 - float(n+k)*lp1)/float(n+1);
        lp1 = lp2; lp2 = lp;
    }
    return lp2;
}

// radius dependent term of the 1/r potential eigenstates in atomic units
float radialWavefunction(float r, int n, int l) {
    float a0 = 1.0; // atomic radius
    float rr = r / a0;
    float n2 = 2.0 / float(n) / a0;
    float n3 = n2 * n2 * n2;
    float p1 = sqrt(n3 * stableFactorialRatio(n, l) * float(n-l)/float(n));
    float p2 = exp(-rr/float(n));
    float p3 = pow(n2*r, float(l));
    float p4 = associatedLaguerrePolynomial(n2*r, n-l-1, 2*l+1);
    return p1 * p2 * p3 * p4;
}

vec2 hydrogenWavefunction(vec3 pos, int n, int l, int m) {
    float r = length(pos);
    float sin_theta = length(pos.xy);
    float phi = sin_theta > 0.0 ? atan(pos.x, pos.y) : 0.0;
    float theta = atan(sin_theta, pos.z);
    
    return sphericalHarmonics(theta, phi, l, m) * radialWavefunction(r, n, l);
}

/*** Now the rendering ***/

vec3 rotateAlongX(vec3 pos, float angle) {
    return vec3(pos.x, complexMultiply(pos.yz, complexExponential(vec2(0.,-angle))));
}
 
void getQuantumNumbers(out int n, out int l, out int m, in vec2 fragCoord) {
  n = 6;
    l = 2;
    m = 1;
}

float softPositive(float x, float s) {
    return 0.5*(x*x/(s+abs(x))+x+s);
}
float softMaximum(float a, float b, float s) {
    return a+softPositive(b-a,s);
}

#define SURFACE_LEVEL 0.3
float signedDistanceFunction(vec3 pos, out vec3 color, in vec2 fragCoord) {
    //int n, m, l;
    //getQuantumNumbers(n, l, m, fragCoord);

    // evaluate spherical harmonics
    vec2 off = complexExponential(vec2(0, u_time));
    
    vec2 H = hydrogenWavefunction(pos*float(n*n+1)*1.5, n, l, m);
    if (m != 0) H = complexMultiply(H, off);
    
    H *= float((l+1)*l+n*n)*sqrt(float(n)); // visual rescaling
    
    float crit2 = 0.3*(length(pos)+0.05);
    
    color = H.x > 0. ? vec3(1.0,0.,1.) : vec3(0.,1.,0.);
    float d = (SURFACE_LEVEL - abs(H.x))*crit2;
    if (m == 0)
        return softMaximum(d, 0.707*(pos.x+pos.y), 0.02);
    return d;
 
    float arg = atan(H.x, H.y);
    color = vec3(max(vec3(0.02),(sin(arg + vec3(0., 2.1, 4.2)))));
    return (0.20 - length(H))*crit2;
}

vec3 computeNormal(in vec3 world_point, float sd, in vec2 fragCoord) {
    const vec3 small_step = vec3(0.001, 0.0, 0.0);
    vec3 col;
    float gradient_x = signedDistanceFunction(world_point + small_step.xyy, col, fragCoord) - sd;
    float gradient_y = signedDistanceFunction(world_point + small_step.yxy, col, fragCoord) - sd;
    float gradient_z = signedDistanceFunction(world_point + small_step.yyx, col, fragCoord) - sd;
    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);
    return normalize(normal);
}

vec4 calculateLighting(vec3 cp, vec3 color, vec3 normal, vec3 rdir) {
    // from https://www.shadertoy.com/view/ts3XDj
    // geometry
    vec3 ref = reflect( rdir, normal );

    // material      
    vec3 mate = color.rgb;

    float occ = clamp(length(cp)*0.7, 0.2, 0.5);
    float sss = -pow(clamp(1.0 + dot(normal, rdir), 0.0, 1.0), 1.0);

    // lights
    vec3 lin  = 2.5*occ*vec3(1.0)*(0.6 + 0.4*normal.y);
         lin += 1.0*sss*vec3(1.0,0.95,0.70)*occ;  

    // surface-light interacion
    vec3 col = mate.xyz * lin;
    return vec4(col, 1.0);
}

#define NUMBER_OF_STEPS 128
#define MINIMUM_HIT_DISTANCE 0.005
#define MAXIMUM_TRACE_DISTANCE 6.0
vec4 raymarch(in vec3 rpos, in vec3 rdir, in vec2 fragCoord) {
    float t = 0.0;
    float closest_t = 0.0;
    float closest_t_r = MAXIMUM_TRACE_DISTANCE;
    float closest_t_r2 = MAXIMUM_TRACE_DISTANCE;
    float closest_t_r3 = MAXIMUM_TRACE_DISTANCE;
    vec4 col = vec4(0,0,0,0);
    for (int i = 0; i < NUMBER_OF_STEPS; i++) {
        vec3 cp = rpos + t * rdir;
        
        vec3 color = vec3(0.0);
        float sd = signedDistanceFunction(cp, color, fragCoord);
        
        if (abs(sd) < 0.7*MINIMUM_HIT_DISTANCE) {
            vec3 normal = computeNormal(cp, sd, fragCoord);
            col = calculateLighting(cp, color, normal, rdir);
            break;
        }
        
        closest_t_r3 = closest_t_r2;
        closest_t_r2 = closest_t_r;
        if (sd < closest_t_r) {
            closest_t = t;
            closest_t_r = sd;
        }

        if (t > MAXIMUM_TRACE_DISTANCE)
            break;
        
        t += sd;
    }
    if (abs(closest_t_r3) > MINIMUM_HIT_DISTANCE) {
        return col;
    }
    vec3 cp = rpos + closest_t * rdir;
    vec3 color = vec3(0.0);
    float sd = signedDistanceFunction(cp, color, fragCoord);
    vec3 normal = computeNormal(cp, sd, fragCoord);
    float a = 1.0-abs(closest_t_r3)/MINIMUM_HIT_DISTANCE;
    vec4 col2 = calculateLighting(cp, color, normal, rdir);
    col2.a = a;
    return mix(col, col2, a);
}

void main() {
    vec2 uv = (-u_resolution.xy + 2.0*gl_FragCoord.xy) / u_resolution.y;
    float rot = 0.5*sin(u_time*0.5) * PI/3.0;

     // camera movement
    vec3 cam_pos = 3.0 * rotateAlongX(vec3(0,1,0), rot);
    vec3 look_at = vec3(0);   
    vec3 look_up = vec3(0,0,1);
    
    // camera matrix
    vec3 ww = normalize(look_at - cam_pos);
    vec3 uu = normalize(cross(ww, look_up));
    vec3 vv = normalize(cross(uu, ww));
    // create perspective view ray
    vec3 rpos = cam_pos;
    vec3 rdir = normalize( uv.x*uu + uv.y*vv + 2.0*ww );
    
    vec4 col = raymarch(rpos, rdir, gl_FragCoord.xy);
 //   vec3 bg = vec3(0.3) * clamp(1.0-2.6*length(fragCoord/u_resolution.xy-0.5)*0.5,0.0,1.0);
  //  col = vec4(mix(bg, col.rgb, col.a), 1.0);
    col = vec4(pow(clamp(col.rgb,0.0,1.0), vec3(0.4545)), 1.0);

    
    gl_FragColor = col;
}

`
// const fragmentShader = /*glsl*/`
// #ifdef GL_ES
// precision mediump float;
// #endif

// uniform vec2 u_resolution;
// uniform float u_time;
// uniform vec2 u_mouse;

//  #define ROT(p, a) p=cos(a)*p+sin(a)*vec2(p.y, -p.x)

// float a0 = 5.1;
// uniform int  n;
// uniform int  l;
// uniform int  m;
// float A = 0.;
// float Y0 = 0.;

// float JC(int x)
// {
//     float v = 1.;
//     for (int i = 1; i <= x; i++)
//     {
//         v *= float(i);
//     }
//     return v;
// }
// int powN1(int n)
// {
//     return n % 2 == 0 ? 1 : -1;
// }
// float Cmn(int n, int m)
// {
//     return JC(n) / (JC(m) * JC(n - m));
// }
// float laguerreL(int n, int m, float x)
// {
//     float sum = 0.;
//     for (int k = 0; k <= n; k++)
//     {
//         sum += float(powN1(k))* Cmn(n + m, n - k)* pow(x, float(k)) / JC(k);
//     }
//     return sum;
// }
// float PML(float m, float l, float x)
// {
//     float A1 = pow(1. - x * x, m / 2.);
//     float sum = 0.;
//     int kl = int((l - m) / 2.);
//     for (int k = 0; k <= kl; k++)
//     {
//         float jk = JC(k);
//         float jk2 = JC(int(l) - k);
//         float jk3 = JC(int(l) - 2 * k - int(m));
//         float B = pow(2., l) * jk * jk2 * jk3;

//         float E = pow(x, l - 2. * float(k) - m);
//         sum += (float(powN1(k)) * JC(2 * int(l) - 2 * k) / B) * E;
//     }
//     return A1 * sum;
// }

// float calcR(float r)
// {
//     float B = pow(2. * r / (float(n) * a0), float(l));
//     float C = laguerreL(n - l - 1, 2 * l + 1, 2. * r / (float(n) * a0));
//     float E = exp(-(r / (float(n) * a0)));
//     return A * B * C * E;
// }
// float calcY(float cosang)
// {
//     float pml = PML(float(m), float(l),
//                     abs(cosang)
//                    );
//     float Yml = Y0 * pml;
//     return pml * Yml;
// }
// vec2 calcF(float fai)
// {
//     return vec2(cos(float(m) * fai), sin(float(m) * fai));
// }
// bool mapcor(vec3 p, out float fcolor)
// {
// 	float r = length(p);
// 	vec3 v = p / r;
// 	vec2 xz = normalize(v.xz);
// 	float R = calcR(r);

// 	float Y = calcY(v.y / length(v));
// 	float fai = atan(-xz.y, xz.x);
//     vec2 VF = calcF(fai);

// 	float epx = R * Y * VF.x;
//     float epy = R * Y * VF.y;

// 	float nlum =  (epy*epy) * 10000.0f;
// 	fcolor += nlum * 100.0f;

// 	bool ret = fcolor >= 1.0;
// 	if (ret)
// 		fcolor = 1.0;

// 	return ret;
// }

// void main( )
// {
//     vec2 pp = (-u_resolution.xy + 2.0*gl_FragCoord.xy) / u_resolution.y;
//     float eyer = 2.0;
//     float eyea = -((u_mouse.x + 80.5) / u_resolution.x) * 3.1415926 * 2.0;
//     float eyef = ((u_mouse.y / u_resolution.y)-0.24) * 3.1415926 * 2.0;

// 	vec3 cam = vec3(
//         eyer * cos(eyea) * sin(eyef),
//         eyer * cos(eyef),
//         eyer * sin(eyea) * sin(eyef));

//     ROT(cam.xz, (0.25) * (u_time + 15.0));

// 	vec3 front = normalize(- cam);
// 	vec3 left = normalize(cross(normalize(vec3(0.25,1,-0.01)), front));
// 	vec3 up = normalize(cross(front, left));
// 	vec3 v = normalize(front*3.0 + left*pp.x + up*pp.y);

//     vec3 p = cam;

//     float dt = 0.03;
//     float cor = 0.0;
//     A = sqrt(pow(2. / (float(n) * a0), 3.) * (JC(n - l - 1) / (2.0 * float(n) * JC(n + l))));
//     Y0 = (1. / sqrt(2. * 3.1415926)) * sqrt(((2. * float(l) + 1.) / 2.0) * (JC(l - m) / JC(l + m)));

//     for(int i = 0; i < 100; i ++)
//     {
//         p += v * dt;

// 		if(mapcor(p * 500., cor))
//             break;
//     }
//     vec4 color = vec4(cor,cor,cor,1.0);

//     gl_FragColor = color;
// }

// `
// const vertexShader = /*glsl*/`
// void main() { 

//   vec4 modelPosition = modelMatrix * vec4(position, 1.0);
//   vec4 viewPosition = viewMatrix * modelPosition;
//   vec4 projectedPosition = projectionMatrix * viewPosition;

//   gl_Position = projectedPosition;
// }

// `


// const fragmentShader = /*glsl*/`
// precision lowp float;
// precision lowp int;
// varying vec2 vUv;
// uniform float u_time;
// uniform vec2 u_mouse;
// uniform vec2 u_resolution; 
// varying vec3 vPosition;



//  const int ITERATIONS = 40;   //use less value if you need more performance
// const float SPEED = 1.;

// const float STRIP_CHARS_MIN =  7.;
// const float STRIP_CHARS_MAX = 40.;
// const float STRIP_CHAR_HEIGHT = 0.15;
// const float STRIP_CHAR_WIDTH = 0.10;
// const float ZCELL_SIZE = 1. * (STRIP_CHAR_HEIGHT * STRIP_CHARS_MAX);  //the multiplier can't be less than 1.
// const float XYCELL_SIZE = 12. * STRIP_CHAR_WIDTH;  //the multiplier can't be less than 1.

// const int BLOCK_SIZE = 10;  //in cells
// const int BLOCK_GAP = 2;    //in cells

// const float WALK_SPEED = 1. * XYCELL_SIZE;
// const float BLOCKS_BEFORE_TURN = 3.;


// const float PI = 3.14159265359;


// //        ----  random  ----

// float hash(float v) {
//     return fract(sin(v)*43758.5453123);
// }

// float hash(vec2 v) {
//     return hash(dot(v, vec2(5.3983, 5.4427)));
// }

// vec2 hash2(vec2 v)
// {
//     v = vec2(v * mat2(127.1, 311.7,  269.5, 183.3));
// 	return fract(sin(v)*43758.5453123);
// }

// vec4 hash4(vec2 v)
// {
//     vec4 p = vec4(v * mat4x2( 127.1, 311.7,
//                               269.5, 183.3,
//                               113.5, 271.9,
//                               246.1, 124.6 ));
//     return fract(sin(p)*43758.5453123);
// }

// vec4 hash4(vec3 v)
// {
//     vec4 p = vec4(v * mat4x3( 127.1, 311.7, 74.7,
//                               269.5, 183.3, 246.1,
//                               113.5, 271.9, 124.6,
//                               271.9, 269.5, 311.7 ) );
//     return fract(sin(p)*43758.5453123);
// }


// //        ----  symbols  ----
// //  Slightly modified version of "runes" by FabriceNeyret2 -  https://www.shadertoy.com/view/4ltyDM
// //  Which is based on "runes" by otaviogood -  https://shadertoy.com/view/MsXSRn

// float rune_line(vec2 p, vec2 a, vec2 b) {   // from https://www.shadertoy.com/view/4dcfW8
//     p -= a, b -= a;
// 	float h = clamp(dot(p, b) / dot(b, b), 0., 1.);   // proj coord on line
// 	return length(p - b * h);                         // dist to segment
// }

// float rune(vec2 U, vec2 seed, float highlight)
// {
// 	float d = 1e5;
// 	for (int i = 0; i < 4; i++)	// number of strokes
// 	{
//         vec4 pos = hash4(seed);
// 		seed += 1.;

// 		// each rune touches the edge of its box on all 4 sides
// 		if (i == 0) pos.y = .0;
// 		if (i == 1) pos.x = .999;
// 		if (i == 2) pos.x = .0;
// 		if (i == 3) pos.y = .999;
// 		// snap the random line endpoints to a grid 2x3
// 		vec4 snaps = vec4(2, 3, 2, 3);
// 		pos = ( floor(pos * snaps) + .5) / snaps;

// 		if (pos.xy != pos.zw)  //filter out single points (when start and end are the same)
// 		    d = min(d, rune_line(U, pos.xy, pos.zw + .001) ); // closest line
// 	}
// 	return smoothstep(0.1, 0., d) + highlight*smoothstep(0.4, 0., d);
// }

// float random_char(vec2 outer, vec2 inner, float highlight) {
//     vec2 seed = vec2(dot(outer, vec2(269.5, 183.3)), dot(outer, vec2(113.5, 271.9)));
//     return rune(inner, seed, highlight);
// }


// //        ----  digital rain  ----

// // xy - horizontal, z - vertical
// vec3 rain(vec3 ro3, vec3 rd3, float time) {
//     vec4 result = vec4(0.);

//     // normalized 2d projection
//     vec2 ro2 = vec2(ro3);
//     vec2 rd2 = normalize(vec2(rd3));
 
//     bool prefer_dx = abs(rd2.x) > abs(rd2.y);
//     float t3_to_t2 = prefer_dx ? rd3.x / rd2.x : rd3.y / rd2.y;

//     // at first, horizontal space (xy) is divided into cells (which are columns in 3D)
//     // then each xy-cell is divided into vertical cells (along z) - each of these cells contains one raindrop

//     ivec3 cell_side = ivec3(step(0., rd3));      //for positive rd.x use cell side with higher x (1) as the next side, for negative - with lower x (0), the same for y and z
//     ivec3 cell_shift = ivec3(sign(rd3));         //shift to move to the next cell

//     //  move through xy-cells in the ray direction
//     float t2 = 0.;  // the ray formula is: ro2 + rd2 * t2, where t2 is positive as the ray has a direction.
//     ivec2 next_cell = ivec2(floor(ro2/XYCELL_SIZE));  //first cell index where ray origin is located
//     for (int i=0; i<ITERATIONS; i++) {
//         ivec2 cell = next_cell;  //save cell value before changing
//         float t2s = t2;          //and t

//         //  find the intersection with the nearest side of the current xy-cell (since we know the direction, we only need to check one vertical side and one horizontal side)
//         vec2 side = vec2(next_cell + cell_side.xy) * XYCELL_SIZE;  //side.x is x coord of the y-axis side, side.y - y of the x-axis side
//         vec2 t2_side = (side - ro2) / rd2;  // t2_side.x and t2_side.y are two candidates for the next value of t2, we need the nearest
//         if (t2_side.x < t2_side.y) {
//             t2 = t2_side.x;
//             next_cell.x += cell_shift.x;  //cross through the y-axis side
//         } else {
//             t2 = t2_side.y;
//             next_cell.y += cell_shift.y;  //cross through the x-axis side
//         }
//         //now t2 is the value of the end point in the current cell (and the same point is the start value in the next cell)

//         //  gap cells
//         vec2 cell_in_block = fract(vec2(cell) / float(BLOCK_SIZE));
//         float gap = float(BLOCK_GAP) / float(BLOCK_SIZE);
//         if (cell_in_block.x < gap || cell_in_block.y < gap || (cell_in_block.x < (gap+0.1) && cell_in_block.y < (gap+0.1))) {
//             continue;
//         }

//         //  return to 3d - we have start and end points of the ray segment inside the column (t3s and t3e)
//         float t3s = t2s / t3_to_t2;

//         //  move through z-cells of the current column in the ray direction (don't need much to check, two nearest cells are enough)
//         float pos_z = ro3.z + rd3.z * t3s;
//         float xycell_hash = hash(vec2(cell));
//         float z_shift = xycell_hash*11. - time * (0.5 + xycell_hash * 1.0 + xycell_hash * xycell_hash * 1.0 + pow(xycell_hash, 16.) * 3.0);  //a different z shift for each xy column
//         float char_z_shift = floor(z_shift / STRIP_CHAR_HEIGHT);
//         z_shift = char_z_shift * STRIP_CHAR_HEIGHT;
//         int zcell = int(floor((pos_z - z_shift)/ZCELL_SIZE));  //z-cell index
//         for (int j=0; j<2; j++) {  //2 iterations is enough if camera doesn't look much up or down
//             //  calcaulate coordinates of the target (raindrop)
//             vec4 cell_hash = hash4(vec3(ivec3(cell, zcell)));
//             vec4 cell_hash2 = fract(cell_hash * vec4(127.1, 311.7, 271.9, 124.6));

//             float chars_count = cell_hash.w * (STRIP_CHARS_MAX - STRIP_CHARS_MIN) + STRIP_CHARS_MIN;
//             float target_length = chars_count * STRIP_CHAR_HEIGHT;
//             float target_rad = STRIP_CHAR_WIDTH / 2.;
//             float target_z = (float(zcell)*ZCELL_SIZE + z_shift) + cell_hash.z * (ZCELL_SIZE - target_length);
//             vec2 target = vec2(cell) * XYCELL_SIZE + target_rad + cell_hash.xy * (XYCELL_SIZE - target_rad*2.);

//             //  We have a line segment (t0,t). Now calculate the distance between line segment and cell target (it's easier in 2d)
//             vec2 s = target - ro2;
//             float tmin = dot(s, rd2);  //tmin - point with minimal distance to target
//             if (tmin >= t2s && tmin <= t2) {
//                 float u = s.x * rd2.y - s.y * rd2.x;  //horizontal coord in the matrix strip
//                 if (abs(u) < target_rad) {
//                     u = (u/target_rad + 1.) / 2.;
//                     float z = ro3.z + rd3.z * tmin/t3_to_t2;
//                     float v = (z - target_z) / target_length;  //vertical coord in the matrix strip
//                     if (v >= 0.0 && v < 1.0) {
//                         float c = floor(v * chars_count);  //symbol index relative to the start of the strip, with addition of char_z_shift it becomes an index relative to the whole cell
//                         float q = fract(v * chars_count);
//                         vec2 char_hash = hash2(vec2(c+char_z_shift, cell_hash2.x));
//                         if (char_hash.x >= 0.1 || c == 0.) {  //10% of missed symbols
//                             float time_factor = floor(c == 0. ? time*5.0 :  //first symbol is changed fast
//                                     time*(1.0*cell_hash2.z +   //strips are changed sometime with different speed
//                                             cell_hash2.w*cell_hash2.w*4.*pow(char_hash.y, 4.)));  //some symbols in some strips are changed relatively often
//                             float a = random_char(vec2(char_hash.x, time_factor), vec2(u,q), max(1., 3. - c/2.)*0.2);  //alpha
//                             a *= clamp((chars_count - 0.5 - c) / 2., 0., 1.);  //tail fade
//                             if (a > 0.) {
//                                 float attenuation = 1. + pow(0.06*tmin/t3_to_t2, 2.);
//                                 vec3 col = (c == 0. ? vec3(0.67, 1.0, 0.82) : vec3(0.25, 0.80, 0.40)) / attenuation;
//                                 float a1 = result.a;
//                                 result.a = a1 + (1. - a1) * a;
//                                 result.xyz = (result.xyz * a1 + col * (1. - a1) * a) / result.a;
//                                 if (result.a > 0.98)  return result.xyz;
//                             }
//                         }
//                     }
//                 }
//             }
//             // not found in this cell - go to next vertical cell
//             zcell += cell_shift.z;
//         }
//         // go to next horizontal cell
//     }

//     return result.xyz * result.a;
// }


// //        ----  main, camera  ----

// vec2 rotate(vec2 v, float a) {
//     float s = sin(a);
// 	float c = cos(a);
//     mat2 m = mat2(c, -s, s, c);
//     return m * v;
// }

// vec3 rotateX(vec3 v, float a) {
//     float s = sin(a);
//     float c = cos(a);
//     return mat3(1.,0.,0.,0.,c,-s,0.,s,c) * v;
// }

// vec3 rotateY(vec3 v, float a) {
//     float s = sin(a);
//     float c = cos(a);
//     return mat3(c,0.,-s,0.,1.,0.,s,0.,c) * v;
// }

// vec3 rotateZ(vec3 v, float a) {
//     float s = sin(a);
//     float c = cos(a);
//     return mat3(c,-s,0.,s,c,0.,0.,0.,1.) * v;
// }

// float smoothstep1(float x) {
//     return smoothstep(0., 1., x);
// }

// void main( )
// {
//     if (STRIP_CHAR_WIDTH > XYCELL_SIZE || STRIP_CHAR_HEIGHT * STRIP_CHARS_MAX > ZCELL_SIZE) {
//         // error
//         gl_FragColor = vec4(1., 0., 0., 1.);
//         return;
//     }

// 	vec2 uv = (gl_FragCoord.xy * 2. - u_resolution.xy) / u_resolution.y;

//     float time = u_time * SPEED;

//     const float turn_rad = 0.25 / BLOCKS_BEFORE_TURN;   //0 .. 0.5
//     const float turn_abs_time = (PI/2.*turn_rad) * 1.5;  //multiplier different than 1 means a slow down on turns
//     const float turn_time = turn_abs_time / (1. - 2.*turn_rad + turn_abs_time);  //0..1, but should be <= 0.5

//     float level1_size = float(BLOCK_SIZE) * BLOCKS_BEFORE_TURN * XYCELL_SIZE;
//     float level2_size = 4. * level1_size;
//     float gap_size = float(BLOCK_GAP) * XYCELL_SIZE;

//     vec3 ro = vec3(gap_size/2., gap_size/2., 0.);
//     vec3 rd = vec3(uv.x, 2.0, uv.y);

//     float tq = fract(time / (level2_size*4.) * WALK_SPEED);  //the whole cycle time counter
//     float t8 = fract(tq*4.);  //time counter while walking on one of the four big sides
//     float t1 = fract(t8*8.);  //time counter while walking on one of the eight sides of the big side

//     vec2 prev;
//     vec2 dir;
//     if (tq < 0.25) {
//         prev = vec2(0.,0.);
//         dir = vec2(0.,1.);
//     } else if (tq < 0.5) {
//         prev = vec2(0.,1.);
//         dir = vec2(1.,0.);
//     } else if (tq < 0.75) {
//         prev = vec2(1.,1.);
//         dir = vec2(0.,-1.);
//     } else {
//         prev = vec2(1.,0.);
//         dir = vec2(-1.,0.);
//     }
//     float angle = floor(tq * 4.);  //0..4 wich means 0..2*PI

//     prev *= 4.;

//     const float first_turn_look_angle = 0.4;
//     const float second_turn_drift_angle = 0.5;
//     const float fifth_turn_drift_angle = 0.25;

//     vec2 turn;
//     float turn_sign = 0.;
//     vec2 dirL = rotate(dir, -PI/2.);
//     vec2 dirR = -dirL;
//     float up_down = 0.;
//     float rotate_on_turns = 1.;
//     float roll_on_turns = 1.;
//     float add_angel = 0.;
//     if (t8 < 0.125) {
//         turn = dirL;
//         //dir = dir;
//         turn_sign = -1.;
//         angle -= first_turn_look_angle * (max(0., t1 - (1. - turn_time*2.)) / turn_time - max(0., t1 - (1. - turn_time)) / turn_time * 2.5);
//         roll_on_turns = 0.;
//     } else if (t8 < 0.250) {
//         prev += dir;
//         turn = dir;
//         dir = dirL;
//         angle -= 1.;
//         turn_sign = 1.;
//         add_angel += first_turn_look_angle*0.5 + (-first_turn_look_angle*0.5+1.0+second_turn_drift_angle)*t1;
//         rotate_on_turns = 0.;
//         roll_on_turns = 0.;
//     } else if (t8 < 0.375) {
//         prev += dir + dirL;
//         turn = dirR;
//         //dir = dir;
//         turn_sign = 1.;
//         add_angel += second_turn_drift_angle*sqrt(1.-t1);
//         //roll_on_turns = 0.;
//     } else if (t8 < 0.5) {
//         prev += dir + dir + dirL;
//         turn = dirR;
//         dir = dirR;
//         angle += 1.;
//         turn_sign = 0.;
//         up_down = sin(t1*PI) * 0.37;
//     } else if (t8 < 0.625) {
//         prev += dir + dir;
//         turn = dir;
//         dir = dirR;
//         angle += 1.;
//         turn_sign = -1.;
//         up_down = sin(-min(1., t1/(1.-turn_time))*PI) * 0.37;
//     } else if (t8 < 0.750) {
//         prev += dir + dir + dirR;
//         turn = dirL;
//         //dir = dir;
//         turn_sign = -1.;
//         add_angel -= (fifth_turn_drift_angle + 1.) * smoothstep1(t1);
//         rotate_on_turns = 0.;
//         roll_on_turns = 0.;
//     } else if (t8 < 0.875) {
//         prev += dir + dir + dir + dirR;
//         turn = dir;
//         dir = dirL;
//         angle -= 1.;
//         turn_sign = 1.;
//         add_angel -= fifth_turn_drift_angle - smoothstep1(t1) * (fifth_turn_drift_angle * 2. + 1.);
//         rotate_on_turns = 0.;
//         roll_on_turns = 0.;
//     } else {
//         prev += dir + dir + dir;
//         turn = dirR;
//         //dir = dir;
//         turn_sign = 1.;
//         angle += fifth_turn_drift_angle * (1.5*min(1., (1.-t1)/turn_time) - 0.5*smoothstep1(1. - min(1.,t1/(1.-turn_time))));
//     }

//     if (u_mouse.x > 10. || u_mouse.y > 10.) {
//         vec2 mouse = u_mouse.xy / u_resolution.xy * 2. - 1.;
//         up_down = -0.7 * mouse.y;
//         angle += mouse.x;
//         rotate_on_turns = 1.;
//         roll_on_turns = 0.;
//     } else {
//         angle += add_angel;
//     }

//     rd = rotateX(rd, up_down);

//     vec2 p;
//     if (turn_sign == 0.) {
//         //  move forward
//         p = prev + dir * (turn_rad + 1. * t1);
//     }
//     else if (t1 > (1. - turn_time)) {
//         //  turn
//         float tr = (t1 - (1. - turn_time)) / turn_time;
//         vec2 c = prev + dir * (1. - turn_rad) + turn * turn_rad;
//         p = c + turn_rad * rotate(dir, (tr - 1.) * turn_sign * PI/2.);
//         angle += tr * turn_sign * rotate_on_turns;
//         rd = rotateY(rd, sin(tr*turn_sign*PI) * 0.2 * roll_on_turns);  //roll
//     }  else  {
//         //  move forward
//         t1 /= (1. - turn_time);
//         p = prev + dir * (turn_rad + (1. - turn_rad*2.) * t1);
//     }

//     rd = rotateZ(rd, angle * PI/2.);

//     ro.xy += level1_size * p;

//     ro += rd * 0.2;
//     rd = normalize(rd);

//     vec3 col = rain(ro, rd, u_time);

//    gl_FragColor = vec4(col, 1.);
// }

// ` 
export { matrixFragmentShader, vertexShader, atomFragmentShader}