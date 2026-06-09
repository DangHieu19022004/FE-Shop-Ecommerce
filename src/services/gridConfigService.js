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
   * Lấy toàn bộ danh sách cấu hình cột.
   *
   * Sử dụng khi: Cần nạp cấu hình hệ thống ban đầu (không phân trang).
   *
   * @returns {Promise<ServiceResponse<GridConfig[]>>} Dữ liệu danh sách cấu hình
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  getAll() {
    return axiosInstance.get(BASE);
  },

  /**
   * Lấy danh sách cấu hình cột có phân trang.
   *
   * Sử dụng khi: Hiển thị quản lý cấu hình nếu có màn hình riêng.
   *
   * @param {Object} params Tham số phân trang, tìm kiếm
   * @returns {Promise<ServiceResponse<PagingResponse<GridConfig>>>} Dữ liệu phân trang
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  getPaging(params = {}) {
    return axiosInstance.get(`${BASE}/Paging`, { params });
  },

  /**
   * Lấy toàn bộ cấu hình cột theo tên cột.
   *
   * Sử dụng khi: Component table khởi tạo, cần biết cấu trúc cột lưu trước đó.
   *
   * @param {string} gridName Tên grid (VD: "SalaryCompositionGrid")
   * @returns {Promise<ServiceResponse<GridConfig[]>>} Danh sách cấu hình cột thuộc bảng đó
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  getByGridName(gridName) {
    return axiosInstance.get(`${BASE}/ByGridName`, { params: { gridName } });
  },

  /**
   * Lấy chi tiết một cấu hình cột theo ID.
   *
   * Sử dụng khi: Xem chi tiết một bản ghi cấu hình cụ thể.
   *
   * @param {string} id gridConfigId (Guid)
   * @returns {Promise<ServiceResponse<GridConfig>>} Chi tiết cấu hình cột
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  getById(id) {
    return axiosInstance.get(`${BASE}/${id}`);
  },

  /**
   * Tạo mới một cấu hình cột.
   *
   * Sử dụng khi: Thêm cột mới vào bảng.
   *
   * @param {Object} data Dữ liệu cấu hình cột
   * @returns {Promise<ServiceResponse<GridConfig>>} Kết quả trả về sau khi lưu
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  create(data) {
    return axiosInstance.post(BASE, data);
  },

  /**
   * Cập nhật cấu hình cột.
   *
   * Sử dụng khi: Sửa chiều rộng cột, đổi vị trí ghim...
   *
   * @param {string} id gridConfigId (Guid)
   * @param {Object} data Dữ liệu cần cập nhật
   * @returns {Promise<ServiceResponse<GridConfig>>} Kết quả trả về sau khi sửa
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  update(id, data) {
    return axiosInstance.put(`${BASE}/${id}`, data);
  },

  /**
   * Xóa một cấu hình cột.
   *
   * Sử dụng khi: Xóa một cột khỏi cấu hình bảng của người dùng.
   *
   * @param {string} id gridConfigId (Guid)
   * @returns {Promise<ServiceResponse<void>>} Trạng thái xóa
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  deleteById(id) {
    return axiosInstance.delete(`${BASE}/${id}`);
  },

  /**
   * Lưu hoặc cập nhật nhanh một cột (upsert).
   *
   * Sử dụng khi: API cần linh hoạt tự quyết định là POST (mới) hay PUT (cũ).
   *
   * @param {Object} data Dữ liệu cột bao gồm gridConfigId (nếu có)
   * @returns {Promise<ServiceResponse<GridConfig>>} Cấu hình cột sau lưu
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  upsertColumn(data) {
    if (data.gridConfigId) {
      return axiosInstance.put(`${BASE}/${data.gridConfigId}`, data);
    }
    return axiosInstance.post(BASE, data);
  },
};

export default gridConfigApi;
