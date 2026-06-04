import axiosInstance from "./axios";

// ============================================================
// API CẤU HÌNH LƯỚI (GridConfig)
// Base: /api/GridConfig
// ============================================================

const BASE = "/GridConfig";

const gridConfigApi = {
  /**
   * Lấy TOÀN BỘ danh sách cấu hình lưới
   * Endpoint: GET /api/GridConfig
   * @returns {Promise<ServiceResponse<GridConfig[]>>}
   */
  getAll() {
    return axiosInstance.get(BASE);
  },

  /**
   * Lấy danh sách cấu hình lưới có phân trang
   * Endpoint: GET /api/GridConfig/Paging
   * @param {Object} params
   * @returns {Promise<ServiceResponse<PagingResponse<GridConfig>>>}
   */
  getPaging(params = {}) {
    return axiosInstance.get(`${BASE}/Paging`, { params });
  },

  /**
   * Lấy toàn bộ cấu hình cột theo tên grid
   * Endpoint: GET /api/GridConfig/ByGridName?gridName=...
   * @param {string} gridName - Tên grid (VD: "SalaryCompositionGrid")
   * @returns {Promise<ServiceResponse<GridConfig[]>>}
   */
  getByGridName(gridName) {
    return axiosInstance.get(`${BASE}/ByGridName`, { params: { gridName } });
  },

  /**
   * Lấy chi tiết một cấu hình lưới theo ID
   * Endpoint: GET /api/GridConfig/{id}
   * @param {string} id - gridConfigId (Guid)
   * @returns {Promise<ServiceResponse<GridConfig>>}
   */
  getById(id) {
    return axiosInstance.get(`${BASE}/${id}`);
  },

  /**
   * Tạo mới một cấu hình cột trong lưới
   * Endpoint: POST /api/GridConfig
   * @param {Object} data
   * @returns {Promise<ServiceResponse<GridConfig>>}
   */
  create(data) {
    return axiosInstance.post(BASE, data);
  },

  /**
   * Cập nhật cấu hình cột
   * Endpoint: PUT /api/GridConfig/{id}
   * @param {string} id   - gridConfigId (Guid)
   * @param {Object} data - Dữ liệu cập nhật (cùng cấu trúc với create)
   * @returns {Promise<ServiceResponse<GridConfig>>}
   */
  update(id, data) {
    return axiosInstance.put(`${BASE}/${id}`, data);
  },

  /**
   * Xóa một cấu hình cột
   * Endpoint: DELETE /api/GridConfig/{id}
   * @param {string} id - gridConfigId (Guid)
   * @returns {Promise<ServiceResponse<void>>}
   */
  deleteById(id) {
    return axiosInstance.delete(`${BASE}/${id}`);
  },

  /**
   * Upsert một cột: PUT nếu đã có gridConfigId, POST nếu chưa có.
   * @param {Object} data - Dữ liệu cột bao gồm gridConfigId (optional)
   * @returns {Promise<ServiceResponse<GridConfig>>}
   */
  upsertColumn(data) {
    if (data.gridConfigId) {
      return axiosInstance.put(`${BASE}/${data.gridConfigId}`, data);
    }
    return axiosInstance.post(BASE, data);
  },
};

export default gridConfigApi;
