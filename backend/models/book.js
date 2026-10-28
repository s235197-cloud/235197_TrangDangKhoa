const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  bookId: { 
    type: String, 
    required: [true, 'Mã sách (bookId) không được để trống'], 
    unique: true, 
    trim: true 
  },
  title: { 
    type: String, 
    required: [true, 'Tên sách không được để trống'], 
    trim: true 
  },
  author: { 
    type: String, 
    required: [true, 'Tác giả không được để trống'], 
    trim: true 
  },
  category: { 
    type: String, 
    required: [true, 'Thể loại không được để trống'], 
    trim: true 
  },
  publisher: { 
    type: String, 
    required: [true, 'Nhà xuất bản không được để trống'], 
    trim: true 
  },
  publishYear: { 
    type: Number, 
    required: [true, 'Năm xuất bản không được để trống'], 
    min: [1000, 'Năm xuất bản không hợp lệ'], 
    max: [2100, 'Năm xuất bản không hợp lệ'] 
  },
  isbn: { 
    type: String, 
    required: [true, 'Mã ISBN không được để trống'], 
    trim: true 
  },
  quantity: { 
    type: Number, 
    required: [true, 'Số lượng không được để trống'], 
    min: [0, 'Số lượng phải lớn hơn hoặc bằng 0'] 
  },
  description: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);