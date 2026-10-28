require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Book = require('./models/book');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Kết nối MongoDB Atlas
mongoose.connect(MONGODB_URI)
  .then(() => console.log('>>> Kết nối thành công MongoDB Atlas'))
  .catch((err) => {
    console.error('>>> Lỗi kết nối MongoDB Atlas:', err.message);
  });

// Endpoint kiểm tra sức khỏe ứng dụng (Healthcheck)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend server đang hoạt động bình thường',
    timestamp: new Date().toISOString()
  });
});

// GET /api/books và GET /api/books?search=keyword
// Lấy danh sách sách hoặc tìm kiếm theo tên, tác giả, thể loại
app.get('/api/books', async (req, res) => {
  try {
    const { search } = req.query;
    let queryFilter = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      queryFilter = {
        $or: [
          { title: searchRegex },
          { author: searchRegex },
          { category: searchRegex }
        ]
      };
    }

    const books = await Book.find(queryFilter).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách sách',
      error: error.message
    });
  }
});

// GET /api/books/:id
// Xem thông tin chi tiết 1 cuốn sách (hỗ trợ tra cứu theo Mongo _id hoặc bookId)
app.get('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    const book = await Book.findOne({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { bookId: id }
      ]
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sách với mã/ID: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy thông tin sách',
      error: error.message
    });
  }
});

// POST /api/books
// Thêm sách mới
app.post('/api/books', async (req, res) => {
  try {
    const { bookId, title, author, category, publisher, publishYear, isbn, quantity, description } = req.body;

    // Kiểm tra thiếu trường bắt buộc
    if (!bookId || !title || !author || !category || !publisher || !publishYear || !isbn || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc'
      });
    }

    // Kiểm tra trùng mã bookId
    const existingBook = await Book.findOne({ bookId: bookId.trim() });
    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: `Mã sách '${bookId}' đã tồn tại trong hệ thống. Vui lòng chọn mã khác.`
      });
    }

    const newBook = new Book({
      bookId: bookId.trim(),
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      publisher: publisher.trim(),
      publishYear: Number(publishYear),
      isbn: isbn.trim(),
      quantity: Number(quantity),
      description: description ? description.trim() : ''
    });

    await newBook.save();
    return res.status(201).json({
      success: true,
      message: 'Thêm sách mới thành công',
      data: newBook
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        error: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi thêm sách',
      error: error.message
    });
  }
});

// PUT /api/books/:id
// Cập nhật thông tin sách theo Mongo _id
app.put('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID sách không hợp lệ'
      });
    }

    // Nếu người dùng cập nhật bookId, kiểm tra xem có trùng với cuốn sách khác không
    if (updateData.bookId) {
      const duplicate = await Book.findOne({
        bookId: updateData.bookId.trim(),
        _id: { $ne: id }
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Mã sách '${updateData.bookId}' đã được sử dụng bởi cuốn sách khác.`
        });
      }
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách để cập nhật'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin sách thành công',
      data: updatedBook
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu cập nhật không hợp lệ',
        error: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật sách',
      error: error.message
    });
  }
});

// DELETE /api/books/:id
// Xóa sách theo Mongo _id
app.delete('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID sách không hợp lệ'
      });
    }

    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách để xóa'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Xóa sách thành công'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa sách',
      error: error.message
    });
  }
});

// Khởi chạy máy chủ
app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng http://localhost:${PORT}`);
});