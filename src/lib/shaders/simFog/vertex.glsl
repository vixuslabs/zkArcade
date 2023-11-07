varying vec3 vPosition;

void main() {
    vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}