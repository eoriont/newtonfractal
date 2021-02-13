function createShader(gl, type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader); let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  let program = gl.createProgram();

  try {
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
  } catch (e) {
    throw "Didn't compile!"
  }


  gl.linkProgram(program);
  let success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program
  }
  // console.log(gl.getProgramInfoLog(program))
  gl.deleteProgram(program);
}

function resizeCanvasToDisplaySize(canvas) {
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  const needResize = canvas.width !== displayWidth ||
    canvas.height !== displayHeight

  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}

function setUniform(gl, program, type, name, value) {
  let location = gl.getUniformLocation(program, name);

  if (type === "1f") {
    gl.uniform1f(location, value);
  } else if (type === "2f") {
    gl.uniform2f(location, value[0], value[1]);
  } else if (type === "3f") {
    gl.uniform3f(location, value[0], value[1], value[2]);
  }
}

function clearGL(program) {
  let gl = canvas.getContext("webgl2")
  gl.deleteProgram(program)
}

export {
  clearGL, setUniform, resizeCanvasToDisplaySize, createProgram, createShader
}
