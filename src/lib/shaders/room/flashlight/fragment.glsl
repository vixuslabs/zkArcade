uniform vec2 flashlightPosition; // The position of the flashlight in screen space
uniform float flashlightRadius; // The radius of the flashlight beam

void main() {
  vec2 screenPos = gl_FragCoord.xy / resolution.xy; // convert pixel position to screen space
  float distanceFromLight = distance(screenPos, flashlightPosition);
  float lightIntensity = smoothstep(flashlightRadius, flashlightRadius - 0.1, distanceFromLight);
  gl_FragColor = vec4(vec3(lightIntensity), 1.0);
}