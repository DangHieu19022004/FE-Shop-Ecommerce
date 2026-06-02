import axiosInstance from "./axios";

// ============================================================
// API ĐƠN VỊ / PHÒNG BAN (Organization)
// Docs: API-Frontend.md — Section 3
// Base: /api/Organization
// ============================================================

const BASE = "/Organization";

const organizationApi = {
  /**
   * Lấy TOÀN BỘ danh sách đơn vị (không phân trang)
   * Endpoint: GET /api/Organization
   * Dùng khi cần load toàn bộ đơn vị cho dropdown / tree
   * @returns {Promise<ServiceResponse<Organization[]>>}
   */
  getAll() {
    return axiosInstance.get(BASE);
  },

  /**
   * Lấy danh sách đơn vị có phân trang + tìm kiếm + sắp xếp
   * Endpoint: GET /api/Organization/Paging
   * @param {Object} params
   * @param {number}  params.pageIndex      - Trang hiện tại (bắt đầu từ 1)
   * @param {number}  params.pageSize       - Số dòng mỗi trang (default 10)
   * @param {string}  [params.search]       - Từ khóa tìm kiếm
   * @param {string}  [params.sort]         - Sắp xếp, vd: "OrganizationCode DESC"
   * @param {string}  [params.searchFields] - Các field tìm kiếm, vd: "OrganizationCode,OrganizationName"
   * @returns {Promise<ServiceResponse<PagingResponse<Organization>>>}
   *          data = { total: number, data: Organization[] }
   *
   * @example
   * GET /api/Organization/Paging?search=HR&pageSize=10&pageIndex=1&sort=OrganizationCode DESC&searchFields=OrganizationCode,OrganizationName
   */
  getPaging(params = {}) {
    return axiosInstance.get(`${BASE}/Paging`, { params });
  },

  /**
   * Lấy chi tiết một đơn vị theo ID
   * Endpoint: GET /api/Organization/{id}
   * @param {string} id - organizationId (Guid)
   * @returns {Promise<ServiceResponse<Organization>>}
   */
  getById(id) {
    return axiosInstance.get(`${BASE}/${id}`);
  },

  /**
   * Tạo mới đơn vị
   * Endpoint: POST /api/Organization
   * @param {Object} data
   * @param {string} data.organizationCode - Mã đơn vị (bắt buộc)
   * @param {string} data.organizationName - Tên đơn vị (bắt buộc)
   * @returns {Promise<ServiceResponse<Organization>>}
   */
  create(data) {
    return axiosInstance.post(BASE, data);
  },

  /**
   * Cập nhật đơn vị
   * Endpoint: PUT /api/Organization/{id}
   * @param {string} id   - organizationId (Guid)
   * @param {Object} data - Dữ liệu cập nhật
   * @param {string} data.organizationCode - Mã đơn vị
   * @param {string} data.organizationName - Tên đơn vị
   * @returns {Promise<ServiceResponse<Organization>>}
   */
  update(id, data) {
    return axiosInstance.put(`${BASE}/${id}`, data);
  },

  /**
   * Xóa một đơn vị
   * Endpoint: DELETE /api/Organization/{id}
   * @param {string} id - organizationId (Guid)
   * @returns {Promise<ServiceResponse<void>>}
   */
  deleteById(id) {
    return axiosInstance.delete(`${BASE}/${id}`);
  },
};

export default organizationApi;
