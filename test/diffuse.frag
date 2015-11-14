precision highp float;
uniform mat4 modelview;
uniform mat4 view;
uniform vec4 ambient;
uniform vec4 diffuse;
uniform float specularStrength;
uniform int specularPower;
uniform vec3 lightDirection;
uniform vec4 lightColor;
uniform float lightIntensity;
uniform float shadowBias;
uniform sampler2D diffuse0;
uniform sampler2D shadow0;
uniform int hasFloat;
uniform int useVSM;
uniform int useShadows;
uniform int receiveShadows;
varying vec2 uv0;
varying vec4 worldPosition;
varying vec3 worldNormal;
varying vec4 viewPosition;
varying vec3 viewNormal;
varying vec4 shadowPosition;
float unpack(vec4 c) {
	const vec4 bitShifts = vec4(1.0 / ((255.0 * 255.0) * 255.0), 1.0 / (255.0 * 255.0), 1.0 / 255.0, 1.0);
	return dot(c, bitShifts);
}
vec4 lighting(float shadow) {
	vec4 textureColor = texture2D(diffuse0, uv0);
	vec3 N = normalize(viewNormal);
	vec3 L = normalize(mat3(view) * lightDirection);
	vec3 V = normalize(-viewPosition.xyz);
	vec3 H = normalize(L + V);
	float diffuseLight = max(dot(N, L), 0.0) * lightIntensity;
	float specularLight = min(max(dot(N, H), 0.0), 1.0);
	specularLight = pow(specularLight, float(specularPower));
	vec4 ambientColor = ambient * textureColor;
	vec4 diffuseColor = (((diffuse * diffuse) * textureColor) * lightColor) * diffuseLight;
	vec4 specularColor = (lightColor * specularLight) * specularStrength;
	return ambientColor + ((diffuseColor + specularColor) * shadow);
}
float linstep(float low, float high, float v) {
	return clamp((v - low) / (high - low), 0.0, 1.0);
}
float VSM(vec2 moments, float compare) {
	float p = smoothstep(compare - shadowBias, compare, moments.x);
	float variance = max(moments.y - (moments.x * moments.x), -0.001);
	float d = compare - moments.x;
	float p_max = linstep(0.2, 1.0, variance / (variance + (d * d)));
	return clamp(max(p, p_max), 0.0, 1.0);
}
float shadowmap() {
	vec2 uv = shadowPosition.xy / shadowPosition.w;
	uv = (uv * 0.5) + 0.5;
	vec4 shadowTexel = texture2D(shadow0, uv);
	float depth;
	if (hasFloat == 1) {
		depth = shadowTexel.r;
	}
	else {
		depth = unpack(shadowTexel);
	}
	float lightDepth = (shadowPosition.z + 1.0) * 0.5;
	if (useVSM == 1) {
		return VSM(shadowTexel.xy, lightDepth);
	}
	return step(lightDepth - shadowBias, depth);
}
void main() {
	float shadow = 1.0;
	if ((useShadows > 0) && (receiveShadows > 0)) {
		shadow = shadowmap();
	}
	vec4 color = lighting(shadow);
	gl_FragColor = clamp(color, 0.0, 1.0);
}
