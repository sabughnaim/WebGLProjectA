//SARA ABU-GHNAIM
//PROJECT A 

//hopefully a wndchime 

//plan
     //first, make the original primitive (DONE)
     //make copies of it, translated and rotated


//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_

// RotatingTranslatedTriangleJT.js  MODIFIED for EECS 351-1, 
//                  Northwestern Univ. Jack Tumblin
//    (converted to 2D->4D; 3 verts --> 6 verts, 2 triangles arranged as long 
//    (rectangle with small gap fills one single Vertex Buffer Object (VBO);
//    (draw same rectangle over and over, but with different matrix tranforms
//    (found from a tree of transformations to construct a jointed 'robot arm'
//

// Vertex shader program----------------------------------
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '}\n';
// Each instance computes all the on-screen attributes for just one VERTEX,
// specifying that vertex so that it can be used as part of a drawing primitive
// depicted in the CVV coord. system (+/-1, +/-1, +/-1) that fills our HTML5
// 'canvas' object.  The program gets all its info for that vertex through the
// 'attribute vec4' variable a_Position, which feeds it values for one vertex 
// taken from from the Vertex Buffer Object (VBO) we created inside the graphics
// hardware by calling the 'initVertexBuffers()' function.
//
//    ?What other vertex attributes can you set within a Vertex Shader? Color?
//    surface normal? texture coordinates?
//    ?How could you set each of these attributes separately for each vertex in
//    our VBO?  Could you store them in the VBO? Use them in the Vertex Shader?

// Fragment shader program----------------------------------
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);\n' +
  '}\n';
//  Each instance computes all the on-screen attributes for just one PIXEL.
// here we do the bare minimum: if we draw any part of any drawing primitive in 
// any pixel, we simply set that pixel to the constant color specified here.


// Global Variable -- Rotation angle rate (degrees/second)
var ANGLE_STEP = 45.0;

function main() {
//==============================================================================
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Write the positions of vertices into an array, transfer
  // array contents to a Vertex Buffer Object created in the
  // graphics hardware.
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Get storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Current rotation angle
  var currentAngle = 0.0;
  // Model matrix
  var modelMatrix = new Matrix4();

  // Start drawing
  var tick = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw the triangle
    requestAnimationFrame(tick, canvas);   // Request that the browser ?calls tick
  };
  tick();
}

function initVertexBuffers(gl) {
//==============================================================================
  var vertices = new Float32Array ([

    //inside triangle 
     0.00, 0.00, 0.00, 1.00,    
     0.50, 0.00, 0.00, 1.00,  
     0.25, -0.60, 0.00, 1.00,
     0.00, 0.00, 0.00, 1.00,
  
    //outside triangle
     0.50, 0.00, 0.20, 1.00,  
     0.25, -0.60, 0.00, 1.00,
     0.00, 0.00, 0.20, 1.00,
     0.20, 0.00, 0.20, 1.00,
     
     0.0, 0.00, 0.00, 1.00,    
     0.25, 0.2, 0.00, 1.00, //top tip of top cone   
     0.5, 0.0, 0.0, 1.00, //return to base 
     0.5, 0.0, 0.2, 1.00,
    
    //tryina get this top part of the cone right
     0.0, 0.0, 0.20, 1.00,
     0.25, 0.2, 0.00, 1.00,
     0.25, 0.2, 0.00, 1.00,
     0.5, 0.0, 0.2, 1.00,
     
     0.0, 0.0, 0.00, 1.00,

  ]);
  var n = 18;   // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Assign the buffer object to a_Position variable
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, 0, 0);
  // websearch yields OpenGL version: 
  //    http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml
        //  glVertexAttributePointer (
        //      index == which attribute variable will we use?
        //      size == how many dimensions for this attribute: 1,2,3 or 4?
        //      type == what data type did we use for those numbers?
        //      isNormalized == are these fixed-point values that we need
        //            normalize before use? true or false
        //      stride == #bytes (of other, interleaved data) between OUR values?
        //      pointer == offset; how many (interleaved) values to skip to reach
        //          our first value?
        //        )
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  return n;
}


//YO THIS IS the whole drawing axes 

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Build our Robot Arm by successively moving our drawing axes
  //-------Draw Lower Arm---------------
  modelMatrix.setTranslate(0.6,0, 0);  // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV. 
  
  modelMatrix.rotate(currentAngle, 1, 0, 0);  // Make new drawing axes that
              // that spin around z axis (0,0,1) of the previous 
              // drawing axes, using the same origin.
  modelMatrix.translate( -0.3, 0,0);            // Move box so that we pivot
              // around the MIDDLE of it's lower edge, and not the left corner.
  // DRAW BOX:  Use this matrix to transform & draw our VBo's contents:
      // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw the rectangle held in the VBO we created in initVertexBuffers().
  gl.drawArrays(gl.LINE_LOOP, 0, n/4);
  gl.drawArrays(gl.LINE_LOOP, n/4, n/4); 
  gl.drawArrays(gl.LINE_LOOP, n/2, n/4);
  gl.drawArrays(gl.LINE_LOOP, 3*n/4, n/4);  


//THE SECOND CHIME ARM 
  modelMatrix.translate(-0.05, 0, 0.2);       // Make new drawing axes that
              // we moved upwards (+y) measured in prev. drawing axes, and
              // moved rightwards (+x) by half the width of the box we just drew.
  
  //want to elongate this chime arm

  modelMatrix.scale(0.5,0.9,0.5);       // Make new drawing axes that
              // are smaller that the previous drawing axes by 0.6.
  modelMatrix.rotate(0, 0,1,0);  // Make new drawing axes that
              // spin around Z axis (0,0,1) of the previous drawing 
              // axes, using the same origin.
  modelMatrix.translate(-0.5, 0, 0);      // Make new drawing axes that
              // move sideways by half the width of our rectangle model
              // (REMEMBER! modelMatrix.scale() DIDN'T change the 
              // the vertices of our model stored in our VBO; instead
              // we changed the DRAWING AXES used to draw it. Thus
              // we translate by the 0.1, not 0.1*0.6.)
  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
  //COMMENTED OUT, SARA
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 0, n/4);
  gl.drawArrays(gl.LINE_LOOP, n/4, n/4); 
  gl.drawArrays(gl.LINE_LOOP, n/2, n/4);
  gl.drawArrays(gl.LINE_LOOP, 3*n/4, n/4);
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //THE THIRD CHIME ARM 
  modelMatrix.translate(-0.1, 0, -0.2);       // Make new drawing axes that
              // we moved upwards (+y) measured in prev. drawing axes, and
              // moved rightwards (+x) by half the width of the box we just drew.
  
//make this one a little thinner in z 

  modelMatrix.scale(1,1,0.5);       // Make new drawing axes that
              // are smaller that the previous drawing axes by 0.6.
  modelMatrix.rotate(0, 0.5, 0,0);  // Make new drawing axes that
              // spin around Z axis (0,0,1) of the previous drawing 
              // axes, using the same origin.
  modelMatrix.translate(-0.5, 0, 0);      // Make new drawing axes that
              // move sideways by half the width of our rectangle model
              // (REMEMBER! modelMatrix.scale() DIDN'T change the 
              // the vertices of our model stored in our VBO; instead
              // we changed the DRAWING AXES used to draw it. Thus
              // we translate by the 0.1, not 0.1*0.6.)
  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:
  //COMMENTED OUT, SARA
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, 0, n/4);
  gl.drawArrays(gl.LINE_LOOP, n/4, n/4); 
  gl.drawArrays(gl.LINE_LOOP, n/2, n/4);
  gl.drawArrays(gl.LINE_LOOP, 3*n/4, n/4);
  //=======================================================


  modelMatrix.translate(0, 0, 0.0); // Make new drawing axes at 
              // the robot's "wrist" -- at the center top of upper arm
  
  // SAVE CURRENT DRAWING AXES HERE--------------------------
  //  copy current matrix so that we can return to these same drawing axes
  // later, when we draw the UPPER jaw of the robot pincer.  HOW?
  // Try a 'push-down stack'.  We want to 'push' our current modelMatrix
  // onto the stack to save it; then later 'pop' when we're ready to draw
  // the upper pincer.
  //----------------------------------------------------------
  pushMatrix(modelMatrix);
  modelMatrix = popMatrix();
}

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
  if(angle >   .0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
  if(angle <  360.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

function moreCCW() {
//==============================================================================

  ANGLE_STEP += 10; 
}

function lessCCW() {
//==============================================================================
  ANGLE_STEP -= 10; 
}
