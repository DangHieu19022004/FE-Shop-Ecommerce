import axiosInstance from "./axios";

/**
 * Mục đích: Quản lý gọi API cấu hình cột (GridConfig).
 * Sử dụng trong trường hợp: Lấy, lưu, xóa cấu hình hiển thị cột của các bảng.
 * Hàm quan trọng: getAll, getPaging, getByGridName, upsertColumn.
 * CREATED BY: TDHieu (08/06/2026)
 */
const BASE = "/GridConfig";

const gridConfigApi = {
  /**
   * Hàm dùng để: Lấy toàn bộ danh sách cấu hình cột.
   * Dùng trong trường hợp: Cần nạp cấu hình hệ thống ban đầu (không phân trang).
   * @returns {Promise<ServiceResponse<GridConfig[]>>} - Dữ liệu danh sách cấu hình.
   * CREATED BY: TDHieu (08/06/2026)
   */
  getAll() {
    return axiosInstance.get(BASE);
  },

  /**
   * Hàm dùng để: Lấy danh sách cấu hình cột có phân trang.
   * Dùng trong trường hợp: Hiển thị quản lý cấu hình nếu có màn hình riêng.
   * @param {Object} params - Tham số phân trang, tìm kiếm.
   * @returns {Promise<ServiceResponse<PagingResponse<GridConfig>>>} - Dữ liệu phân trang.
   * CREATED BY: TDHieu (08/06/2026)
   */
  getPaging(params = {}) {
    return axiosInstance.get(`${BASE}/Paging`, { params });
  },

  /**
   * Hàm dùng để: Lấy toàn bộ cấu hình cột theo tên cột.
   * Dùng trong trường hợp: Component table khởi tạo, cần biết cấu trúc cột lưu trước đó.
   * @param {string} gridName - Tên grid (VD: "SalaryCompositionGrid").
   * @returns {Promise<ServiceResponse<GridConfig[]>>} - Danh sách cấu hình cột thuộc cột.
   * CREATED BY: TDHieu (08/06/2026)
   */
  getByGridName(gridName) {
    return axiosInstance.get(`${BASE}/ByGridName`, { params: { gridName } });
  },

  /**
   * Hàm dùng để: Lấy chi tiết một cấu hình cột theo ID.
   * Dùng trong trường hợp: Xem chi tiết một bản ghi cấu hình cụ thể.
   * @param {string} id - gridConfigId (Guid).
   * @returns {Promise<ServiceResponse<GridConfig>>} - Chi tiết cấu hình cột.
   * CREATED BY: TDHieu (08/06/2026)
   */
  getById(id) {
    return axiosInstance.get(`${BASE}/${id}`);
  },

  /**
   * Hàm dùng để: Tạo mới một cấu hình cột.
   * Dùng trong trường hợp: Thêm cột mới vào cột.
   * @param {Object} data - Dữ liệu cấu hình cột.
   * @returns {Promise<ServiceResponse<GridConfig>>} - Kết quả trả về sau khi lưu.
   * CREATED BY: TDHieu (08/06/2026)
   */
  create(data) {
    return axiosInstance.post(BASE, data);
  },

  /**
   * Hàm dùng để: Cập nhật cấu hình cột.
   * Dùng trong trường hợp: Sửa chiều rộng cột, đổi vị trí ghim...
   * @param {string} id - gridConfigId (Guid).
   * @param {Object} data - Dữ liệu cần cập nhật.
   * @returns {Promise<ServiceResponse<GridConfig>>} - Kết quả trả về sau khi sửa.
   * CREATED BY: TDHieu (08/06/2026)
   */
  update(id, data) {
    return axiosInstance.put(`${BASE}/${id}`, data);
  },

  /**
   * Hàm dùng để: Xóa một cấu hình cột.
   * Dùng trong trường hợp: Xóa một cột khỏi cấu hình cột của người dùng.
   * @param {string} id - gridConfigId (Guid).
   * @returns {Promise<ServiceResponse<void>>} - Trạng thái xóa.
   * CREATED BY: TDHieu (08/06/2026)
   */
  deleteById(id) {
    return axiosInstance.delete(`${BASE}/${id}`);
  },

  /**
   * Hàm dùng để: Lưu hoặc cập nhật nhanh một cột (upsert).
   * Dùng trong trường hợp: API cần linh hoạt tự quyết định là POST (mới) hay PUT (cũ).
   * @param {Object} data - Dữ liệu cột bao gồm gridConfigId (nếu có).
   * @returns {Promise<ServiceResponse<GridConfig>>} - Cấu hình cột sau lưu.
   * CREATED BY: TDHieu (08/06/2026)
   */
  upsertColumn(data) {
    if (data.gridConfigId) {
      return axiosInstance.put(`${BASE}/${data.gridConfigId}`, data);
    }
    return axiosInstance.post(BASE, data);
  },
};

export default gridConfigApi;
