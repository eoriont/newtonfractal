import {
  Lexer, Token, compile, derivative, Parser, Var, BinOp, Num, Group, Func
} from "./mathengine.js"
import {
  clearGL, setUniform, resizeCanvasToDisplaySize, createProgram, createShader
} from "./webgl.js"

var canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

var program;
var vertexCode, fragmentCode;

var func = "z^3 + m";

function getFragCode(func) {
  let [compiledFunc, compiledDeriv] = compileFunc(func);

  let newFragCode = fragmentCode;
  newFragCode = newFragCode.replaceAll("complex(0, 0);//%%f%%", compiledFunc);
  newFragCode = newFragCode.replaceAll("complex(0, 0);//%%fp%%", compiledDeriv);
  return newFragCode;
}

async function init() {
  vertexCode = await (await fetch('./vertex_shader.vert')).text();
  fragmentCode = await (await fetch('./fragment_shader.frag')).text();
  createCanvas();
}

function createCanvas() {
  if (!vertexCode || !fragmentCode) {
    console.warn("Vertex or Fragment code not loaded yet!")
    return
  }

  let newFragCode = getFragCode(func);

  let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexCode);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, newFragCode);

  let program;
  try {
    program = createProgram(gl, vertexShader, fragmentShader);
  } catch (e) {
    throw "Didn't compile!";
  }

  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  let positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var positions = [
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  let vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);

  let size = 2;
  let type = gl.FLOAT;
  let normalize = false;
  let stride = 0;
  let offset = 0;
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

  resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  gl.bindVertexArray(vao);

  let programLocation = gl.getParameter(gl.CURRENT_PROGRAM);
  setUniform(gl, programLocation, "1f", "width", gl.canvas.width);
  setUniform(gl, programLocation, "1f", "height", gl.canvas.height);

  render();
}

function render() {
  let gl = canvas.getContext("webgl2");

  // Draw 2 triangles in the shape of the screen
  let primitiveType = gl.TRIANGLES;
  let offset = 0;
  let count = 6;
  gl.drawArrays(primitiveType, offset, count);

  window.requestAnimationFrame(render);
}

document.addEventListener("mousemove", (e) => {
  // Don't change if modal is open
  if (modal.style.display == "block") return

  // Set mousepos uniform every time user moves mouse
  let gl = canvas.getContext("webgl2");
  let programLocation = gl.getParameter(gl.CURRENT_PROGRAM);
  if (programLocation) {
    setUniform(gl, programLocation, "2f", "mousepos", [e.clientX, e.clientY]);
  }
})

let functionBox = document.getElementById("function");
functionBox.value = func;
functionBox.addEventListener("change", (e) => {
  func = functionBox.value;
  clearGL(program);
  try {
    createCanvas();
    setError(false);
  } catch (e) {
    console.log(e)
    setError(true);
  }
})

function setError(status) {
  if (status) {
    functionBox.style.backgroundColor = "#F78167"
  } else {
    functionBox.style.backgroundColor = "#FFF"
  }
}

function compileFunc(str) {
  let lexer = new Lexer(str);
  let parser = new Parser(lexer);
  let ast = parser.parse();
  let d = derivative(ast, new Var(new Token("VAR", "z")))
  return [compile(ast), compile(d)]
}

export default init;
