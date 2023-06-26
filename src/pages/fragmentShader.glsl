precision highp float;

#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives:enable
#endif

// ####### Hydrogen Orbitals #######
// Made by Jacob Bingham (Zi7ar21) on January 21st, 2022

// Last Updated on January 22nd, 2022 at 03:05 Mountain Standard Time

// If you found this anywhere except Shadertoy, you can find the original and possibly updated version at:
// https://www.shadertoy.com/view/fsfyWf

// based on https://en.wikipedia.org/wiki/Hydrogen_atom#Schr%C3%B6dinger_equation

/*
I have no clue if this is actually correct...
I just used the "Schrodinger Equation" section on the "Hydrogen atom" Wikipedia
article (aaaaand ~~stole~~ made use of Inigo Quilez's Spherical Harmonics shader...)
*/

/*
## Features

- Arbitrary (n, l, m) ( scroll down to Parameters to adjust, the default is (3, 2, 0) )
- Volumetrics
- Ray-Marching
- Scattering
- Dithering with Interleaved Gradient Noise

## Limitations/TODO

- Generalized Laguerre Polynomial not taken into account
- I have no idea what this is and how to use it, it seems to not be
neccesary and so it's currently ommited
- Spherical Harmonics Problems
- This only supports Real Spherical Harmonics
- Pre-solved Spherical Harmonics only up to l = 3
- Solving arbitrary spherical harmonics for l and m would be cool...
of course, it probably wouldn't perform very great and so it would
only be used for l > 3
*/

/*
# Zi7ar21's Epic License

This applies to...

- Code I wrote
- You must respect the individual licenses of any snippets in the source that aren't mine

You are free to...

- Use this code however you want (as long as it complies with this license)
- e.g. personal and commercial projects
- Especially open-source projects

As long as...

- You use it ethically
- e.g. no using it for NFT's, which are unsustainable and stupid
- You keep comments in the source that credit and link to snippets of code that aren't mine
- e.g. Comments such as "PCG Random: https://www.pcg-random.org/"
- Of course, you must also respect whatever licenses they use

Remember, we are programmers, not lawyers! :)
*/

// Check out some of my friends!
// Dumb_Psycho
// https://www.shadertoy.com/user/Dumb_Psycho
// loicvdb
// https://www.shadertoy.com/user/loicvdb
// michael0884
// https://www.shadertoy.com/user/michael0884
// peabrainiac
// https://www.shadertoy.com/user/peabrainiac
// skythedragon
// https://www.shadertoy.com/user/skythedragon

// We have a Discord Server focused on STEM and Memes, DM me (@Zi7ar21#2168) if you're interested.

// ##### Preprocessor #####

/*
#pragma debug(on)
#pragma optimize(off)
*/

/*
#pragma debug(off)
#pragma optimize(on)
*/

// ##### Parameters #####

// n = principal quantum number
// l = azimuthal quantum number
// m = magnetic quantum number
#define n 3
#define l 2
#define m 0

#define EXPOSURE 1.0

// uncomment for orthographic camera
//#define ORTHO

#define FOV 1.5

#define STEP_SIZE 4.0

#define STEP_SIZE_SHADOW 0.4

#define CUTOFF 0.008
#define DENSITY 16.0

#define POSITIVE_COL vec3(0.250, 1.000, 0.500)
#define NEGATIVE_COL vec3(1.000, 0.500, 0.250)

// ##### Configuration Validation #####

// ### make sure n is valid ###

#if n < 1
#error n must be greater than 0
#endif

// ### make sure l is valid ###

#if l < 0
#error l must be greater than or equal to 0
#endif

#if l >= n
#error l must be less than n
#endif

// ### make sure m is valid ###

#if m > l || -m > l
#error m must be less than or equal to abs(l)
#endif

// ##### Constants #####

// http://www.mimirgames.com/articles/programming/digits-of-pi-needed-for-floating-point-numbers/
const float pi     = 3.141592653589793; // Pi
const float two_pi = 6.283185307179586; // 2 * Pi
const float inv_pi = 0.318309886183790; // 1 / Pi

// Reduced Bohr Radius
// 5.2946541 * 10 ^ -11 meters
// 0.52946541 angstrom
// https://en.wikipedia.org/wiki/Bohr_radius#Hydrogen_atom_and_similar_systems
const float a0 = 0.52946541;

// ##### Maths #####

//#define dot_product(x) dot(x, x)

float dot_product(vec2 x) { return dot(x, x); }
float dot_product(vec3 x) { return dot(x, x); }
float dot_product(vec4 x) { return dot(x, x); }

vec2 rotate(vec2 vector, float theta)
{
float s = sin(theta), c = cos(theta);
return vec2(vector.x * c - vector.y * s, vector.x * s + vector.y * c);
}

int factorial(int x)
{
int f = 1;

for(int i = 1; i <= x; i++)
{
    f = f * i;
}

return f;
}

// (x, y, z) -> (r, theta, phi)
vec3 cartesian2spherical(vec3 p)
{
return vec3(
    length(p), // r
    atan(p.y, p.x), // theta
    atan(length(p.xy), p.z) // phi
);
}

// (r, theta, phi) -> (x, y, z)
vec3 spherical2cartesian(vec3 p)
{
float r     = p.x;
float theta = p.y;
float phi   = p.z;

return vec3(
    cos(theta) * sin(phi),
    sin(theta) * sin(phi),
    cos(phi)
);
}

/*
*/
// modified from https://www.shadertoy.com/view/lsfXWH

// The MIT License
// Copyright © 2014 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// https://www.youtube.com/c/InigoQuilez
// https://iquilezles.org

// Four bands of Spherical Harmonics functions (or atomic orbitals if you want). For
// reference and fun.

// Constants, see here: http://en.wikipedia.org/wiki/Table_of_spherical_harmonics
const float k01 = 0.2820947918; // sqrt(  1 / PI) / 2
const float k02 = 0.4886025119; // sqrt(  3 / PI) / 2
const float k03 = 1.0925484306; // sqrt( 15 / PI) / 2
const float k04 = 0.3153915652; // sqrt(  5 / PI) / 4
const float k05 = 0.5462742153; // sqrt( 15 / PI) / 4
const float k06 = 0.5900435860; // sqrt( 70 / PI) / 8
const float k07 = 2.8906114210; // sqrt(105 / PI) / 2
const float k08 = 0.4570214810; // sqrt( 42 / PI) / 8
const float k09 = 0.3731763300; // sqrt(  7 / PI) / 4
const float k10 = 1.4453057110; // sqrt(105 / PI) / 4

// Y_l_m(s), where l is the band and m the range in [-l..l]
//float SH( in int l, in int m, in vec3 s )
float SH( in vec3 s )
{
vec3 n_ = s.zxy;

//----------------------------------------------------------
if( l==0 )          return  k01;
//----------------------------------------------------------
if( l==1 && m==-1 ) return -k02 * n_.y;
if( l==1 && m== 0 ) return  k02 * n_.z;
if( l==1 && m== 1 ) return -k02 * n_.x;
//----------------------------------------------------------
if( l==2 && m==-2 ) return  k03 * n_.x * n_.y;
if( l==2 && m==-1 ) return -k03 * n_.y * n_.z;
if( l==2 && m== 0 ) return  k04 * (3.0 * n_.z * n_.z - 1.0);
if( l==2 && m== 1 ) return -k03 * n_.x * n_.z;
if( l==2 && m== 2 ) return  k05 * (n_.x * n_.x - n_.y * n_.y);
//----------------------------------------------------------
if( l==3 && m==-3 ) return -k06 * n_.y * (3.0 * n_.x * n_.x - n_.y * n_.y);
if( l==3 && m==-2 ) return  k07 * n_.z * n_.y * n_.x;
if( l==3 && m==-1 ) return -k08 * n_.y * (5.0 * n_.z * n_.z - 1.0);
if( l==3 && m== 0 ) return  k09 * n_.z * (5.0 * n_.z * n_.z - 3.0);
if( l==3 && m== 1 ) return -k08 * n_.x * (5.0 * n_.z * n_.z - 1.0);
if( l==3 && m== 2 ) return  k10 * n_.z * (n_.x * n_.x - n_.y * n_.y);
if( l==3 && m== 3 ) return -k06 * n_.x * (n_.x * n_.x - 3.0 * n_.y * n_.y);
//----------------------------------------------------------

return 0.0;
}
/*
*/

// Generalized Laguerre Polynomial (not neccesary, I think?)
float L(float rho)
{
return 1.0;
}

// Spherical Harminic Function
// Wikipedia: "Spherical Harmonic Function of Degree l and Order m"
float Y(float theta, float phi)
{
vec3 p = spherical2cartesian( vec3(1.0, theta, phi) );

return SH(p);
}

// Normalized Position Wavefunction
float wavefunction(float r, float theta, float phi)
{
float rho = (2.0 * r) / (float(n) * a0);

float f0 = 2.0 / (float(n) * a0);
float f1 = float( factorial(n - l - 1) ) / float( 2 * n * factorial(n + l) );

return sqrt(f0 * f0 * f0 * f1) * exp(-rho / 2.0) * pow( rho, float(l) ) * L(rho) * Y(theta, phi);
}

// ##### Rendering #####

vec3 sky(vec3 dir)
{
return vec3(0);
return vec3(1) * 0.8 * smoothstep(0.0, 1.0, dir.y) + 0.2;
}

float sample_volume(in vec3 p, out vec3 col)
{
col = vec3(0.100, 0.250, 1.000);

if(dot_product(p) > 32.0 * 32.0)
{
    return 0.0;
}

//return 10.0 * smoothstep( 0.0, 1.0, 1.0 - length(p) );

/*
if(abs(p.x) > 1.2 || abs(p.y) > 1.2 || abs(p.z) > 1.2)
{
    return 0.0;
}
*/
/*
if(dot_product(p) < 0.8 * 0.8)
{
    return 8.0;
}
if(dot_product(p) > 1.2 * 1.2)
{
    return 0.0;
}

// https://en.wikipedia.org/wiki/Mandelbulb

vec3 c = p.xzy;
vec3 z = c;
float power = 8.0;

for(int i = 0; i < 8; i++)
{
    float r = length(z);
    
    if(r > 2.0)
    {
        return 8.0 * max( max(float(i - 2), 0.0) / 6.0, 0.0 );
    }
    
    // convert to polar coordinates
    float theta = acos(z.z / r );
    float phi   = atan(z.y, z.x);
    
    // scale and rotate the point
    //float zr = pow(r, power);
    float zr = r * r * r * r  *r * r * r * r;
    theta *= power;
    phi   *= power;
    
    float sin_theta = sin(theta);
    float cos_theta = cos(theta);
    float sin_phi = sin(phi);
    float cos_phi = cos(phi);
    
    z = ( zr * vec3(sin_theta * cos_phi, sin_phi * sin_theta, cos_theta) ) + c;
}

return 8.0;
*/

p = vec3(rotate(p.xy, 1.0 * (0.1 / 3.0) * two_pi * iTime), p.z).xyz;
p = vec3(rotate(p.xz, 2.0 * (0.1 / 3.0) * two_pi * iTime), p.y).xzy;
p = vec3(rotate(p.yz, 3.0 * (0.1 / 3.0) * two_pi * iTime), p.x).yzx;

p = cartesian2spherical(p);
float r     = p.x;
float theta = p.y;
float phi   = p.z;

float w = wavefunction(r, theta, phi);

if(w > 0.0)
{
    col = POSITIVE_COL;
}
else
{
    col = NEGATIVE_COL;
}

return DENSITY * max(abs(w) - CUTOFF, 0.0);
}

vec3 sample_light(vec3 ro, vec3 rd)
{
vec3 a = vec3(1);

for(int i = 0; i < 10; i++)
{
    float t = STEP_SIZE_SHADOW * float(i);
    
    vec3 p = ro + rd * t;
    
    vec3 c;
    float d = sample_volume(p, c);
    
    if(d > 0.0)
    {
        a *= exp(-STEP_SIZE_SHADOW * c * d);
    }
}

return a;
}

// https://blog.demofox.org/2022/01/01/interleaved-gradient-noise-a-different-kind-of-low-discrepancy-sequence/
// http://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare
float IGN(vec2 pixel_coord, int frame)
{
frame = frame % 64;

pixel_coord += 5.588238 * float(frame);

return fract( 52.9829189 * fract(0.06711056 * pixel_coord.x + 0.00583715 * pixel_coord.y) );
}

/*
// ##### Main #####
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
fragColor = vec4(0.0, 0.0, 0.0, 1.0);

vec2 uv = 2.0 * (fragCoord - 0.5 * iResolution.xy) / max(iResolution.x, iResolution.y);

vec3 p = 10.0 * vec3( uv, sin(0.125 * two_pi * iTime) );

float r = length(p);
float theta = atan(p.y, p.x);
float phi = atan(length(p.xy), p.z);

fragColor.rgb = vec3( 10.0 * abs( wavefunction(r, theta, phi) ) );
}
*/

// ##### Main #####
void mainImage(out vec4 fragColor,in vec2 fragCoord)
{
fragColor=vec4(0.,0.,0.,1.);

vec2 uv=2.*(fragCoord-.5*iResolution.xy)/max(iResolution.x,iResolution.y);

#ifdef ORTHO
vec3 ro=vec3(FOV*uv,16.);
vec3 rd=vec3(0.,0.,-1.);
#else
//vec3 ro = vec3( 0.0, 0.0, 0.2 * sin( (1.0 / 3.0) * two_pi * iTime ) + 16.0 );
vec3 ro=vec3(0.,0.,16.);
vec3 rd=normalize(vec3(FOV*uv,-1.));
#endif

//float theta = 0.125 * two_pi * iTime;

//ro = vec3(rotate(ro.xz, theta), ro.y).xzy;
//rd = vec3(rotate(rd.xz, theta), rd.y).xzy;

vec3 att=vec3(1);
vec3 col=vec3(0);

float dither=STEP_SIZE*IGN(floor(fragCoord),iFrame);

for(int i=0;i<40;i++)
{
    float t=(STEP_SIZE*float(i))+dither;
    
    vec3 p=ro+rd*t;
    
    #ifndef ORTHO
    if(dot_product(p)>16.*16.)
    {
        break;
    }
    #else
    if(dot_product(p)>32.*32.)
    {
        break;
    }
    #endif
    
    vec3 c;
    float d=sample_volume(p,c);
    
    if(d>0.)
    {
        col+=STEP_SIZE*att*d*sample_light(p,normalize(vec3(1,1,0)));
        
        //att *= exp(-STEP_SIZE * c * d);
        att*=exp(-STEP_SIZE*d);
    }
}

fragColor.rgb=col+att*sky(rd);

#ifdef EXPOSURE
fragColor.rgb=smoothstep(0.,1.,1.-exp(-max(fragColor.rgb,0.)*EXPOSURE));
#endif
}