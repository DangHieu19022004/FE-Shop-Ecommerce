import axiosInstance from "./axios";

// ============================================================
// API CẤU HÌNH LƯỚI (GridConfig)
// Docs: API-Frontend.md — Section 4
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
   * @param {number}  params.pageIndex      - Trang hiện tại (bắt đầu từ 1)
   * @param {number}  params.pageSize       - Số dòng mỗi trang (default 10)
   * @param {string}  [params.search]       - Từ khóa tìm kiếm
   * @param {string}  [params.sort]         - Sắp xếp
   * @param {string}  [params.searchFields] - Các field tìm kiếm
   * @returns {Promise<ServiceResponse<PagingResponse<GridConfig>>>}
   */
  getPaging(params = {}) {
    return axiosInstance.get(`${BASE}/Paging`, { params });
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
   * @param {string}  data.gridName         - Tên grid (vd: "SalaryCompositionGrid")
   * @param {string}  [data.columnName]     - Tên cột (vd: "SalaryCompositionCode")
   * @param {string}  [data.columnCaption]  - Tiêu đề hiển thị (vd: "Mã thành phần")
   * @param {number}  [data.columnWidth]    - Độ rộng cột (pixel)
   * @param {boolean} [data.isVisible]      - Có hiển thị hay không
   * @param {string}  [data.pinnedPosition] - Vị trí ghim: "left" | "right" | null
   * @param {number}  [data.displayOrder]   - Thứ tự hiển thị
   * @param {boolean} [data.allowFilter]    - Có cho phép lọc hay không
   * @param {string}  [data.filterType]     - Kiểu lọc: "text" | "number" | "date"
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
};

export default gridConfigApi;
