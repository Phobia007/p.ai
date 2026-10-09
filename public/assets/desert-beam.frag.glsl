precision highp float;
in vec3 vWorldPosition;
in vec3 vOrigin;
in vec3 vEye;
in vec3 vColor;
in float vHeight;
in float vResponse;
in vec3 vAxis;
uniform float uOpacity;
uniform float uTime;
uniform vec4 uWaterPlane;
out vec4 FragColor;
void main() {
  vec3 ray = normalize(vWorldPosition - vEye);
  vec3 across = normalize(cross(ray, vAxis));
  float offset = dot(vWorldPosition - vOrigin, across);
  float distanceToAxis = abs(offset);
  // Pixel footprint integration keeps the narrow core stable in the distance.
  float sigma = 0.006;
  float footprint = fwidth(offset);
  float resolved = sqrt(sigma * sigma + footprint * footprint * 0.16);
  float core = exp(-0.5 * pow(distanceToAxis / resolved, 2.0)) * sigma / resolved;
  float shaft = exp(-0.5 * pow(distanceToAxis / 0.018, 2.0));
  float haze = exp(-0.5 * pow(distanceToAxis / 0.052, 2.0));
  float edge = 1.0 - smoothstep(0.082, 0.112, distanceToAxis);
  float surfaceDistance = dot(uWaterPlane.xyz, vWorldPosition) + uWaterPlane.w;
  float airHeight = max(surfaceDistance, 0.0);
  float extinction = exp(-airHeight * 0.025);
  float underwaterTransmission = exp(-max(-surfaceDistance, 0.0) * 16.0);
  float skyFade = 1.0 - smoothstep(24.0, 36.0, vHeight);
  float sourceGlow = exp(-abs(surfaceDistance) * 12.0);
  float density = 0.97 + 0.03 * sin(vHeight * 1.9 - uTime * 0.22 + vOrigin.x * 3.0);
  float opticalDepth = (core * 1.35 + shaft * 0.16 + haze * 0.035) * extinction * density;
  float alpha = (1.0 - exp(-opticalDepth)) * edge * skyFade * underwaterTransmission * uOpacity;
  vec3 light = vColor * (0.85 + sourceGlow * 0.025);
  alpha = 1.0 - pow(1.0 - alpha, 2.1 * vResponse);
  FragColor = vec4(light, alpha);
}
