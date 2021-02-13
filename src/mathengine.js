class BinOp {
  constructor(left, op, right) {
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

class Num {
  constructor(token) {
    this.type = token.type;
    this.value = token.value;
  }
}

class Var {
  constructor(token) {
    this.type = token.type;
    this.value = token.value;
  }
}

class Group {
  constructor(inside) {
    this.inside = inside;
  }
}

class Func {
  constructor(funcToken, input) {
    this.type = funcToken.type;
    this.val = funcToken.value;
    this.input = input;
  }
}

const priorities = {
  "ADD": 0,
  "SUB": 0,
  "MUL": 1,
  "DIV": 1,
  "POW": 2,
}

class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  toString() {
    return `Token(${this.type}, ${this.value})`;
  }
}
class Lexer {
  constructor(str) {
    this.str = str;
    this.currentPos = 0;
    this.currentChar = str[this.currentPos];
  }

  getNextToken() {
    while (this.currentChar != null) {
      let t = this.currentChar;
      if (t == " ") {
        this.skipWhitespace();
        continue;
      }
      if (!isNaN(t)) {
        return new Token("NUM", this.number());
      }
      if (isLetter(t)) {
        let str = this.string();
        if (str.length > 1) {
          return new Token("FUNC", str)
        } else {
          return new Token("VAR", str);
        }
      }
      if (t == '+') {
        this.advance();
        return new Token("ADD", "+");
      }
      if (t == '-') {
        this.advance();
        return new Token("SUB", "-");
      }
      if (t == '*') {
        this.advance();
        return new Token("MUL", "*");
      }
      if (t == '/') {
        this.advance();
        return new Token("DIV", "/");
      }
      if (t == '^') {
        this.advance();
        return new Token("POW", "^");
      }
      if (t == '(') {
        this.advance();
        return new Token("LP", "(");
      }
      if (t == ')') {
        this.advance();
        return new Token("RP", ")");
      }
      console.error("Unrecognized Char:", t);
    }
    return new Token("EOF", null);
  }

  advance() {
    this.currentPos += 1
    if (this.currentPos > this.str.length - 1) {
      this.currentChar = null;
    } else {
      this.currentChar = this.str[this.currentPos];
    }
  }

  number() {
    let res = '';
    while (this.currentChar != null && !isNaN(this.currentChar)) {
      res += this.currentChar;
      this.advance();
    }
    return parseFloat(res)
  }

  string() {
    let res = '';
    while (this.currentChar != null && isLetter(this.currentChar)) {
      res += this.currentChar;
      this.advance();
    }
    return res;
  }

  skipWhitespace() {
    while (this.currentChar != null && this.currentChar == " ") {
      this.advance()
    }
  }
}

function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}

class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = lexer.getNextToken();
  }

  error(str) {
    throw str;
  }

  eat(type) {
    if (this.currentToken.type == type) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      this.error(`Incorrect Token Eaten: Expected ${type} but got ${this.currentToken.type}`);
    }
  }

  parse() {
    return this.expression();
  }

  expression() {

    let token = this.currentToken;
    let lnode;

    if (token.type == "FUNC") {
      let ftype = token;
      this.eat("FUNC")
      lnode = new Func(ftype, this.expression())
    }

    if (token.type == "LP") {
      this.eat("LP");
      lnode = new Group(this.expression());
    }

    if (["NUM", "VAR"].includes(token.type)) {
      if (token.type == "NUM") {
        lnode = new Num(token);
      } else if (token.type == "VAR") {
        lnode = new Var(token);
      }
      this.eat(lnode.type);
    }

    let op = this.currentToken;
    if (["RP", "EOF"].includes(op.type)) {
      this.eat(op.type);
      return lnode;
    }
    if (op.type == "LP") {
      if (lnode instanceof Num || lnode instanceof Var || lnode instanceof Group) {
        // x (y)
        return new BinOp(lnode, new Token("MUL", "*"), this.expression());
      }
    } else if (op.type == "FUNC") {
      // x <func> (y)
      this.eat("FUNC");
      return new BinOp(lnode, new Token("MUL", "*"), new Func(op, this.expression()));
    }
    let rnode;
    if (op.type == "VAR") {
      // x y
      rnode = op;
      op = new Token("MUL", "*");
    } else {
      this.eat(op.type);
    }
    rnode = this.expression();
    if (rnode instanceof Num || rnode instanceof Var) {
      // x <op> y
      return new BinOp(lnode, op, rnode);
    } else if (rnode instanceof BinOp) {
      // x <op> y <op> z
      if (priorities[op.type] > priorities[rnode.op.type]) {
        let n = new BinOp(lnode, op, rnode.left);
        let higher_n = new BinOp(n, rnode.op, rnode.right);
        return higher_n;
      } else {
        let n = new BinOp(lnode, op, rnode);
        return n;
      }
    } else if (rnode instanceof Group || rnode instanceof Func) {
      // x <op> (y)
      let n = new BinOp(lnode, op, rnode);
      return n;
    }
  }
}
function compile(ast) {
  if (ast instanceof BinOp) {
    let funcname;
    switch (ast.op.type) {
      case 'ADD':
        funcname = "c_add";
        break;
      case 'SUB':
        funcname = "c_sub";
        break;
      case 'MUL':
        funcname = "c_mul";
        break;
      case 'DIV':
        funcname = "c_div";
        break;
      case 'POW':
        funcname = "c_pow";
        break;
    }
    return `${funcname}(${compile(ast.left)},${compile(ast.right)})`;
  }

  if (ast instanceof Num) {
    return `complex(${ast.value}, 0.0)`;
  }

  if (ast instanceof Var) {
    return ast.value;
  }

  if (ast instanceof Func) {
    let funcname;
    switch (ast.val) {
      case 'sin':
        funcname = "c_sin";
        break;
      case 'cos':
        funcname = "c_cos";
        break;
    }
    return `${funcname}(${compile(ast.input)})`;
  }

  if (ast instanceof Group) {
    return compile(ast.inside);
  }
}

function derivative(ast, resp) {
  if (ast instanceof BinOp) {
    if (ast.op.type == "MUL") {
      if (ast.left.type == "NUM") {
        return new BinOp(ast.left, ast.op, derivative(ast.right, resp));
      }
    }
    if (ast.op.type == "POW") {
      if (ast.left.type == "VAR") {
        if (ast.right.type == "NUM") {
          return new BinOp(ast.right, new Token("MUL", "*"), new BinOp(ast.left, ast.op, new Num(new Token("NUM", ast.right.value-1))));
        }
      }
    }
    if (["ADD", "SUB"].includes(ast.op.type)) {
      return new BinOp(derivative(ast.left, resp), ast.op, derivative(ast.right, resp));
    }
  }
  if (ast instanceof Num) {
    return new Num(new Token("NUM", 0))
  }
  if (ast instanceof Var) {
    if (ast.value == resp.value) {
      return new Num(new Token("NUM", 1))
    } else {
      return new Num(new Token("NUM", 0))
    }
  }
  if (ast instanceof Func) {
    let insideDer = derivative(ast.input, resp);
    let type = ast.val;
    switch (type) {
      case 'sin':
        return new BinOp(insideDer, new Token("MUL", "*"), new Func(new Token("FUNC", "cos"), ast.input))
      case 'cos':
        let s = new BinOp(insideDer, new Token("MUL", "*"), new Func(new Token("FUNC", "sin"), ast.input));
        return new BinOp(new Num(new Token("NUM", -1)), new Token("MUL", "*"), s);
      default:
        console.error("Can't take derivative of function", type);
    }
  }
  if (ast instanceof Group) {
    return derivative(ast.inside, resp);
  }
}

export {
  Lexer, Token, compile, derivative, Parser, Var, BinOp, Num, Group, Func
}
