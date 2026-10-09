uniform vec4 uPlanetLens;
uniform vec4 uPlanetProfile;

vec2 premanPlanetUV(vec2 inputUV) {
  vec2 p=inputUV*2.0-1.0;
  float radius=length(p*uPlanetProfile.xy);
  float edge=smoothstep(uPlanetProfile.z,uPlanetProfile.w,radius);
  float scale=mix(uPlanetLens.y,1.0,edge);
  vec2 source=p*scale;
  // Flattened planetary horizon, with a protected central lake. The bounded
  // shift keeps every sample inside the expanded camera frame, without a
  // circular crop, black corners or stretched edge pixels.
  source.y += uPlanetLens.x*uPlanetLens.z*p.x*p.x*(1.0-source.y*source.y);
  return source*0.5+0.5;
}
