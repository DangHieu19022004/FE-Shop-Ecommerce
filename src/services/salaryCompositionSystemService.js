import axiosInstance from "./axios";

/**
 * Mục đích: Quản lý gọi API danh mục thành phần lương hệ thống (SalaryCompositionSystem).
 * Sử dụng trong trường hợp: Lấy dữ liệu danh mục chuẩn từ hệ thống để thêm vào danh sách sử dụng của doanh nghiệp.
 * Hàm quan trọng: getPaging, getById, create.
 * CREATED BY: TDHieu (08/06/2026)
 */
const BASE = "/SalaryCompositionSystem";

const salaryCompositionSystemApi = {
  /**
   * Lấy toàn bộ danh sách thành phần lương hệ thống.
   *
   * Sử dụng khi: Nạp nhanh vào dropdown hoặc cache.
   *
   * @returns {Promise<ServiceResponse<SalaryCompositionSystem[]>>} Danh sách chuẩn
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  getAll() {
    return axiosInstance.get(BASE);
  },

  /**
   * Lấy danh sách thành phần lương hệ thống có phân trang, tìm kiếm, sắp xếp.
   *
   * Sử dụng khi: Hiển thị bảng chọn thành phần lương hệ thống.
   *
   * @param {Object} params Các tham số phân trang, tìm kiếm
   * @returns {Promise<ServiceResponse<PagingResponse<SalaryCompositionSystem>>>} Dữ liệu phân trang
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  getPaging(params = {}) {
    return axiosInstance.get(`${BASE}/Paging`, { params });
  },

  /**
   * Lấy chi tiết một thành phần lương hệ thống theo ID.
   *
   * Sử dụng khi: Xem chi tiết trước khi quyết định chọn sử dụng.
   *
   * @param {string} id salaryCompositionSystemId (Guid)
   * @returns {Promise<ServiceResponse<SalaryCompositionSystem>>} Dữ liệu chi tiết
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  getById(id) {
    return axiosInstance.get(`${BASE}/${id}`);
  },

  /**
   * Tạo mới thành phần lương hệ thống.
   *
   * Sử dụng khi: Quản trị viên hệ thống thêm danh mục chuẩn mới.
   *
   * @param {Object} data Dữ liệu bản ghi
   * @returns {Promise<ServiceResponse<SalaryCompositionSystem>>} Kết quả thêm mới
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  create(data) {
    return axiosInstance.post(BASE, data);
  },

  /**
   * Cập nhật thành phần lương hệ thống.
   *
   * Sử dụng khi: Quản trị viên cập nhật thông tin danh mục.
   *
   * @param {string} id salaryCompositionSystemId (Guid)
   * @param {Object} data Dữ liệu bản ghi cập nhật
   * @returns {Promise<ServiceResponse<SalaryCompositionSystem>>} Kết quả cập nhật
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  update(id, data) {
    return axiosInstance.put(`${BASE}/${id}`, data);
  },

  /**
   * Xóa một thành phần lương hệ thống.
   *
   * Sử dụng khi: Quản trị viên loại bỏ danh mục lỗi.
   *
   * @param {string} id salaryCompositionSystemId (Guid)
   * @returns {Promise<ServiceResponse<void>>} Trạng thái xóa
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  deleteById(id) {
    return axiosInstance.delete(`${BASE}/${id}`);
  },
};

export default salaryCompositionSystemApi;
