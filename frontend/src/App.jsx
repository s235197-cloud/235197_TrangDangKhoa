import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Lấy URL Backend API từ biến môi trường
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function App() {
  // States quản lý dữ liệu và giao diện
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);

  // State quản lý form Thêm / Sửa
  const [formData, setFormData] = useState({
    bookId: '',
    title: '',
    author: '',
    category: '',
    publisher: '',
    publishYear: new Date().getFullYear(),
    isbn: '',
    quantity: 0,
    description: ''
  });
  const [editingId, setEditingId] = useState(null);

  // 1. Hàm lấy danh sách sách & Tìm kiếm (GET /api/books hoặc /api/books?search=...)
  const fetchBooks = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const url = query.trim() 
        ? `${API_BASE_URL}/books?search=${encodeURIComponent(query.trim())}`
        : `${API_BASE_URL}/books`;
      const res = await axios.get(url);
      setBooks(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách sách từ server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Xử lý submit tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks(search);
  };

  // Cập nhật state form khi nhập input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset form về trạng thái ban đầu
  const resetForm = () => {
    setFormData({
      bookId: '', title: '', author: '', category: '',
      publisher: '', publishYear: new Date().getFullYear(),
      isbn: '', quantity: 0, description: ''
    });
    setEditingId(null);
  };

  // 2. Chức năng chuẩn bị dữ liệu Cập nhật sách (PUT)
  const handleEditClick = (book) => {
    setEditingId(book._id);
    setFormData({
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      category: book.category,
      publisher: book.publisher,
      publishYear: book.publishYear,
      isbn: book.isbn,
      quantity: book.quantity,
      description: book.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3 & 4. Chức năng Thêm mới (POST) và Cập nhật (PUT)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (editingId) {
        // Cập nhật sách
        const res = await axios.put(`${API_BASE_URL}/books/${editingId}`, formData);
        setMessage(res.data.message || 'Cập nhật thông tin sách thành công!');
      } else {
        // Thêm sách mới
        const res = await axios.post(`${API_BASE_URL}/books`, formData);
        setMessage(res.data.message || 'Thêm sách mới thành công!');
      }
      resetForm();
      fetchBooks(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  // 5. Chức năng Xóa sách (DELETE)
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa cuốn sách "${title}"?`)) return;
    
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/books/${id}`);
      setMessage(res.data.message || 'Xóa sách thành công!');
      if (selectedBook && selectedBook._id === id) {
        setSelectedBook(null);
      }
      fetchBooks(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa sách');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ color: '#007bff', margin: 0 }}>HỆ THỐNG QUẢN LÝ SÁCH</h1>
        <p style={{ margin: '5px 0 0 0', color: '#555', fontWeight: 'bold' }}>
          Sinh viên: Trang Đăng Khoa - MSSV: 235197
        </p>
      </header>

      {/* Thông báo kết quả / lỗi */}
      {message && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '12px', borderRadius: '4px', marginBottom: '15px' }}>
          ✅ {message}
        </div>
      )}
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '15px' }}>
          ❌ {error}
        </div>
      )}

      {/* Thanh Tìm Kiếm */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Nhập từ khóa tìm kiếm (Tên sách, Tác giả, Thể loại)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          🔍 Tìm kiếm
        </button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); fetchBooks(''); }} style={{ padding: '10px 15px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Xóa tìm kiếm
          </button>
        )}
      </form>

      <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
        {/* Form Thêm / Cập nhật sách */}
        <div style={{ flex: '1', minWidth: '320px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>
            {editingId ? '📝 Cập Nhật Thông Tin Sách' : '➕ Thêm Sách Mới'}
          </h3>
          <form onSubmit={handleSubmitForm}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Mã sách (bookId):</label>
              <input type="text" name="bookId" value={formData.bookId} onChange={handleInputChange} required disabled={!!editingId} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Tên sách:</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Tác giả:</label>
              <input type="text" name="author" value={formData.author} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Thể loại:</label>
              <input type="text" name="category" value={formData.category} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Nhà xuất bản:</label>
              <input type="text" name="publisher" value={formData.publisher} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Năm xuất bản:</label>
                <input type="number" name="publishYear" value={formData.publishYear} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Số lượng:</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Mã ISBN:</label>
              <input type="text" name="isbn" value={formData.isbn} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Mô tả:</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: editingId ? '#28a745' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                {editingId ? 'Lưu thay đổi' : 'Thêm sách mới'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} style={{ padding: '10px 15px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Bảng Danh sách Sách */}
        <div style={{ flex: '2', minWidth: '450px' }}>
          <h3 style={{ marginTop: 0 }}>📚 Danh Sách Sách ({books.length})</h3>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#007bff' }}>⏳ Đang tải dữ liệu...</p>
          ) : books.length === 0 ? (
            <p style={{ padding: '20px', background: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
              Không tìm thấy sách nào phù hợp.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ background: '#f1f3f5', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Mã Sách</th>
                  <th style={{ padding: '10px' }}>Tên Sách</th>
                  <th style={{ padding: '10px' }}>Tác Giả</th>
                  <th style={{ padding: '10px' }}>Thể Loại</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>SL</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #e9ecef' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{b.bookId}</td>
                    <td style={{ padding: '10px' }}>{b.title}</td>
                    <td style={{ padding: '10px' }}>{b.author}</td>
                    <td style={{ padding: '10px' }}>{b.category}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{b.quantity}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button onClick={() => setSelectedBook(b)} style={{ marginRight: '4px', padding: '4px 8px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }} title="Xem chi tiết">
                        👁️
                      </button>
                      <button onClick={() => handleEditClick(b)} style={{ marginRight: '4px', padding: '4px 8px', background: '#ffc107', color: '#212529', border: 'none', borderRadius: '3px', cursor: 'pointer' }} title="Sửa">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(b._id, b.title)} style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }} title="Xóa">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 6. Màn hình Chi tiết Sách Modal / Section */}
      {selectedBook && (
        <div style={{ marginTop: '30px', padding: '20px', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #90caf9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#0d47a1' }}>📖 Chi Tiết Sách: {selectedBook.title}</h3>
            <button onClick={() => setSelectedBook(null)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              Đóng ✖
            </button>
          </div>
          <hr style={{ borderColor: '#bbdefb', margin: '15px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <p><strong>Mã sách (bookId):</strong> {selectedBook.bookId}</p>
            <p><strong>Mã ISBN:</strong> {selectedBook.isbn}</p>
            <p><strong>Tác giả:</strong> {selectedBook.author}</p>
            <p><strong>Thể loại:</strong> {selectedBook.category}</p>
            <p><strong>Nhà xuất bản:</strong> {selectedBook.publisher}</p>
            <p><strong>Năm xuất bản:</strong> {selectedBook.publishYear}</p>
            <p><strong>Số lượng trong kho:</strong> {selectedBook.quantity}</p>
          </div>
          <p style={{ marginTop: '10px' }}>
            <strong>Mô tả:</strong> {selectedBook.description || 'Chưa có thông tin mô tả cho cuốn sách này.'}
          </p>
        </div>
      )}
    </div>
  );
}