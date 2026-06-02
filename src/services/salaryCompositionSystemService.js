import axiosInstance from "./axios";

// ============================================================
// API DANH MỤC THÀNH PHẦN LƯƠNG HỆ THỐNG (SalaryCompositionSystem)
// Base: /api/SalaryCompositionSystem
// ============================================================

const BASE = "/SalaryCompositionSystem";

const salaryCompositionSystemApi = {
  /**
   * Lấy TOÀN BỘ danh sách thành phần lương hệ thống (không phân trang)
   * Endpoint: GET /api/SalaryCompositionSystem
   * @returns {Promise<ServiceResponse<SalaryCompositionSystem[]>>}
   */
  getAll() {
    return axiosInstance.get(BASE);
  },

  /**
   * Lấy danh sách thành phần lương hệ thống có phân trang + tìm kiếm + sắp xếp
   * Endpoint: GET /api/SalaryCompositionSystem/Paging
   * @param {Object} params
   * @param {number}  params.pageIndex      - Trang hiện tại (bắt đầu từ 1)
   * @param {number}  params.pageSize       - Số dòng mỗi trang (default 10)
   * @param {string}  [params.search]       - Từ khóa tìm kiếm
   * @param {string}  [params.sort]         - Sắp xếp, vd: "SalaryCompositionCode DESC"
   * @param {string}  [params.searchFields] - Các field tìm kiếm
   * @returns {Promise<ServiceResponse<PagingResponse<SalaryCompositionSystem>>>}
   *          data = { total: number, data: SalaryCompositionSystem[] }
   */
  getPaging(params = {}) {
    return axiosInstance.get(`${BASE}/Paging`, { params });
  },

  /**
   * Lấy chi tiết một thành phần lương hệ thống theo ID
   * Endpoint: GET /api/SalaryCompositionSystem/{id}
   * @param {string} id - salaryCompositionSystemId (Guid)
   * @returns {Promise<ServiceResponse<SalaryCompositionSystem>>}
   */
  getById(id) {
    return axiosInstance.get(`${BASE}/${id}`);
  },

  /**
   * Tạo mới thành phần lương hệ thống
   * Endpoint: POST /api/SalaryCompositionSystem
   * @param {Object} data
   * @param {string} data.salaryCompositionCode   - Mã thành phần (bắt buộc)
   * @param {string} data.salaryCompositionName   - Tên thành phần (bắt buộc)
   * @param {string} data.compositionType         - Loại thành phần (bắt buộc)
   * @param {number} data.compositionNature       - 1=Thu nhập | 2=Khấu trừ | 3=Khác (bắt buộc)
   * @param {number} data.valueType               - 1=Số | 2=Tiền tệ | 3=% | 4=Chữ | 5=Ngày (bắt buộc)
   * @param {string} [data.taxable]               - Trạng thái tính thuế
   * @param {string} [data.taxDeduction]          - Trạng thái khấu trừ thuế
   * @param {number} [data.quota]                 - Định mức
   * @param {string} [data.formula]               - Công thức
   * @param {string} [data.description]           - Mô tả
   * @param {string} [data.optionShowPaycheck]    - Tùy chọn hiển thị phiếu lương
   * @returns {Promise<ServiceResponse<SalaryCompositionSystem>>}
   */
  create(data) {
    return axiosInstance.post(BASE, data);
  },

  /**
   * Cập nhật thành phần lương hệ thống
   * Endpoint: PUT /api/SalaryCompositionSystem/{id}
   * @param {string} id   - salaryCompositionSystemId (Guid)
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<ServiceResponse<SalaryCompositionSystem>>}
   */
  update(id, data) {
    return axiosInstance.put(`${BASE}/${id}`, data);
  },

  /**
   * Xóa một thành phần lương hệ thống
   * Endpoint: DELETE /api/SalaryCompositionSystem/{id}
   * @param {string} id - salaryCompositionSystemId (Guid)
   * @returns {Promise<ServiceResponse<void>>}
   */
  deleteById(id) {
    return axiosInstance.delete(`${BASE}/${id}`);
  },
};

export default salaryCompositionSystemApi;
