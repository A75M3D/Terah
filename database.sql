-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS tarhi_store;
USE tarhi_store;

-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(100) NOT NULL,
    colors JSON,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إضافة بعض المنتجات الافتراضية
INSERT INTO products (name, price, original_price, category, colors, image_url) VALUES
('طرح كلاسيكي أنيق', 89.99, 120.00, 'طرح كلاسيكي', '["أسود", "أبيض", "بيج"]', 'https://example.com/image1.jpg'),
('طرح مطرز فاخر', 149.99, 199.99, 'طرح مطرز', '["ذهبي", "فضي", "وردي"]', 'https://example.com/image2.jpg'),
('طرح شيفون ناعم', 75.50, 95.00, 'طرح شيفون', '["أزرق فاتح", "وردي", "أبيض"]', 'https://example.com/image3.jpg');
