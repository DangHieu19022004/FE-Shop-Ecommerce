import axiosInstance from "./axios";

// ============================================================
// API THÀNH PHẦN LƯƠNG (SalaryComposition)
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
   * @param {string}  [params.searchFields] - Các field tìm kiếm
   * @returns {Promise<ServiceResponse<PagingResponse<SalaryComposition>>>}
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
   * @returns {Promise<ServiceResponse<SalaryComposition>>}
   */
  create(data) {
    return axiosInstance.post(BASE, data);
  },

  /**
   * Cập nhật thành phần lương
   * Endpoint: PUT /api/SalaryComposition/{id}
   * @param {string} id   - salaryCompositionId (Guid)
   * @param {Object} data - Dữ liệu cập nhật
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

  /**
   * Xóa nhiều thành phần lương cùng lúc
   * Endpoint: DELETE /api/SalaryComposition/bulk
   * @param {string[]} ids - Danh sách salaryCompositionId (Guid[])
   * @returns {Promise<ServiceResponse<number>>}
   */
  deleteBulk(ids) {
    return axiosInstance.delete(`${BASE}/bulk`, { data: ids });
  },

  /**
   * Cập nhật trạng thái nhiều thành phần lương
   * Endpoint: PUT /api/SalaryComposition/bulk-status
   * @param {string[]} ids    - Danh sách salaryCompositionId
   * @param {number}   status - 1=Đang theo dõi | 2=Ngừng theo dõi
   * @returns {Promise<ServiceResponse<number>>}
   */
  updateStatusBulk(ids, status) {
    return axiosInstance.put(`${BASE}/bulk-status`, { ids, status });
  },
};

export default salaryCompositionApi;
