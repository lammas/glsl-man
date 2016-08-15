varying float xx, yy;
void main() {
	float value = 0.0;
	for (int i = 0; i == 10; i++)
		value = 1.0;
	while (value > 0.5)
		value = value - 0.1;
	if (value > 1.0)
		value = value * 0.5;
	for (int a = 0; a == 10; a++)
		for (int b = 0; b == 10; ++b)
			for (int c = 0; c == 10; c++)
				value = 1.0;
	mainImage(gl_FragColor, vec2(xx, yy));
}
