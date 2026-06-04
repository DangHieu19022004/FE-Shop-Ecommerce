// ============================================================
// ENUM CONSTANTS – Payroll Frontend
// Ánh xạ 1-1 với các Enum trong Backend (Payroll.Entities.Enums)
// Value là số nguyên khớp với giá trị Enum C# phía server.
// ============================================================

/**
 * SalaryCompositionNature – Tính chất thành phần lương
 * C#: SalaryCompositionNature { Income = 1, Deduction = 2, Other = 3 }
 */
export const SalaryCompositionNature = {
  Income: 1,
  Deduction: 2,
  Other: 3,
};

/**
 * Label hiển thị cho SalaryCompositionNature
 */
export const SalaryCompositionNatureLabel = {
  [SalaryCompositionNature.Income]: "Thu nhập",
  [SalaryCompositionNature.Deduction]: "Khấu trừ",
  [SalaryCompositionNature.Other]: "Khác",
};

/**
 * Options dùng cho MsSelect / MsRadio
 */
export const SalaryCompositionNatureOptions = [
  { value: SalaryCompositionNature.Income, label: "Thu nhập" },
  { value: SalaryCompositionNature.Deduction, label: "Khấu trừ" },
  { value: SalaryCompositionNature.Other, label: "Khác" },
];

// ─────────────────────────────────────────────────────────────

/**
 * SalaryCompositionStatus – Trạng thái theo dõi
 * C#: SalaryCompositionStatus { Following = 1, StoppedFollowing = 2 }
 */
export const SalaryCompositionStatus = {
  Following: 1,
  StoppedFollowing: 2,
};

export const SalaryCompositionStatusLabel = {
  [SalaryCompositionStatus.Following]: "Đang theo dõi",
  [SalaryCompositionStatus.StoppedFollowing]: "Ngừng theo dõi",
};

export const SalaryCompositionStatusOptions = [
  { value: SalaryCompositionStatus.Following, label: "Đang theo dõi" },
  { value: SalaryCompositionStatus.StoppedFollowing, label: "Ngừng theo dõi" },
];

// ─────────────────────────────────────────────────────────────

/**
 * SalaryCompositionSourceType – Nguồn gốc thành phần lương
 * C#: SalaryCompositionSourceType { Custom = 1, Default = 2 }
 */
export const SalaryCompositionSourceType = {
  Custom: 1,
  Default: 2,
};

export const SalaryCompositionSourceTypeLabel = {
  [SalaryCompositionSourceType.Custom]: "Tự thêm",
  [SalaryCompositionSourceType.Default]: "Mặc định",
};

export const SalaryCompositionSourceTypeOptions = [
  { value: SalaryCompositionSourceType.Custom, label: "Tự thêm" },
  { value: SalaryCompositionSourceType.Default, label: "Mặc định" },
];

// ─────────────────────────────────────────────────────────────

/**
 * SalaryCompositionValueType – Kiểu giá trị
 * C#: SalaryCompositionValueType { Number = 1, Currency = 2, Percentage = 3, Text = 4, Date = 5 }
 */
export const SalaryCompositionValueType = {
  Number: 1,
  Currency: 2,
  Percentage: 3,
  Text: 4,
  Date: 5,
};

export const SalaryCompositionValueTypeLabel = {
  [SalaryCompositionValueType.Number]: "Số",
  [SalaryCompositionValueType.Currency]: "Tiền tệ",
  [SalaryCompositionValueType.Percentage]: "Phần trăm",
  [SalaryCompositionValueType.Text]: "Chữ",
  [SalaryCompositionValueType.Date]: "Ngày",
};

export const SalaryCompositionValueTypeOptions = [
  { value: SalaryCompositionValueType.Number, label: "Số" },
  { value: SalaryCompositionValueType.Currency, label: "Tiền tệ" },
  { value: SalaryCompositionValueType.Percentage, label: "Phần trăm" },
  { value: SalaryCompositionValueType.Text, label: "Chữ" },
  { value: SalaryCompositionValueType.Date, label: "Ngày" },
];

// ─────────────────────────────────────────────────────────────

/**
 * SalaryCompositionShowPaycheck – Hiển thị trên phiếu lương
 * C#: SalaryCompositionShowPaycheck { Show = 1, Hide = 2, ShowIfNotZero = 3 }
 */
export const SalaryCompositionShowPaycheck = {
  Show: 1,
  Hide: 2,
  ShowIfNotZero: 3,
};

export const SalaryCompositionShowPaycheckLabel = {
  [SalaryCompositionShowPaycheck.Show]: "Có",
  [SalaryCompositionShowPaycheck.Hide]: "Không",
  [SalaryCompositionShowPaycheck.ShowIfNotZero]: "Chỉ hiển thị nếu giá trị khác 0",
};

export const SalaryCompositionShowPaycheckOptions = [
  { value: SalaryCompositionShowPaycheck.Show, label: "Có" },
  { value: SalaryCompositionShowPaycheck.Hide, label: "Không" },
  { value: SalaryCompositionShowPaycheck.ShowIfNotZero, label: "Chỉ hiển thị nếu giá trị khác 0" },
];

// ─────────────────────────────────────────────────────────────

/**
 * SalaryCompositionType – Loại thành phần lương
 * C#: CompositionType { EmployeeInfo = 1, Timekeeping = 2, Revenue = 3,
 *                       KPI = 4, Product = 5, Salary = 6,
 *                       IncomeTax = 7, Insurance = 8, Other = 9 }
 */
export const SalaryCompositionType = {
  EmployeeInfo: 1,
  Timekeeping:  2,
  Revenue:      3,
  KPI:          4,
  Product:      5,
  Salary:       6,
  IncomeTax:    7,
  Insurance:    8,
  Other:        9,
};

export const SalaryCompositionTypeLabel = {
  [SalaryCompositionType.EmployeeInfo]: "Thông tin nhân viên",
  [SalaryCompositionType.Timekeeping]:  "Chấm công",
  [SalaryCompositionType.Revenue]:      "Doanh số",
  [SalaryCompositionType.KPI]:          "KPI",
  [SalaryCompositionType.Product]:      "Sản phẩm",
  [SalaryCompositionType.Salary]:       "Lương",
  [SalaryCompositionType.IncomeTax]:    "Thuế TNCN",
  [SalaryCompositionType.Insurance]:    "Bảo hiểm - Công đoàn",
  [SalaryCompositionType.Other]:        "Khác",
};

export const SalaryCompositionTypeOptions = [
  { value: SalaryCompositionType.EmployeeInfo, label: "Thông tin nhân viên" },
  { value: SalaryCompositionType.Timekeeping,  label: "Chấm công" },
  { value: SalaryCompositionType.Revenue,      label: "Doanh số" },
  { value: SalaryCompositionType.KPI,          label: "KPI" },
  { value: SalaryCompositionType.Product,      label: "Sản phẩm" },
  { value: SalaryCompositionType.Salary,       label: "Lương" },
  { value: SalaryCompositionType.IncomeTax,    label: "Thuế TNCN" },
  { value: SalaryCompositionType.Insurance,    label: "Bảo hiểm - Công đoàn" },
  { value: SalaryCompositionType.Other,        label: "Khác" },
];

// ─────────────────────────────────────────────────────────────

/**
 * SalaryCompositionTaxable – Trạng thái chịu thuế
 * C#: SalaryCompositionTaxable { Taxable = 1, FullExempt = 2, PartialExempt = 3 }
 */
export const SalaryCompositionTaxable = {
  Taxable:       1,
  FullExempt:    2,
  PartialExempt: 3,
};

export const SalaryCompositionTaxableLabel = {
  [SalaryCompositionTaxable.Taxable]:       "Chịu thuế",
  [SalaryCompositionTaxable.FullExempt]:    "Miễn thuế toàn phần",
  [SalaryCompositionTaxable.PartialExempt]: "Miễn thuế một phần",
};

export const SalaryCompositionTaxableOptions = [
  { value: SalaryCompositionTaxable.Taxable,       label: "Chịu thuế" },
  { value: SalaryCompositionTaxable.FullExempt,    label: "Miễn thuế toàn phần" },
  { value: SalaryCompositionTaxable.PartialExempt, label: "Miễn thuế một phần" },
];

// ─────────────────────────────────────────────────────────────

/**
 * SalaryCompositionTaxDeduction – Giảm trừ khi tính thuế
 * Giá trị trong DB: 1 = Có giảm trừ, 0 = Không giảm trừ, null = N/A
 */
export const SalaryCompositionTaxDeduction = {
  Yes: 1,
  No: 0,
};

export const SalaryCompositionTaxDeductionLabel = {
  [SalaryCompositionTaxDeduction.Yes]: "Có",
  [SalaryCompositionTaxDeduction.No]: "Không",
};

export const SalaryCompositionTaxDeductionOptions = [
  { value: SalaryCompositionTaxDeduction.Yes, label: "Có" },
  { value: SalaryCompositionTaxDeduction.No, label: "Không" },
];
