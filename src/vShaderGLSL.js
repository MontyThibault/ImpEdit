module.exports = `


#define TYPE_LINEAR 0
#define TYPE_LOG 1
#define TYPE_NEGATIVELOG 2


uniform lowp int uAxisTypes[2];

attribute vec2 aVertexScreenPosition;
attribute vec2 aVertexGraphPosition;

varying lowp vec2 vVertexGraphPosition;


void main() {

	gl_Position = vec4(aVertexScreenPosition, 0.0, 1.0);


	vVertexGraphPosition = aVertexGraphPosition;

	if((uAxisTypes[0] == TYPE_LOG) || (uAxisTypes[0] == TYPE_NEGATIVELOG)) {

		vVertexGraphPosition.x = log(abs(vVertexGraphPosition.x));

	}


	if((uAxisTypes[1] == TYPE_LOG) || (uAxisTypes[1] == TYPE_NEGATIVELOG)) {

		vVertexGraphPosition.y = log(abs(vVertexGraphPosition.y));

	}

}			

`;