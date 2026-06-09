import axiosInstance from "./axios";

/**
 * Mục đích: Quản lý gọi API đơn vị / phòng ban (Organization).
 * Sử dụng trong trường hợp: Lấy danh sách, thêm, sửa, xóa các đơn vị phòng ban.
 * Hàm quan trọng: getAll, getTree, getPaging.
 * CREATED BY: TDHieu (08/06/2026)
 */
const BASE = "/Organization";

const organizationApi = {
  /**
   * Lấy toàn bộ danh sách đơn vị (không phân trang).
   *
   * Sử dụng khi: Load toàn bộ đơn vị cho dropdown / tree.
   *
   * @returns {Promise<ServiceResponse<Organization[]>>} Danh sách đơn vị
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  getAll() {
    return axiosInstance.get(BASE);
  },

  /**
   * Lấy danh sách đơn vị theo cấu trúc cây (cha – con).
   *
   * Sử dụng khi: Cần hiển thị sơ đồ tổ chức hoặc tree select.
   *
   * @returns {Promise<ServiceResponse<Organization[]>>} Mảng cây root nodes
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  getTree() {
    return axiosInstance.get(`${BASE}/Tree`);
  },

  /**
   * Lấy danh sách đơn vị có phân trang, tìm kiếm, sắp xếp.
   *
   * Sử dụng khi: Hiển thị lên lưới dữ liệu (data grid) quản lý đơn vị.
   *
   * @param {Object} params Tham số truy vấn (pageIndex, pageSize, search, sort...)
   * @returns {Promise<ServiceResponse<PagingResponse<Organization>>>} Dữ liệu phân trang
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  getPaging(params = {}) {
    return axiosInstance.get(`${BASE}/Paging`, { params });
  },

  /**
   * Lấy chi tiết một đơn vị theo ID.
   *
   * Sử dụng khi: Mở form xem chi tiết hoặc sửa đơn vị.
   *
   * @param {string} id organizationId (Guid)
   * @returns {Promise<ServiceResponse<Organization>>} Dữ liệu chi tiết đơn vị
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  getById(id) {
    return axiosInstance.get(`${BASE}/${id}`);
  },

  /**
   * Tạo mới đơn vị.
   *
   * Sử dụng khi: Người dùng nhập form và bấm lưu để thêm mới.
   *
   * @param {Object} data Dữ liệu đơn vị cần thêm (organizationCode, organizationName...)
   * @returns {Promise<ServiceResponse<Organization>>} Kết quả tạo mới
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  create(data) {
    return axiosInstance.post(BASE, data);
  },

  /**
   * Cập nhật thông tin đơn vị.
   *
   * Sử dụng khi: Người dùng sửa form và bấm lưu.
   *
   * @param {string} id organizationId (Guid)
   * @param {Object} data Dữ liệu cập nhật
   * @returns {Promise<ServiceResponse<Organization>>} Kết quả cập nhật
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  update(id, data) {
    return axiosInstance.put(`${BASE}/${id}`, data);
  },

  /**
   * Xóa một đơn vị.
   *
   * Sử dụng khi: Người dùng chọn xóa một đơn vị khỏi hệ thống.
   *
   * @param {string} id organizationId (Guid)
   * @returns {Promise<ServiceResponse<void>>} Trạng thái xóa
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  deleteById(id) {
    return axiosInstance.delete(`${BASE}/${id}`);
  },
};

export default organizationApi;
