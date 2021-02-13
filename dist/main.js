(()=>{"use strict";class e{constructor(e,t,n){this.left=e,this.op=t,this.right=n}}class t{constructor(e){this.type=e.type,this.value=e.value}}class n{constructor(e){this.type=e.type,this.value=e.value}}class r{constructor(e){this.inside=e}}class i{constructor(e,t){this.type=e.type,this.val=e.value,this.input=t}}const s={ADD:0,SUB:0,MUL:1,DIV:1,POW:2};class a{constructor(e,t){this.type=e,this.value=t}toString(){return`Token(${this.type}, ${this.value})`}}class c{constructor(e){this.str=e,this.currentPos=0,this.currentChar=e[this.currentPos]}getNextToken(){for(;null!=this.currentChar;){let e=this.currentChar;if(" "!=e){if(!isNaN(e))return new a("NUM",this.number());if(o(e)){let e=this.string();return e.length>1?new a("FUNC",e):new a("VAR",e)}if("+"==e)return this.advance(),new a("ADD","+");if("-"==e)return this.advance(),new a("SUB","-");if("*"==e)return this.advance(),new a("MUL","*");if("/"==e)return this.advance(),new a("DIV","/");if("^"==e)return this.advance(),new a("POW","^");if("("==e)return this.advance(),new a("LP","(");if(")"==e)return this.advance(),new a("RP",")");console.error("Unrecognized Char:",e)}else this.skipWhitespace()}return new a("EOF",null)}advance(){this.currentPos+=1,this.currentPos>this.str.length-1?this.currentChar=null:this.currentChar=this.str[this.currentPos]}number(){let e="";for(;null!=this.currentChar&&!isNaN(this.currentChar);)e+=this.currentChar,this.advance();return parseFloat(e)}string(){let e="";for(;null!=this.currentChar&&o(this.currentChar);)e+=this.currentChar,this.advance();return e}skipWhitespace(){for(;null!=this.currentChar&&" "==this.currentChar;)this.advance()}}function o(e){return 1===e.length&&e.match(/[a-z]/i)}class h{constructor(e){this.lexer=e,this.currentToken=e.getNextToken()}error(e){throw e}eat(e){this.currentToken.type==e?this.currentToken=this.lexer.getNextToken():this.error(`Incorrect Token Eaten: Expected ${e} but got ${this.currentToken.type}`)}parse(){return this.expression()}expression(){let c,o=this.currentToken;if("FUNC"==o.type){let e=o;this.eat("FUNC"),c=new i(e,this.expression())}"LP"==o.type&&(this.eat("LP"),c=new r(this.expression())),["NUM","VAR"].includes(o.type)&&("NUM"==o.type?c=new t(o):"VAR"==o.type&&(c=new n(o)),this.eat(c.type));let h,u=this.currentToken;if(["RP","EOF"].includes(u.type))return this.eat(u.type),c;if("LP"==u.type){if(c instanceof t||c instanceof n||c instanceof r)return new e(c,new a("MUL","*"),this.expression())}else if("FUNC"==u.type)return this.eat("FUNC"),new e(c,new a("MUL","*"),new i(u,this.expression()));if("VAR"==u.type?(h=u,u=new a("MUL","*")):this.eat(u.type),h=this.expression(),h instanceof t||h instanceof n)return new e(c,u,h);if(h instanceof e){if(s[u.type]>s[h.op.type]){let t=new e(c,u,h.left);return new e(t,h.op,h.right)}return new e(c,u,h)}return h instanceof r||h instanceof i?new e(c,u,h):void 0}}function u(s){if(s instanceof e){let e;switch(s.op.type){case"ADD":e="c_add";break;case"SUB":e="c_sub";break;case"MUL":e="c_mul";break;case"DIV":e="c_div";break;case"POW":e="c_pow"}return`${e}(${u(s.left)},${u(s.right)})`}if(s instanceof t)return`complex(${s.value}, 0.0)`;if(s instanceof n)return s.value;if(s instanceof i){let e;switch(s.val){case"sin":e="c_sin";break;case"cos":e="c_cos"}return`${e}(${u(s.input)})`}return s instanceof r?u(s.inside):void 0}function l(s,c){if(s instanceof e){if("MUL"==s.op.type&&"NUM"==s.left.type)return new e(s.left,s.op,l(s.right,c));if("POW"==s.op.type&&"VAR"==s.left.type&&"NUM"==s.right.type)return new e(s.right,new a("MUL","*"),new e(s.left,s.op,new t(new a("NUM",s.right.value-1))));if(["ADD","SUB"].includes(s.op.type))return new e(l(s.left,c),s.op,l(s.right,c))}if(s instanceof t)return new t(new a("NUM",0));if(s instanceof n)return s.value==c.value?new t(new a("NUM",1)):new t(new a("NUM",0));if(s instanceof i){let n=l(s.input,c),r=s.val;switch(r){case"sin":return new e(n,new a("MUL","*"),new i(new a("FUNC","cos"),s.input));case"cos":let c=new e(n,new a("MUL","*"),new i(new a("FUNC","sin"),s.input));return new e(new t(new a("NUM",-1)),new a("MUL","*"),c);default:console.error("Can't take derivative of function",r)}}return s instanceof r?l(s.inside,c):void 0}function f(){let e=canvas.getContext("webgl2"),t=e.getParameter(e.CURRENT_PROGRAM);p(e,t,"2f","mousepos",mousepos);let n=e.TRIANGLES;offset=0,e.drawArrays(n,offset,6),window.requestAnimationFrame(f)}function w(e,t,n){let r=e.createShader(t);if(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))return r;console.log(e.getShaderInfoLog(r)),e.deleteShader(r)}function p(e,t,n,r,i){let s=e.getUniformLocation(t,r);"1f"===n?e.uniform1f(s,i):"2f"===n?e.uniform2f(s,i[0],i[1]):"3f"===n&&e.uniform3f(s,i[0],i[1],i[2])}var d=document.getElementById("canvas");const g=d.getContext("webgl2");var v,U,y="z^3 - 1";function A(){let[e,t]=function(e){let t=new c(e),r=new h(t).parse(),i=l(r,new n(new a("VAR","z")));return[u(r),u(i)]}(y),r=U;return r=r.replaceAll("%%f%%",e),r=r.replaceAll("%%fp%%",t),r}async function m(){v||(v=await(await fetch("./vertex_shader.glsl")).text(),U=await(await fetch("./fragment_shader.glsl")).text());let e=A(),t=w(g,g.VERTEX_SHADER,v),n=w(g,g.FRAGMENT_SHADER,e),r=function(e,t,n){let r=e.createProgram();if(e.attachShader(r,t),e.attachShader(r,n),e.linkProgram(r),e.getProgramParameter(r,e.LINK_STATUS))return r;console.log(e.getProgramInfoLog(r)),e.deleteProgram(r)}(g,t,n),i=g.getAttribLocation(r,"a_position"),s=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,s),g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),g.STATIC_DRAW);let a=g.createVertexArray();g.bindVertexArray(a),g.enableVertexAttribArray(i);let c=g.FLOAT;g.vertexAttribPointer(i,2,c,!1,0,0),function(e){const t=e.clientWidth,n=e.clientHeight;(e.width!==t||e.height!==n)&&(e.width=t,e.height=n)}(d),g.viewport(0,0,g.canvas.width,g.canvas.height),g.clearColor(0,0,0,0),g.clear(g.COLOR_BUFFER_BIT),g.useProgram(r),g.bindVertexArray(a);let o=g.getParameter(g.CURRENT_PROGRAM);p(g,o,"1f","width",g.canvas.width),p(g,o,"1f","height",g.canvas.height),f()}document.addEventListener("mousemove",(e=>{e.clientX,e.clientY}));let C=document.getElementById("function");C.addEventListener("change",(e=>{y=C.value,canvas.getContext("webgl2").deleteProgram(program),m()})),m()})();