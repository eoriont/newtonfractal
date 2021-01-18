var canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");
var mousepos = [0, 0];

var program;
var vertexCode, fragmentCode;
var func = "z^3 - 1";

function getFragCode() {
  let [compiledFunc, compiledDeriv] = compileFunc(func);

  let newFragCode = fragmentCode;
  newFragCode = newFragCode.replaceAll("%%f%%", compiledFunc);
  newFragCode = newFragCode.replaceAll("%%fp%%", compiledDeriv);
  return newFragCode;
}

async function init() {
  if (!vertexCode) {
    vertexCode = await (await fetch('./vertex_shader.glsl')).text();
    fragmentCode = await (await fetch('./fragment_shader.glsl')).text();
  }

  newFragCode = getFragCode();

  let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexCode);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, newFragCode);

  let program = createProgram(gl, vertexShader, fragmentShader);

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

document.addEventListener("mousemove", (e) => {
  mousepos = [e.clientX, e.clientY]
})

let functionBox = document.getElementById("function");
functionBox.addEventListener("change", (e) => {
  func = functionBox.value;
  clearGL();
  init();
})

function compileFunc(str) {
  let lexer = new Lexer(str);
  let parser = new Parser(lexer);
  let ast = parser.parse();
  let d = derivative(ast, new Var(new Token("VAR", "z")))
  return [compile(ast), compile(d)]
}
init()
