in vec3 position;
in vec2 uv;
in mat4 instanceMatrix;
in vec3 instanceColor;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec4 uWaterPlane;
uniform vec3 uPlanetCenter;
uniform vec2 uPlanetSpread;
uniform float uPlanetStrength;
uniform vec3 uForegroundBeamAxis;
uniform vec4 uBeamOptics;
uniform vec4 uBeamProfile;
uniform vec4 uBeamAnchors[12];
uniform vec4 uBeamJacobians[12];
uniform float uBeamCompensate;
uniform float uActiveWeights[12];
uniform float uHoverWeights[12];
uniform float uCharge[12];
uniform float uBurst[12];
out vec3 vWorldPosition;
out vec3 vOrigin;
out vec3 vEye;
out vec3 vColor;
out float vHeight;
out float vResponse;
out vec3 vAxis;
out float vPulseOffset;
vec2 beamLensSource(vec2 display) {
  // Outside the viewport use a linear continuation so offscreen geometry
  // cannot fold back into the image at the polynomial lens boundary.
  vec2 p=clamp(display,vec2(-1.05),vec2(1.05));
  float edge=smoothstep(uBeamProfile.z,uBeamProfile.w,length(p*uBeamProfile.xy));
  vec2 source=p*mix(uBeamOptics.y,1.0,edge);
  source.y+=uBeamOptics.x*uBeamOptics.z*p.x*p.x*(1.0-source.y*source.y);
  return source+(display-p);
}
void main() {
  vOrigin = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  // Intersect this vertical column with the actual, animated water plane.
  // Bury its lower end so depth testing reveals it exactly at the waterline.
  float surfaceY = -(uWaterPlane.x * vOrigin.x + uWaterPlane.z * vOrigin.z + uWaterPlane.w) / uWaterPlane.y;
  vOrigin.y = surfaceY;
  vec3 directionOrigin=vOrigin;
  // The far-right beam keeps its original direction after moving into water.
  if(gl_InstanceID==2) directionOrigin=(modelMatrix*vec4(2.84,0.0,-0.91,1.0)).xyz;
  vec2 radial=(directionOrigin.xz-uPlanetCenter.xz)*uPlanetSpread*uPlanetStrength;
  vAxis=normalize(vec3(radial.x,1.0,radial.y));
  if(gl_InstanceID==3) vAxis=normalize(uForegroundBeamAxis);
  vOrigin-=vAxis*(0.4/dot(uWaterPlane.xyz,vAxis));
  vEye = -viewMatrix[3].xyz * mat3(viewMatrix);
  vHeight = (position.y + 0.5) * 36.0;
  vec3 tangent=normalize(cross(vAxis,vec3(0.0,0.0,1.0)));
  vec3 bitangent=cross(tangent,vAxis);
  vWorldPosition = vOrigin + tangent*position.x*0.115 + vAxis*vHeight + bitangent*position.z*0.115;
  vColor = instanceColor;
  int id = gl_InstanceID;
  vPulseOffset = (floor(float(id) / 2.0) + mod(float(id), 2.0) * 3.0) * 1.8;
  vResponse = 1.0 + 0.16 * uHoverWeights[id] + 0.20 * uActiveWeights[id]
    + 0.08 * uCharge[id] + 0.10 * uBurst[id];
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPosition, 1.0);
  if(uBeamCompensate>0.5 && gl_Position.w>0.0){
    vec4 a=uBeamAnchors[id],j=uBeamJacobians[id];
    vec2 offset=gl_Position.xy/gl_Position.w-a.xy;
    vec2 display=a.zw+vec2(dot(j.xy,offset),dot(j.zw,offset));
    // Precompensate only the rays. The final lens keeps the lake curved,
    // while this affine water-anchored projection remains exactly straight.
    gl_Position.xy=beamLensSource(display)*gl_Position.w;
  }
}
