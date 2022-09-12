module.exports = `

precision highp float;

#define buffer_length 1000
#define samplerate 96000.0
#define pi 3.1415926536

#define TYPE_LINEAR 0
#define TYPE_LOG 1
#define TYPE_NEGATIVELOG 2



uniform lowp int uAxisTypes[2];
uniform lowp float uIR[buffer_length];

varying lowp vec2 vVertexGraphPosition;


lowp float computeLaplace(vec2 graphPosition) {


	// Sum over terms f(t)e^st
	// recall e^st = e^(re(s)t)(cos (imag s)t + i sin (imag s)t)

	lowp float re_sum = 0.0;
	lowp float im_sum = 0.0;
	lowp float t;

	for(int i = 0; i < buffer_length; i++) {

		t = float(i) / samplerate;

		re_sum += exp(graphPosition.y * t) * cos(graphPosition.x * t * 2.0 * pi) * uIR[i];
		im_sum += exp(graphPosition.y * t) * sin(graphPosition.x * t * 2.0 * pi) * uIR[i];

	}

	return re_sum;

}


lowp vec3 color_interp(lowp float x) {


	lowp vec3 min = vec3(0.5, 0.3, 1.0);
	lowp vec3 max = vec3(0.0, 1.0, 1.0);


	if(x < 0.0) {

		min.x += 0.5;
		max.x += 0.5;

		x = -x;

	}


	x = log(x);




	lowp float minX = -3.0;
	lowp float maxX = 8.0;


	if(x <= minX) {
		return vec3(1.0, 0.0, 1.0);

	}

	if(x >= maxX) {
		return vec3(1.0, 1.0, 1.0);
	}

	return min + (max - min) * ((x - minX) / (maxX - minX));

}


lowp vec3 hsv2rgb(lowp vec3 c) {

	lowp vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	lowp vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);

}



void main() {


	lowp vec2 vgp = vVertexGraphPosition;


	if(uAxisTypes[0] == TYPE_LOG) {

		vgp.x = exp(vgp.x);

	}

	if(uAxisTypes[0] == TYPE_NEGATIVELOG) {

		vgp.x = -exp(vgp.x);

	}

	if(uAxisTypes[1] == TYPE_LOG) {

		vgp.y = exp(vgp.y);

	}

	if(uAxisTypes[1] == TYPE_NEGATIVELOG) {

		vgp.y = -exp(vgp.y);

	}


	lowp float laplace = computeLaplace(vgp);

	gl_FragColor = vec4(hsv2rgb(color_interp(laplace)), 1.0);

}


`;
