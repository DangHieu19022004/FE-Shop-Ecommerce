import axiosInstance from "./axios";

// ============================================================
// API THÀNH PHẦN LƯƠNG (SalaryComposition)
// Docs: API-Frontend.md — Section 5
// Base: /api/SalaryComposition
// ============================================================

const BASE = "/SalaryComposition";

const salaryCompositionApi = {
  /**
   * Lấy TOÀN BỘ danh sách thành phần lương (không phân trang)
   * Endpoint: GET /api/SalaryComposition
   * @returns {Promise<ServiceResponse<SalaryComposition[]>>}
   */
  getAll() {
    return axiosInstance.get(BASE);
  },

  /**
   * Lấy danh sách thành phần lương có phân trang + tìm kiếm + sắp xếp
   * Endpoint: GET /api/SalaryComposition/Paging
   * @param {Object} params
   * @param {number}  params.pageIndex    - Trang hiện tại (bắt đầu từ 1)
   * @param {number}  params.pageSize     - Số dòng mỗi trang (default 10)
   * @param {string}  [params.search]     - Từ khóa tìm kiếm
   * @param {string}  [params.sort]       - Sắp xếp, vd: "SalaryCompositionCode DESC"
   * @param {string}  [params.searchFields] - Các field tìm kiếm, vd: "SalaryCompositionCode,SalaryCompositionName"
   * @returns {Promise<ServiceResponse<PagingResponse<SalaryComposition>>>}
   *          data = { total: number, data: SalaryComposition[] }
   */
  getPaging(params = {}) {
    return axiosInstance.get(`${BASE}/Paging`, { params });
  },

  /**
   * Lấy chi tiết một thành phần lương theo ID
   * Endpoint: GET /api/SalaryComposition/{id}
   * @param {string} id - salaryCompositionId (Guid)
   * @returns {Promise<ServiceResponse<SalaryComposition>>}
   */
  getById(id) {
    return axiosInstance.get(`${BASE}/${id}`);
  },

  /**
   * Tạo mới thành phần lương
   * Endpoint: POST /api/SalaryComposition
   * @param {Object} data
   * @param {string} data.salaryCompositionCode   - Mã thành phần lương (bắt buộc)
   * @param {string} data.salaryCompositionName   - Tên thành phần lương (bắt buộc)
   * @param {string} data.compositionType         - Loại thành phần (bắt buộc)
   * @param {number} data.compositionNature       - 1=Thu nhập | 2=Khấu trừ | 3=Khác (bắt buộc)
   * @param {number} data.valueType               - 1=Số | 2=Tiền tệ | 3=% | 4=Chữ | 5=Ngày (bắt buộc)
   * @param {number} data.sourceType              - 1=Tự thêm | 2=Mặc định (bắt buộc)
   * @param {number} data.status                  - 1=Đang theo dõi | 2=Ngừng theo dõi (bắt buộc)
   * @param {number} [data.quota]                 - Định mức
   * @param {string} [data.formula]               - Công thức
   * @param {string} [data.description]           - Mô tả
   * @param {string} [data.taxable]               - Trạng thái tính thuế
   * @param {string} [data.taxDeduction]          - Trạng thái khấu trừ thuế
   * @param {string} [data.optionShowPaycheck]    - Tùy chọn hiển thị phiếu lương
   * @returns {Promise<ServiceResponse<SalaryComposition>>}
   */
  create(data) {
    return axiosInstance.post(BASE, data);
  },

  /**
   * Cập nhật thành phần lương
   * Endpoint: PUT /api/SalaryComposition/{id}
   * @param {string} id   - salaryCompositionId (Guid)
   * @param {Object} data - Dữ liệu cập nhật (cùng cấu trúc với create)
   * @returns {Promise<ServiceResponse<SalaryComposition>>}
   */
  update(id, data) {
    return axiosInstance.put(`${BASE}/${id}`, data);
  },

  /**
   * Xóa một thành phần lương
   * Endpoint: DELETE /api/SalaryComposition/{id}
   * @param {string} id - salaryCompositionId (Guid)
   * @returns {Promise<ServiceResponse<void>>}
   */
  deleteById(id) {
    return axiosInstance.delete(`${BASE}/${id}`);
  },
};

export default salaryCompositionApi;
