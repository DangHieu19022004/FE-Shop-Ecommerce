// Danh sách các mẫu công thức hàm (tương tự Excel) dùng cho việc lập công thức tính lương
export const EXCEL_FORMULAS = [
    // --- Nhóm hàm Logic ---
    {
        name: 'SUM',
        params: '(X1, X2, ...)',
        insertText: 'SUM(',
        description: 'Tính tổng các giá trị được chỉ định.',
        category: 'Công thức'
    },
    {
        name: 'IF',
        params: '(Logical_test, [value_if_true], [value_if_false])',
        insertText: 'IF(',
        description: 'Kiểm tra điều kiện và trả về giá trị tương ứng nếu ĐÚNG hoặc SAI.',
        category: 'Công thức'
    },
    {
        name: 'IFS',
        params: '(logical_test1, value_if_true1, [logical_test2, value_if_true2], ...)',
        insertText: 'IFS(',
        description: 'Kiểm tra nhiều điều kiện và trả về giá trị ứng với điều kiện ĐÚNG đầu tiên.',
        category: 'Công thức'
    },
    {
        name: 'AND',
        params: '(X1, X2)',
        insertText: 'AND(',
        description: 'Trả về TRUE nếu tất cả các đối số (X1, X2) đều là TRUE.',
        category: 'Công thức'
    },
    {
        name: 'OR',
        params: '(X1, X2)',
        insertText: 'OR(',
        description: 'Trả về TRUE nếu có ít nhất một đối số (X1, X2) là TRUE.',
        category: 'Công thức'
    },

    // --- Nhóm hàm Làm tròn / Toán học ---
    {
        name: 'ROUND',
        params: '(number, num_digits)',
        insertText: 'ROUND(',
        description: 'Làm tròn một số tới số chữ số thập phân được chỉ định.',
        category: 'Công thức'
    },
    {
        name: 'ROUNDUP',
        params: '(number, num_digits)',
        insertText: 'ROUNDUP(',
        description: 'Làm tròn một số theo hướng tiến ra xa số 0.',
        category: 'Công thức'
    },
    {
        name: 'ROUNDDOWN',
        params: '(number, num_digits)',
        insertText: 'ROUNDDOWN(',
        description: 'Làm tròn một số theo hướng tiến về số 0.',
        category: 'Công thức'
    },
    {
        name: 'INT',
        params: '(number)',
        insertText: 'INT(',
        description: 'Làm tròn một số xuống số nguyên gần nhất.',
        category: 'Công thức'
    },

    // --- Nhóm hàm Ngày tháng (Date & Time) ---
    {
        name: 'DATE',
        params: '(year, month, day)',
        insertText: 'DATE(',
        description: 'Trả về chuỗi dữ liệu biểu thị một ngày cụ thể.',
        category: 'Công thức'
    },
    {
        name: 'DATEDIF',
        params: '(start_date, end_date, unit)',
        insertText: 'DATEDIF(',
        description: 'Tính toán số ngày, tháng hoặc năm giữa hai khoảng thời gian.',
        category: 'Công thức'
    },
    {
        name: 'TODAY',
        params: '()',
        insertText: 'TODAY()',
        description: 'Trả về ngày hiện tại của hệ thống.',
        category: 'Công thức'
    },
    {
        name: 'DAY',
        params: '(serial_number)',
        insertText: 'DAY(',
        description: 'Trả về ngày trong tháng (số từ 1 đến 31) từ dữ liệu ngày tháng.',
        category: 'Công thức'
    },
    {
        name: 'MONTH',
        params: '(serial_number)',
        insertText: 'MONTH(',
        description: 'Trả về tháng trong năm (số từ 1 đến 12) từ dữ liệu ngày tháng.',
        category: 'Công thức'
    },
    {
        name: 'YEAR',
        params: '(serial_number)',
        insertText: 'YEAR(',
        description: 'Trả về năm (số có 4 chữ số) từ dữ liệu ngày tháng.',
        category: 'Công thức'
    },

    // --- Nhóm hàm Đặc thù Hệ thống (Quản lý Nhân sự / Định mức) ---
    {
        name: 'DINHMUC',
        params: '(X)',
        insertText: 'DINHMUC(',
        description: 'Tính toán hoặc trả về giá trị định mức dựa trên biến X.',
        category: 'Công thức'
    },
    {
        name: 'CHINHTHUC',
        params: '(X)',
        insertText: 'CHINHTHUC(',
        description: 'Hàm xử lý dữ liệu hoặc trạng thái cho nhân sự chính thức.',
        category: 'Công thức'
    },
    {
        name: 'THUVIEC',
        params: '(X)',
        insertText: 'THUVIEC(',
        description: 'Hàm xử lý dữ liệu hoặc trạng thái cho nhân sự thử việc.',
        category: 'Công thức'
    },
    {
        name: 'HOCVIEC',
        params: '(X)',
        insertText: 'HOCVIEC(',
        description: 'Hàm xử lý dữ liệu hoặc trạng thái cho nhân sự học việc.',
        category: 'Công thức'
    }
];
