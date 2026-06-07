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
   * Hàm dùng để: Lấy toàn bộ danh sách đơn vị (không phân trang).
   * Dùng trong trường hợp: Load toàn bộ đơn vị cho dropdown / tree.
   * @returns {Promise<ServiceResponse<Organization[]>>} - Danh sách đơn vị.
   * CREATED BY: TDHieu (08/06/2026)
   */
  getAll() {
    return axiosInstance.get(BASE);
  },

  /**
   * Hàm dùng để: Lấy danh sách đơn vị theo cấu trúc cây (cha – con).
   * Dùng trong trường hợp: Cần hiển thị sơ đồ tổ chức hoặc tree select.
   * @returns {Promise<ServiceResponse<Organization[]>>} - Mảng cây root nodes.
   * CREATED BY: TDHieu (08/06/2026)
   */
  getTree() {
    return axiosInstance.get(`${BASE}/Tree`);
  },

  /**
   * Hàm dùng để: Lấy danh sách đơn vị có phân trang, tìm kiếm, sắp xếp.
   * Dùng trong trường hợp: Hiển thị lên lưới dữ liệu (data grid) quản lý đơn vị.
   * @param {Object} params - Tham số truy vấn (pageIndex, pageSize, search, sort...).
   * @returns {Promise<ServiceResponse<PagingResponse<Organization>>>} - Dữ liệu phân trang.
   * CREATED BY: TDHieu (08/06/2026)
   */
  getPaging(params = {}) {
    return axiosInstance.get(`${BASE}/Paging`, { params });
  },

  /**
   * Hàm dùng để: Lấy chi tiết một đơn vị theo ID.
   * Dùng trong trường hợp: Mở form xem chi tiết hoặc sửa đơn vị.
   * @param {string} id - organizationId (Guid).
   * @returns {Promise<ServiceResponse<Organization>>} - Dữ liệu chi tiết đơn vị.
   * CREATED BY: TDHieu (08/06/2026)
   */
  getById(id) {
    return axiosInstance.get(`${BASE}/${id}`);
  },

  /**
   * Hàm dùng để: Tạo mới đơn vị.
   * Dùng trong trường hợp: Người dùng nhập form và bấm lưu để thêm mới.
   * @param {Object} data - Dữ liệu đơn vị cần thêm (organizationCode, organizationName...).
   * @returns {Promise<ServiceResponse<Organization>>} - Kết quả tạo mới.
   * CREATED BY: TDHieu (08/06/2026)
   */
  create(data) {
    return axiosInstance.post(BASE, data);
  },

  /**
   * Hàm dùng để: Cập nhật thông tin đơn vị.
   * Dùng trong trường hợp: Người dùng sửa form và bấm lưu.
   * @param {string} id - organizationId (Guid).
   * @param {Object} data - Dữ liệu cập nhật.
   * @returns {Promise<ServiceResponse<Organization>>} - Kết quả cập nhật.
   * CREATED BY: TDHieu (08/06/2026)
   */
  update(id, data) {
    return axiosInstance.put(`${BASE}/${id}`, data);
  },

  /**
   * Hàm dùng để: Xóa một đơn vị.
   * Dùng trong trường hợp: Người dùng chọn xóa một đơn vị khỏi hệ thống.
   * @param {string} id - organizationId (Guid).
   * @returns {Promise<ServiceResponse<void>>} - Trạng thái xóa.
   * CREATED BY: TDHieu (08/06/2026)
   */
  deleteById(id) {
    return axiosInstance.delete(`${BASE}/${id}`);
  },
};

export default organizationApi;
