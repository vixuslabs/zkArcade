varying vec3 vPosition;
varying vec3 vWorldPosition;
    
void main() {
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
}