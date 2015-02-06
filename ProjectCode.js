//SARA ABU-GHNAIM
//PROJECT A 

//HOPEFULLY  A WINDCHIME

//a) Draw several moving, turning, jointed colored shapes with openGL’s basic drawing primitives
//(various forms of points, lines and triangles, etc.) using vertex buffer objects full of 3D vertex attributes. 

//b) Use a glModelView-like matrix stack to transform those shapes them interactively,

//c) Ensure that parts of your on-screen image move continuously without user input (animation) and

//d) Make some parts of at least one jointed object move smoothly in response to keyboard and mouse inputs.

//plan
     //first, make the original primitive (DONE)
     //make copies of it, translated and rotated (DONE)
     //make it stop with html button (DONE)
     //fill in the colors, make it solid from wireframe (DONE)
     //then make a string to hang them from string (DONE)

     //add a line as a different primitive, as line, and hang it as string (DONE)
     
     //how i fixed the shader problem and color not rendering: needed to actually 
     //declare the colors inside the matrix 'vertices', alongside the vertices coordinates
     //and g_fragcolor = v_color

    //FIND A WAY TO ROTATE EACH ON ITS OWN AXIS, then on a global axis (DONE)
    // ^ did this with POPPING AND PUSHING MATRIX
    //want to pop the matrix when you go back to the normal axis, so can start
    //from the beginning 
    

    //paul OH:
    //change the vertices to be triangles (DONE)
     //OR two calls with triangle fan. then have one rotated and scaled. (DONE) 

// Vertex shader program----------------------------------
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
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
  'precision mediump float;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' + //teal color 
  '}\n';
//  Each instance computes all the on-screen attributes for just one PIXEL.
// here we do the bare minimum: if we draw any part of any drawing primitive in 
// any pixel, we simply set that pixel to the constant color specified here.


// Global Variable -- Rotation angle rate (degrees/second)
var ANGLE_STEP = 45.0;

var vertices = new Float32Array ([

    //with triangles primitives
    //front face XY
    0.25, -0.6, 0.1, 1,    0.0, 0.4, 0.4, //vertex that connects all triangles 
    0.00, 0.00, 0.00,1,    0.0, 1.0, 0.2, 
    0.5, 0, 0, 1.00,       0.0, 1.0, 0.0,

    //YZ on the left 
    0.25, -0.6, 0.1, 1,    0.0, 0.4, 0.0,
    0, 0, 0.2, 1.00,          0.0, 0.5, 1.0,   //this second segment is the colors
    0, 0.00, 0.00,1.00,    0.0, 0.7, 1.0,

    //back XY face
    0.25, -0.6, 0.1, 1,    1.0, 0.4, 0.0,
    0, 0, 0.2, 1.00,        0.0, 0.2, 0.9, 
    0.5, 0.0, 0.2, 1.00,    0.0, 1, 1.0, 

    //YZ on the right 
    0.25, -0.6, 0.1, 1,     0.0, 0.2, 0.6,
    0.5, 0.0, 0.2, 1.0,     0.0, 0.2, 0.6,
    0.5, 0.0, 0.0, 1.0,     1, 1, 1,


//JK DONT HAVE TO MAKE A FUCKIN TOP ONE BECAUSE I CAN ROTATE AND 
//TRANSLATE THE FIRST ONE

  ]);

  var rope = new Float32Array([ 
      0.25, 0, 0.1, 1.0,   1, 1, 1,
      0.25, 1, 0.1, 1.0,   1, 1, 1, 
      

    ]);

    // Create a buffer object
  var vertexBuffer ;
  var vertexBuffer2;
  var a_Position;
  var a_Color;

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

    // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("keyup", myKeyUp, false);
  window.addEventListener("keypress", myKeyPress, false);

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
    draw(gl, n, 2, currentAngle, modelMatrix, u_ModelMatrix);   // Draw the chime
    //draw(gl, p, currentAngle, modelMatrix, u_ModelMatrix); //draw the rope
    requestAnimationFrame(tick, canvas);   // Request that the browser ?calls tick
  };
  tick();
}

function initVertexBuffers(gl) {
//==============================================================================
  
  var n = 12;   // The number of vertices

//already declared it here initializing to a value 
  vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  vertexBuffer2 = gl.createBuffer();
  if (!vertexBuffer2) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Assign the buffer object to a_Position variable
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

   // Get graphics system's handle for our Vertex Shader's color-input variable;
   a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }

    // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer2); //for the rope 

  gl.bufferData(gl.ARRAY_BUFFER, rope, gl.STATIC_DRAW);


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


  return n;
  return p;
}

//YO THIS IS the whole drawing axes 

//add p as parameter when doing rope
function draw(gl, n, p, currentAngle, modelMatrix, u_ModelMatrix) { 
//==============================================================================
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  clrColr = new Float32Array(4);
  clrColr = gl.getParameter(gl.COLOR_CLEAR_VALUE);
  //console.log("clear value:", clrColr);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  var FSIZE = vertices.BYTES_PER_ELEMENT;
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE * 7, 0); //stride bytes 
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 4, 0);

  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Color);
  

//first bottom
  modelMatrix.setTranslate(0.2, 0.5, 0);  // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV. 
  

  modelMatrix.rotate(currentAngle*2, 1, currentAngle, 0);  // Make new drawing axes that
              // that spin around z axis (0,0,1) of the previous 
              // drawing axes, using the same origin.
  modelMatrix.translate(-0.2, -0.4,0);            // Move box so that we pivot
            // around the MIDDLE of it's lower edge, and not the left corner.

  pushMatrix(modelMatrix);  
  // DRAW BOX:  Use this matrix to transform & draw our VBo's contents:
      // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw the rectangle held in the VBO we created in initVertexBuffers().
  gl.drawArrays(gl.TRIANGLES, 0, n);


//third whole chime 
  modelMatrix.setTranslate(-0.3, -0.2, 0);  // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV. 
  modelMatrix.scale(1,0.7,1); //affects the whole second chime
  //thirs chiem goes faster by 4 times 
  modelMatrix.rotate(currentAngle*4, 1, currentAngle, 0);  // Make new drawing axes that
              // that spin around z axis (0,0,1) of the previous 
              // drawing axes, using the same origin.
  modelMatrix.translate(-0.2, -0.4,0);            // Move box so that we pivot
            // around the MIDDLE of it's lower edge, and not the left corner.

  pushMatrix(modelMatrix);  
  // DRAW BOX:  Use this matrix to transform & draw our VBo's contents:
      // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw the rectangle held in the VBO we created in initVertexBuffers().
  gl.drawArrays(gl.TRIANGLES, 0, n);

  gl.drawArrays(gl.TRIANGLES, 0, p);
  pushMatrix(modelMatrix);
  modelMatrix = popMatrix();

//third top pyramid

    modelMatrix.translate(0.5, 0, 0.2);       // Make new drawing axes that
              // we moved upwards (+y) measured in prev. drawing axes, and
              // moved rightwards (+x) by half the width of the box we just drew.
  
  //want to elongate this chime arm

  //modelMatrix.scale(1,0.4,1);       // Make new drawing axes that
              // are smaller that the previous drawing axes by 0.6.
  modelMatrix.rotate(180, 90, 1, 0);  //makes the top hat upside down 

  modelMatrix.scale(1,Math.sin(currentAngle/20),1);
  //this makes it bob up and down


   gl.drawArrays(gl.TRIANGLES, 0, n);

  modelMatrix.translate(-0.5, 0, 0);   //centers on bottom pyramid 

  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);


  modelMatrix = popMatrix();

  //==================

//this is the first

  modelMatrix.setTranslate(0.5, 0.2, 0.2);  // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV. 
  
  modelMatrix.rotate(currentAngle*1.5, 1, currentAngle, 0);  // Make new drawing axes that
              // that spin around z axis (0,0,1) of the previous 
              // drawing axes, using the same origin.
  modelMatrix.translate(-0.2, -0.9,0);  
  modelMatrix.scale(0.5,0.4,1);          // Move box so that we pivot
            // around the MIDDLE of it's lower edge, and not the left corner.

  pushMatrix(modelMatrix);  
  // DRAW BOX:  Use this matrix to transform & draw our VBo's contents:
      // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw the rectangle held in the VBO we created in initVertexBuffers().
  gl.drawArrays(gl.TRIANGLES, 0, n);




  modelMatrix = popMatrix();  

//THE TOP PYRAMID 
  modelMatrix.translate(0.5, 0, 0.2);       // Make new drawing axes that
              // we moved upwards (+y) measured in prev. drawing axes, and
              // moved rightwards (+x) by half the width of the box we just drew.
  
  //want to elongate this chime arm

  modelMatrix.scale(1,0.6,1);       // Make new drawing axes that
              // are smaller that the previous drawing axes by 0.6.
  modelMatrix.rotate(180, 90, 1, 0);  //makes the top hat upside down 


  modelMatrix.translate(-0.5, 0, 0);   //centers on bottom pyramid 

  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);


  modelMatrix = popMatrix();
  //dont want to push, need new aves 
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   modelMatrix.translate(0.5, 0, 0.2);       // Make new drawing axes that
              // we moved upwards (+y) measured in prev. drawing axes, and
              // moved rightwards (+x) by half the width of the box we just drew.
  
  //want to elongate this chime arm

 
  modelMatrix.rotate(180, 90, 1, 0);  //makes the top hat upside down 
  modelMatrix.rotate(currentAngle, 1, 0, 1 ); 
  //THIS MAKES IT JOINTED
  
  //modelMatrix.scale(1.2,1,0.2);       // Make new drawing axes that
              // are smaller that the previous drawing axes by 0.6.

  modelMatrix.translate(-0.5, 0, 0);   //centers on bottom pyramid 

  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 0, n);

  pushMatrix(modelMatrix);
  modelMatrix = popMatrix();
 //SECOND TOP PART
  modelMatrix.translate(0.5, 0, 0.2);       // Make new drawing axes that
              // we moved upwards (+y) measured in prev. drawing axes, and
              // moved rightwards (+x) by half the width of the box we just drew.
  
  //want to elongate this chime arm

 
  modelMatrix.rotate(180, 90, 1, 0);  //makes the top hat upside down 
  modelMatrix.rotate(currentAngle, 1, 0, 1 ); 
  //THIS MAKES IT JOINTED
  
  modelMatrix.scale(1,0.2,1);       // Make new drawing axes that
              // are smaller that the previous drawing axes by 0.6.

  modelMatrix.translate(-0.5, 0, 0);   //centers on bottom pyramid 

  // DRAW BOX: Use this matrix to transform & draw our VBO's contents:

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 0, n);

  pushMatrix(modelMatrix);
  modelMatrix = popMatrix();

  //new Matrix4([1, 0, 0, 0,
    //                        0, 1, 0, 0,
      //                      0, 0, 1, 0,
        //                    0, 0, 0, 1,
          //                  ]);

//_______
//binding for the rope

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer2);

  var FSIZE = rope.BYTES_PER_ELEMENT;
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE * 7, 0); //stride bytes 
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 4, 0);
  
  //==========================

  //first string 

  modelMatrix.scale(0, Math.sin(currentAngle/40)*3, 0); 
  modelMatrix.rotate(currentAngle, 1, 1, 0); 

 // modelMatric.rotate()
  
  pushMatrix(modelMatrix);  
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINES, 0, 2);
  modelMatrix = popMatrix();  

  //------------------------------

//second string 
  modelMatrix.scale(0, -Math.sin(currentAngle/40), 0); 

  //modelMatrix.rotate(currentAngle*0.1, 0, 1, 0); 
  pushMatrix(modelMatrix);  
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  modelMatrix = popMatrix();  
    gl.drawArrays(gl.LINES, 0, 2);

      // Draw the rectangle held in the VBO we created in initVertexBuffers().





  //=======================================================

  //CLICK AND DRAG WONT WORK 
  //var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
  //modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);
      

  
  // SAVE CURRENT DRAWING AXES HERE--------------------------
  //  copy current matrix so that we can return to these same drawing axes
  // later, when we draw the UPPER jaw of the robot pincer.  HOW?
  // Try a 'push-down stack'.  We want to 'push' our current modelMatrix
  // onto the stack to save it; then later 'pop' when we're ready to draw
  // the upper pincer.
  //----------------------------------------------------------



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
  if(angle >   0.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
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

//HTML BUTTONS
function runStop() {
  if(ANGLE_STEP*ANGLE_STEP > 1) {
    myTmp = ANGLE_STEP;
    ANGLE_STEP = 0;
  }
  else {
    ANGLE_STEP = myTmp;
  }
}

//to print user instructions
function showDiv() {
   document.getElementById('welcomeDiv').style.display = "block";
}


function myKeyDown(ev) {
//===============================================================================
// Called when user presses down ANY key on the keyboard, and captures the 
// keyboard's scancode or keycode(varies for different countries and alphabets).
//  CAUTION: You may wish to avoid 'keydown' and 'keyup' events: if you DON'T 
// need to sense non-ASCII keys (arrow keys, function keys, pgUp, pgDn, Ins, 
// Del, etc), then just use the 'keypress' event instead.
//   The 'keypress' event captures the combined effects of alphanumeric keys and // the SHIFT, ALT, and CTRL modifiers.  It translates pressed keys into ordinary
// ASCII codes; you'll get the ASCII code for uppercase 'S' if you hold shift 
// and press the 's' key.
// For a light, easy explanation of keyboard events in JavaScript,
// see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
// For a thorough explanation of the messy way JavaScript handles keyboard events
// see:    http://javascript.info/tutorial/keyboard-events
//

  switch(ev.keyCode) {      // keycodes !=ASCII, but are very consistent for 
  //  nearly all non-alphanumeric keys for nearly all keyboards in all countries.
    case 37:    // left-arrow key
      // print in console:
      console.log(' left-arrow.');
      // and print on webpage in the <div> element with id='Result':
      document.getElementById('Result').innerHTML =
        ' Left Arrow:keyCode='+ev.keyCode;
      break;
    case 38:    // up-arrow key
      console.log('   up-arrow.');
      document.getElementById('Result').innerHTML =
        '   Up Arrow:keyCode='+ev.keyCode;
      break;
    case 39:    // right-arrow key
      console.log('right-arrow.');
      document.getElementById('Result').innerHTML =
        'Right Arrow:keyCode='+ev.keyCode;
      break;
    case 40:    // down-arrow key
      console.log(' down-arrow.');
      document.getElementById('Result').innerHTML =
        ' Down Arrow:keyCode='+ev.keyCode;
      break;
    default:
      console.log('myKeyDown()--keycode=', ev.keyCode, ', charCode=', ev.charCode);
      document.getElementById('Result').innerHTML =
        'myKeyDown()--keyCode='+ev.keyCode;
      break;
  }
}

function myKeyUp(ev) {
//===============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well

  console.log('myKeyUp()--keyCode='+ev.keyCode+' released.');
}

function myKeyPress(ev) {
//===============================================================================
// Best for capturing alphanumeric keys and key-combinations such as 
// CTRL-C, alt-F, SHIFT-4, etc.
  console.log('myKeyPress():keyCode='+ev.keyCode  +', charCode=' +ev.charCode+
                        ', shift='    +ev.shiftKey + ', ctrl='    +ev.ctrlKey +
                        ', altKey='   +ev.altKey   +
                        ', metaKey(Command key or Windows key)='+ev.metaKey);
}