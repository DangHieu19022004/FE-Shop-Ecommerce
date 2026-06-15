import { EXCEL_FORMULAS } from "../../../constants/formulaTemplate.js";

const NUMBER_PATTERN = /^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/;
const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const INVALID_STRUCTURE_MESSAGE = "Sai cấu trúc hàm/phép tính";
const MISSING_COMPONENT_MESSAGE = "Công thức chứa thành phần lương không tồn tại";

class FormulaValidationError extends Error {}
class MissingSalaryCompositionError extends FormulaValidationError {}

const FUNCTION_ARGUMENT_RULES = {
  SUM: { min: 2, max: Number.POSITIVE_INFINITY },
  IF: { min: 1, max: 3 },
  IFS: { min: 2, max: Number.POSITIVE_INFINITY, multipleOf: 2 },
  AND: { min: 2, max: 2 },
  OR: { min: 2, max: 2 },
  ROUND: { min: 2, max: 2 },
  ROUNDUP: { min: 2, max: 2 },
  ROUNDDOWN: { min: 2, max: 2 },
  INT: { min: 1, max: 1 },
  DATE: { min: 3, max: 3 },
  DATEDIF: { min: 3, max: 3 },
  TODAY: { min: 0, max: 0 },
  DAY: { min: 1, max: 1 },
  MONTH: { min: 1, max: 1 },
  YEAR: { min: 1, max: 1 },
  DINHMUC: { min: 1, max: 1 },
  CHINHTHUC: { min: 1, max: 1 },
  THUVIEC: { min: 1, max: 1 },
  HOCVIEC: { min: 1, max: 1 },
};

function tokenize(source) {
  const tokens = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    const rest = source.slice(index);
    const numberMatch = rest.match(/^(?:\d+(?:\.\d+)?|\.\d+)/);
    if (numberMatch) {
      tokens.push({ type: "number", value: numberMatch[0] });
      index += numberMatch[0].length;
      continue;
    }

    const identifierMatch = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (identifierMatch) {
      tokens.push({ type: "identifier", value: identifierMatch[0] });
      index += identifierMatch[0].length;
      continue;
    }

    if (char === '"') {
      let end = index + 1;
      while (end < source.length && source[end] !== '"') {
        if (source[end] === "\\") end += 1;
        end += 1;
      }
      if (end >= source.length) {
        throw new FormulaValidationError("Chuỗi trong công thức chưa được đóng");
      }
      tokens.push({ type: "string", value: source.slice(index, end + 1) });
      index = end + 1;
      continue;
    }

    const twoCharacterOperator = rest.slice(0, 2);
    if ([">=", "<=", "<>", "=="].includes(twoCharacterOperator)) {
      tokens.push({ type: "operator", value: twoCharacterOperator });
      index += 2;
      continue;
    }

    if (["+", "-", "*", "/", "^", ">", "<", "="].includes(char)) {
      tokens.push({ type: "operator", value: char });
      index += 1;
      continue;
    }

    if (["(", ")", ","].includes(char)) {
      tokens.push({ type: char, value: char });
      index += 1;
      continue;
    }

    throw new FormulaValidationError(`Ký tự "${char}" không hợp lệ trong công thức`);
  }

  tokens.push({ type: "eof", value: "" });
  return tokens;
}

class FormulaParser {
  constructor(source, parameterCodes) {
    this.tokens = tokenize(source);
    this.position = 0;
    this.parameterCodes = parameterCodes;
    this.formulas = new Map(
      EXCEL_FORMULAS.map((formula) => [formula.name.toUpperCase(), formula]),
    );
  }

  current() {
    return this.tokens[this.position];
  }

  consume(type, value) {
    const token = this.current();
    if (token.type !== type || (value && token.value !== value)) return null;
    this.position += 1;
    return token;
  }

  expect(type, message) {
    const token = this.consume(type);
    if (!token) throw new FormulaValidationError(message);
    return token;
  }

  parse() {
    if (this.current().type === "eof") {
      throw new FormulaValidationError("Công thức chưa có nội dung");
    }
    this.parseComparison();
    if (this.current().type !== "eof") {
      throw new FormulaValidationError(
        `Cú pháp không hợp lệ tại "${this.current().value}"`,
      );
    }
  }

  parseComparison() {
    this.parseAdditive();
    while (
      this.current().type === "operator" &&
      [">", "<", ">=", "<=", "=", "==", "<>"].includes(this.current().value)
    ) {
      this.position += 1;
      this.parseAdditive();
    }
  }

  parseAdditive() {
    this.parseMultiplicative();
    while (
      this.current().type === "operator" &&
      ["+", "-"].includes(this.current().value)
    ) {
      this.position += 1;
      this.parseMultiplicative();
    }
  }

  parseMultiplicative() {
    this.parsePower();
    while (
      this.current().type === "operator" &&
      ["*", "/"].includes(this.current().value)
    ) {
      this.position += 1;
      this.parsePower();
    }
  }

  parsePower() {
    this.parseUnary();
    while (this.consume("operator", "^")) this.parseUnary();
  }

  parseUnary() {
    if (
      this.current().type === "operator" &&
      ["+", "-"].includes(this.current().value)
    ) {
      this.position += 1;
      this.parseUnary();
      return;
    }
    this.parsePrimary();
  }

  parsePrimary() {
    if (this.consume("number") || this.consume("string")) return;

    if (this.consume("(")) {
      this.parseComparison();
      this.expect(")", "Công thức thiếu dấu đóng ngoặc )");
      return;
    }

    const identifier = this.consume("identifier");
    if (!identifier) {
      const value = this.current().value || "cuối công thức";
      throw new FormulaValidationError(`Thiếu tham số hoặc toán hạng tại ${value}`);
    }

    if (this.consume("(")) {
      this.parseFunction(identifier.value);
      return;
    }

    const normalizedIdentifier = identifier.value.toUpperCase();
    if (["TRUE", "FALSE"].includes(normalizedIdentifier)) return;
    if (!this.parameterCodes.has(normalizedIdentifier)) {
      throw new MissingSalaryCompositionError(MISSING_COMPONENT_MESSAGE);
    }
  }

  parseFunction(functionName) {
    const normalizedName = functionName.toUpperCase();
    const formula = this.formulas.get(normalizedName);
    if (!formula) {
      throw new FormulaValidationError(`Hàm "${functionName}" không được hỗ trợ`);
    }

    let argumentCount = 0;
    if (!this.consume(")")) {
      do {
        this.parseComparison();
        argumentCount += 1;
      } while (this.consume(","));
      this.expect(")", `Hàm ${normalizedName} thiếu dấu đóng ngoặc )`);
    }

    const rule = FUNCTION_ARGUMENT_RULES[normalizedName];
    const { min, max, multipleOf } = rule;
    if (
      argumentCount < min ||
      argumentCount > max ||
      (multipleOf && argumentCount % multipleOf !== 0)
    ) {
      const expected = Number.isFinite(max) && min === max
        ? `${min}`
        : Number.isFinite(max)
          ? `từ ${min} đến ${max}`
          : `ít nhất ${min}`;
      throw new FormulaValidationError(
        `Hàm ${normalizedName} cần ${expected} tham số`,
      );
    }
  }
}

export function validateFormula(value, parameters = [], variables = []) {
  const input = String(value ?? "").trim();
  if (!input) return [];
  if (NUMBER_PATTERN.test(input)) return [];

  const parameterCodes = new Set(
    [...parameters.map((item) => item?.code), ...variables]
      .filter(Boolean)
      .map((code) => String(code).trim().toUpperCase()),
  );

  if (!input.startsWith("=")) {
    if (!IDENTIFIER_PATTERN.test(input)) {
      return [INVALID_STRUCTURE_MESSAGE];
    }
    return parameterCodes.has(input.toUpperCase())
      ? []
      : [MISSING_COMPONENT_MESSAGE];
  }

  try {
    new FormulaParser(input.slice(1), parameterCodes).parse();
    return [];
  } catch (error) {
    return [
      error instanceof MissingSalaryCompositionError
        ? MISSING_COMPONENT_MESSAGE
        : INVALID_STRUCTURE_MESSAGE,
    ];
  }
}
