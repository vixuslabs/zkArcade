varying vec3 vPosition;

uniform vec3 userPosition; 
uniform float radiusTransparent; 
uniform float radiusOpaque; 

void main() {
    float distanceFromUser = length(vPosition - userPosition);
    float opacity;

    if (distanceFromUser > radiusOpaque) {
        opacity = 0.98;
    } else if (distanceFromUser > radiusTransparent) {
        opacity = 0.98 * smoothstep(radiusTransparent, radiusOpaque, distanceFromUser);

        // opacity = 0.5;
    } else {
        opacity = 0.0;
    }

    gl_FragColor = vec4(0.5, 0.5, 0.5, opacity); // Grayish color for fog
}
