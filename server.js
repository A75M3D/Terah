const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// اتصال قاعدة البيانات
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'tarhi_store'
});

// الاتصال بقاعدة البيانات
db.connect((err) => {
    if (err) {
        console.log('خطأ في الاتصال بقاعدة البيانات:', err);
        return;
    }
    console.log('تم الاتصال بقاعدة البيانات بنجاح!');
});

// إنشاء جدول المنتجات إذا لم يكن موجوداً
const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        category VARCHAR(100) NOT NULL,
        colors JSON,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

db.query(createProductsTable, (err) => {
    if (err) throw err;
    console.log('تم إنشاء جدول المنتجات');
});

// 🌐 Routes - مسارات API

// جلب جميع المنتجات
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        // تحويل colors من JSON string إلى array
        const products = results.map(product => ({
            ...product,
            colors: JSON.parse(product.colors || '[]')
        }));
        
        res.json(products);
    });
});

// إضافة منتج جديد
app.post('/api/products', (req, res) => {
    const { name, price, originalPrice, category, colors, image } = req.body;
    
    const query = `
        INSERT INTO products (name, price, original_price, category, colors, image_url) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        name, 
        price, 
        originalPrice, 
        category, 
        JSON.stringify(colors), 
        image
    ];
    
    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ 
            message: 'تم إضافة المنتج بنجاح', 
            productId: result.insertId 
        });
    });
});

// حذف منتج
app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    
    const query = 'DELETE FROM products WHERE id = ?';
    db.query(query, [productId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'تم حذف المنتج بنجاح' });
    });
});

// تحديث منتج
app.put('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const { name, price, originalPrice, category, colors, image } = req.body;
    
    const query = `
        UPDATE products 
        SET name = ?, price = ?, original_price = ?, category = ?, colors = ?, image_url = ?
        WHERE id = ?
    `;
    
    const values = [
        name, 
        price, 
        originalPrice, 
        category, 
        JSON.stringify(colors), 
        image,
        productId
    ];
    
    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'تم تحديث المنتج بنجاح' });
    });
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`🔄 الخادم يعمل على http://localhost:${PORT}`);
});
