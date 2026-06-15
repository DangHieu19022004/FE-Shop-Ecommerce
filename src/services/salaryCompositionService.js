import axiosInstance from "./axios";

/**
 * Mục đích: Quản lý gọi API Thành phần lương (SalaryComposition).
 * Sử dụng trong trường hợp: Lấy danh sách, thêm, sửa, xóa, và cập nhật trạng thái các thành phần lương doanh nghiệp đang sử dụng.
 * Hàm quan trọng: getPaging, create, update, deleteBulk, updateStatusBulk.
 * CREATED BY: TDHieu (08/06/2026)
 */
const BASE = "/SalaryComposition";

const salaryCompositionApi = {
  /**
   * Lấy toàn bộ danh sách thành phần lương (không phân trang).
   *
   * Sử dụng khi: Cần load tất cả thành phần lương vào dropdown hoặc bộ nhớ.
   *
   * @returns {Promise<ServiceResponse<SalaryComposition[]>>} Dữ liệu danh sách
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  getAll() {
    return axiosInstance.get(BASE);
  },

  /**
   * Lấy danh sách thành phần lương có phân trang, tìm kiếm, sắp xếp.
   *
   * Sử dụng khi: Hiển thị lên lưới dữ liệu (data grid) quản lý thành phần lương.
   *
   * @param {Object} params Tham số truy vấn (pageIndex, pageSize, search, sort...)
   * @returns {Promise<ServiceResponse<PagingResponse<SalaryComposition>>>} Dữ liệu phân trang
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  getPaging(params = {}) {
    return axiosInstance.get(`${BASE}/Paging`, { params });
  },

  /**
   * Lấy chi tiết một thành phần lương theo ID.
   *
   * Sử dụng khi: Mở form xem chi tiết, sửa hoặc nhân bản bản ghi.
   *
   * @param {string} id salaryCompositionId (Guid)
   * @returns {Promise<ServiceResponse<SalaryComposition>>} Dữ liệu chi tiết
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  getById(id) {
    return axiosInstance.get(`${BASE}/${id}`);
  },

  /**
   * Lấy chi tiết một thành phần lương theo mã (SalaryCompositionCode).
   *
   * Sử dụng khi: Cần tìm bản ghi theo mã mà không biết trước ID,
   * thay thế pattern getAll() → find() bằng một lời gọi duy nhất.
   *
   * @param {string} code salaryCompositionCode
   * @returns {Promise<ServiceResponse<SalaryComposition>>} Dữ liệu chi tiết hoặc 404
   *
   * CREATED BY: TDHieu (15/06/2026)
   */
  getByCode(code) {
    return axiosInstance.get(`${BASE}/ByCode/${encodeURIComponent(code)}`);
  },

  /**
   * Tạo mới thành phần lương.
   *
   * Sử dụng khi: Người dùng nhập form và bấm cất (lưu) để thêm mới.
   *
   * @param {Object} data Dữ liệu bản ghi cần thêm
   * @returns {Promise<ServiceResponse<SalaryComposition>>} Kết quả tạo mới
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  create(data) {
    return axiosInstance.post(BASE, data);
  },

  createIgnoringSystemCode(data) {
    return axiosInstance.post(`${BASE}/continue`, data);
  },

  /**
   * Cập nhật thành phần lương.
   *
   * Sử dụng khi: Người dùng sửa form và bấm cất.
   *
   * @param {string} id salaryCompositionId (Guid)
   * @param {Object} data Dữ liệu cập nhật
   * @returns {Promise<ServiceResponse<SalaryComposition>>} Kết quả cập nhật
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  update(id, data) {
    return axiosInstance.put(`${BASE}/${id}`, data);
  },

  /**
   * Xóa một thành phần lương.
   *
   * Sử dụng khi: Bấm xóa một bản ghi trên danh sách.
   *
   * @param {string} id salaryCompositionId (Guid)
   * @returns {Promise<ServiceResponse<void>>} Trạng thái xóa
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  deleteById(id) {
    return axiosInstance.delete(`${BASE}/${id}`);
  },

  /**
   * Xóa nhiều thành phần lương cùng lúc.
   *
   * Sử dụng khi: Chọn nhiều bản ghi trên grid và bấm chức năng xóa hàng loạt.
   *
   * @param {string[]} ids Danh sách salaryCompositionId
   * @returns {Promise<ServiceResponse<number>>} Số lượng bản ghi đã xóa thành công
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  deleteBulk(ids) {
    return axiosInstance.delete(`${BASE}/bulk`, { data: ids });
  },

  /**
   * Cập nhật trạng thái nhiều thành phần lương.
   *
   * Sử dụng khi: Bấm Ngừng theo dõi/Theo dõi hàng loạt cho các bản ghi đã chọn.
   *
   * @param {string[]} ids Danh sách salaryCompositionId
   * @param {number} status 1=Đang theo dõi | 2=Ngừng theo dõi
   * @returns {Promise<ServiceResponse<number>>} Số lượng bản ghi cập nhật thành công
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  updateStatusBulk(ids, status) {
    return axiosInstance.put(`${BASE}/bulk-status`, { ids, status });
  },
};

export default salaryCompositionApi;
