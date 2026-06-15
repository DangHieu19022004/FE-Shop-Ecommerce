/**
 * Tập trung các mã lỗi nghiệp vụ (ErrorCode) được trả về từ backend trong ServiceResponse.errorCode.
 * Dùng để rẽ nhánh logic ở frontend mà KHÔNG cần so sánh chuỗi message (fragile/hardcode).
 *
 * Mirror 1-1 với ErrorCodes.cs phía backend (Payroll.Entities/Enums/ErrorCodes.cs).
 * Khi thêm code mới: thêm ở cả hai nơi cùng lúc.
 *
 * CREATED BY: TDHieu (15/06/2026)
 */
export const ErrorCodes = Object.freeze({
  /** Trùng mã thành phần lương trong bảng doanh nghiệp (pa_salary_composition) */
  DUPLICATE_SALARY_COMPOSITION_CODE: "DUPLICATE_SALARY_COMPOSITION_CODE",

  /** Trùng mã với bảng mặc định hệ thống (pa_salary_composition_system).
   *  FE hiện dialog: dùng bản ghi hệ thống hay tiếp tục tạo mới. */
  DUPLICATE_WITH_SYSTEM_CODE: "DUPLICATE_WITH_SYSTEM_CODE",
});
