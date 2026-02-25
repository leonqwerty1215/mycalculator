/**
 * Expression parser and evaluator for graphing calculator.
 * Supports: + - * / ^ ( ) numbers, x, sin cos tan log ln sqrt abs
 */

const Parser = (function () {
  let input;
  let pos;
  let angleMode = 'rad'; // 'rad' | 'deg'

  function isDigit(ch) {
    return ch >= '0' && ch <= '9';
  }

  function isSpace(ch) {
    return ch === ' ' || ch === '\t';
  }

  function peek() {
    return input[pos] || '';
  }

  function advance() {
    return input[pos++] || '';
  }

  function skipSpaces() {
    while (isSpace(peek())) advance();
  }

  function parseNumber() {
    let s = '';
    if (peek() === '-') {
      s += advance();
      skipSpaces();
    }
    while (isDigit(peek())) s += advance();
    if (peek() === '.') {
      s += advance();
      while (isDigit(peek())) s += advance();
    }
    if (s === '' || s === '-') return null;
    return parseFloat(s);
  }

  function parseIdentifier() {
    let s = '';
    const start = pos;
    while (/[a-zA-Z_0-9]/.test(peek())) s += advance();
    return s || null;
  }

  function toRadians(rad) {
    return angleMode === 'deg' ? (rad * Math.PI) / 180 : rad;
  }

  function parsePrimary() {
    skipSpaces();
    const ch = peek();
    if (ch === '(') {
      advance();
      skipSpaces();
      const expr = parseExpression();
      skipSpaces();
      if (peek() === ')') advance();
      return expr;
    }
    if (ch === '-') {
      advance();
      skipSpaces();
      const p = parsePrimary();
      return p != null ? (x) => -(typeof p === 'function' ? p(x) : p) : null;
    }
    const num = parseNumber();
    if (num !== null) return () => num;
    const id = parseIdentifier();
    if (id) {
      if (id === 'x' || id === 'X') return (x) => x;
      if (id === 'e') return () => Math.E;
      if (id === 'pi' || id === 'π') return () => Math.PI;
      if (id === 'sin') {
        skipSpaces();
        if (peek() === '(') advance();
        const arg = parseExpression();
        skipSpaces();
        if (peek() === ')') advance();
        return arg != null ? (x) => Math.sin(toRadians(typeof arg === 'function' ? arg(x) : arg)) : null;
      }
      if (id === 'cos') {
        skipSpaces();
        if (peek() === '(') advance();
        const arg = parseExpression();
        skipSpaces();
        if (peek() === ')') advance();
        return arg != null ? (x) => Math.cos(toRadians(typeof arg === 'function' ? arg(x) : arg)) : null;
      }
      if (id === 'tan') {
        skipSpaces();
        if (peek() === '(') advance();
        const arg = parseExpression();
        skipSpaces();
        if (peek() === ')') advance();
        return arg != null ? (x) => Math.tan(toRadians(typeof arg === 'function' ? arg(x) : arg)) : null;
      }
      if (id === 'log') {
        skipSpaces();
        if (peek() === '(') advance();
        const arg = parseExpression();
        skipSpaces();
        if (peek() === ')') advance();
        return arg != null ? (x) => Math.log10(typeof arg === 'function' ? arg(x) : arg) : null;
      }
      if (id === 'ln') {
        skipSpaces();
        if (peek() === '(') advance();
        const arg = parseExpression();
        skipSpaces();
        if (peek() === ')') advance();
        return arg != null ? (x) => Math.log(typeof arg === 'function' ? arg(x) : arg) : null;
      }
      if (id === 'sqrt') {
        skipSpaces();
        if (peek() === '(') advance();
        const arg = parseExpression();
        skipSpaces();
        if (peek() === ')') advance();
        return arg != null ? (x) => Math.sqrt(typeof arg === 'function' ? arg(x) : arg) : null;
      }
      if (id === 'abs') {
        skipSpaces();
        if (peek() === '(') advance();
        const arg = parseExpression();
        skipSpaces();
        if (peek() === ')') advance();
        return arg != null ? (x) => Math.abs(typeof arg === 'function' ? arg(x) : arg) : null;
      }
    }
    return null;
  }

  function parsePower() {
    let left = parsePrimary();
    if (left === null) {
      const id = parseIdentifier();
      if (id === 'x' || id === 'X') left = (x) => x;
    }
    if (left === null) return null;
    skipSpaces();
    if (peek() === '^') {
      advance();
      skipSpaces();
      const right = parsePower();
      if (right === null) return null;
      return (x) => Math.pow(typeof left === 'function' ? left(x) : left, typeof right === 'function' ? right(x) : right);
    }
    return left;
  }

  function parseTerm() {
    let left = parsePower();
    if (left === null) return null;
    while (true) {
      skipSpaces();
      const op = peek();
      if (op === '*' || op === '/') {
        advance();
        skipSpaces();
        let right = parsePower();
        if (right === null) {
          const id = parseIdentifier();
          if (id === 'x' || id === 'X') right = (x) => x;
        }
        if (right === null) return null;
        if (op === '*') left = (x) => (typeof left === 'function' ? left(x) : left) * (typeof right === 'function' ? right(x) : right);
        else left = (x) => (typeof left === 'function' ? left(x) : left) / (typeof right === 'function' ? right(x) : right);
      } else break;
    }
    return left;
  }

  function parseExpression() {
    let left = parseTerm();
    if (left === null) {
      const id = parseIdentifier();
      if (id === 'x' || id === 'X') left = (x) => x;
    }
    if (left === null) return null;
    while (true) {
      skipSpaces();
      const op = peek();
      if (op === '+' || op === '-') {
        advance();
        skipSpaces();
        let right = parseTerm();
        if (right === null) {
          const id = parseIdentifier();
          if (id === 'x' || id === 'X') right = (x) => x;
        }
        if (right === null) return null;
        if (op === '+') left = (x) => (typeof left === 'function' ? left(x) : left) + (typeof right === 'function' ? right(x) : right);
        else left = (x) => (typeof left === 'function' ? left(x) : left) - (typeof right === 'function' ? right(x) : right);
      } else break;
    }
    return left;
  }

  function parse(str, options = {}) {
    angleMode = options.angleMode || 'rad';
    input = String(str).replace(/\s+/g, ' ').trim();
    pos = 0;
    const fn = parseExpression();
    if (!fn || pos < input.length) return null;
    return fn;
  }

  function evaluate(str, x, options = {}) {
    const fn = parse(str, options);
    if (!fn) return NaN;
    try {
      return fn(x);
    } catch {
      return NaN;
    }
  }

  return { parse, evaluate, setAngleMode: (m) => { angleMode = m; } };
})();
