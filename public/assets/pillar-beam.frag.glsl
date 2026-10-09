precision highp float;
in vec3 vWorldPosition;
in vec3 vOrigin;
in vec3 vEye;
in vec3 vColor;
in float vHeight;
in float vResponse;
in vec3 vAxis;
in float vPulseOffset;
uniform float uPulseTime;
uniform float uPulseEnabled;
uniform float uNightMode;
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
  // A single narrow crest with a soft trailing wake, staggered around the lake.
  float pulseHeight = mod(uPulseTime + vPulseOffset, 10.8) * 3.0 - 0.8;
  float delta = airHeight - pulseHeight;
  float crest = exp(-0.5 * pow(delta / 0.28, 2.0));
  float wake = exp(min(delta / 0.85, 0.0)) * smoothstep(0.0, 0.18, -delta);
  float pulse = (crest * 0.78 + wake * 0.30) * uPulseEnabled
    * smoothstep(0.0, 0.6, airHeight) * (1.0 - smoothstep(16.0, 23.0, airHeight));
  float opticalDepth = (core * 1.35 + shaft * 0.16 + haze * 0.035) * extinction * density * (1.0 + pulse * 0.45);
  float alpha = (1.0 - exp(-opticalDepth)) * edge * skyFade * underwaterTransmission * uOpacity;
  vec3 light = vColor * vResponse * (0.42 + sourceGlow * 0.025);
  vec3 pearl = mix(vec3(0.64, 0.57, 0.46), vColor * 1.15, uNightMode);
  light = mix(light, pearl, min(pulse, 0.82));
  FragColor = vec4(light, alpha);
}
