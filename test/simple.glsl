void func(vec2 uv, float alpha) {
	float a;
	vec4 c = vec4(uv.x, uv.y, 1.0, alpha);
	gl_FragColor = c;
}
