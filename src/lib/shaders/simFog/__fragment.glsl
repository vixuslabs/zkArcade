varying vec3 vPosition;

uniform vec3 userPosition; // User/Camera position
uniform float radiusTransparent; // Radius for full transparency
uniform float radiusOpaque; // Radius for full opacity

void main() {
    float distanceFromUser = length(vPosition - userPosition);
    float opacity;

    if (distanceFromUser < radiusTransparent) {
        opacity = 1.0; // Fully opaque when inside the radiusTransparent
    } else if (distanceFromUser > radiusOpaque) {
        opacity = 0.0; // Fully transparent when outside the radiusOpaque
    } else {
        // Linearly interpolate opacity between radiusTransparent and radiusOpaque
        float factor = (distanceFromUser - radiusTransparent) / (radiusOpaque - radiusTransparent);
        opacity = 1.0 - factor; // Gradually decrease opacity
    }

    gl_FragColor = vec4(0.5, 0.5, 0.5, opacity); // Grayish color for fog
}

///////////////////////

varying vec3 vPosition;

uniform vec3 userPosition; // User/Camera position
uniform float radiusTransparent; // Radius for full transparency
uniform float radiusOpaque; // Radius for full opacity

void main() {
    float distanceFromUser = length(vPosition - userPosition);
    float opacity = 0.0;

    if (distanceFromUser > radiusTransparent) {
        float delta = distanceFromUser - radiusTransparent;
        opacity = clamp(delta / (radiusOpaque - radiusTransparent), 0.0, 1.0);
    }

    gl_FragColor = vec4(0.5, 0.5, 0.5, opacity); // Grayish color for fog
}

/////////////

varying vec3 vPosition;

uniform vec3 userPosition; // User/Camera position
uniform float radiusTransparent; // Radius for full transparency
uniform float radiusOpaque; // Radius for full opacity

void main() {
    float distanceFromUser = length(vPosition - userPosition);
    float opacity;

    if (distanceFromUser < radiusTransparent) {
        opacity = 1.0; // Fully opaque when inside the radiusTransparent
    } else if (distanceFromUser > radiusOpaque) {
        opacity = 0.0; // Fully transparent when outside the radiusOpaque
    } else {
        // Linearly interpolate opacity between radiusTransparent and radiusOpaque
        float factor = (distanceFromUser - radiusTransparent) / (radiusOpaque - radiusTransparent);
        opacity = 1.0 - factor; // Gradually decrease opacity
    }

    gl_FragColor = vec4(0.5, 0.5, 0.5, opacity); // Grayish color for fog
}

/////

varying vec3 vPosition;

uniform vec3 userPosition; // User/Camera position
uniform float innerRadius; // Innermost radius, completely transparent
uniform float middleRadius; // Middle radius, transition begins
uniform float outerRadius; // Outermost radius, constant opacity

void main() {
    float distanceFromUser = length(vPosition - userPosition);
    float opacity;

    if (distanceFromUser <= innerRadius) {
        opacity = 0.0; // Completely transparent within the inner radius
    } else if (distanceFromUser > innerRadius && distanceFromUser <= middleRadius) {
        // Linearly interpolate opacity between innerRadius and middleRadius
        float factor = (distanceFromUser - innerRadius) / (middleRadius - innerRadius);
        opacity = 0.8 * factor; // Gradually increase opacity up to 80%
    } else if (distanceFromUser > middleRadius && distanceFromUser <= outerRadius) {
        opacity = 0.8; // Constant 80% opacity between middle and outer radius
    } else {
        opacity = 0.0; // Completely transparent outside the outer radius
    }

    gl_FragColor = vec4(0.5, 0.5, 0.5, opacity); // Grayish color for fog
}