precision highp float;
varying float xx, yy;
float test(vec2 p) {
	return -1.0;
}
int test_int(vec2 p) {
	return -10;
}
float test_exp(vec2 p) {
	return -1e-9;
}
void main() {
	gl_FragColor = vec3(-1e-9);
}
