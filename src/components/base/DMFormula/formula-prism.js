import { highlight, languages } from 'prismjs/components/prism-core';

// ── Định nghĩa ngôn ngữ "formula" cho Prism ──────────────────────────────────
// Thứ tự khai báo quan trọng: pattern nào khai báo trước có độ ưu tiên cao hơn.
languages.formula = {
  // 1. Hàm (function keyword) – phải đứng trước variable để không bị "nuốt"
  'function': {
    pattern: /\b(SUM|IF|AND|OR|ROUND|DATE|MONTH|TODAY|INT)\b/i,
    greedy: true,
  },

  // 2. Số (integer + float)
  'number': {
    pattern: /\b\d+(\.\d+)?\b/,
    greedy: true,
  },

  // 3. Chuỗi (nếu sau này cần hỗ trợ "text")
  'string': {
    pattern: /"[^"]*"|'[^']*'/,
    greedy: true,
  },

  // 4. Operator: = >= <= > < + - * /
  'operator': />=|<=|<>|[+\-*\/=><]/,

  // 5. Dấu ngoặc & phân cách
  'punctuation': /[(),;]/,

  // 6. Biến/tham số lương – UPPERCASE + dấu gạch dưới
  //    Phải đứng CUỐI để không override function
  'variable': {
    pattern: /\b[A-Z_][A-Z0-9_]*\b/,
    greedy: true,
  },
};

/**
 * Highlight một đoạn công thức theo ngôn ngữ "formula".
 * @param {string} code
 * @returns {string} HTML string
 */
export function highlightFormula(code) {
  return highlight(code, languages.formula, 'formula');
}
