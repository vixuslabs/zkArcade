uniform vec3 flashlightPosition;
uniform vec3 flashlightDirection;
uniform float circleRadius;

varying vec3 vWorldPosition; 

void main() {
  vec3 toFragment = vWorldPosition - flashlightPosition;


  float distanceAlongRay = dot(toFragment, flashlightDirection);

  // make sure the flashlight effect only works in front
  if (distanceAlongRay < 0.0) {
    gl_FragColor = vec4(vec3(0.0), 0.985); 
    return;
  }

  vec3 onRay = flashlightPosition + flashlightDirection * distanceAlongRay;
  float circleDistance = length(onRay - vWorldPosition);

  if (circleDistance >= circleRadius) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.985); 
  } else {
    discard; 
  }
}
