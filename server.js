require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// قاعدة البيانات
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Middleware للتحقق من التوكن
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'الوصول مرفوض' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'توكن غير صالح' });
        }
        req.user = user;
        next();
    });
};

// 🔐 مسارات المصادقة

// تسجيل دخول المسؤول
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // تحقق من بيانات المسؤول (يمكن تغييرها)
        const adminUsername = 'admin';
        const adminPassword = '$2a$10$8K1p/a0dRTlR0.2Q2Q2Q2e'; // كلمة مرور: admin123
        
        if (username !== adminUsername) {
            return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }
        
        const isValid = await bcrypt.compare(password, adminPassword);
        if (!isValid) {
            return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }
        
        const token = jwt.sign(
            { username: adminUsername, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            message: 'تم تسجيل الدخول بنجاح',
            token,
            user: { username: adminUsername, role: 'admin' }
        });
        
    } catch (error) {
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

// 📦 مسارات المنتجات

// جلب جميع المنتجات (للجميع)
app.get('/api/products', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [results] = await connection.execute(
            'SELECT * FROM products ORDER BY created_at DESC'
        );
        
        await connection.end();
        
        const products = results.map(product => ({
            ...product,
            colors: JSON.parse(product.colors || '[]')
        }));
        
        res.json(products);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// جلب منتج بواسطة ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [results] = await connection.execute(
            'SELECT * FROM products WHERE id = ?',
            [req.params.id]
        );
        
        await connection.end();
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'المنتج غير موجود' });
        }
        
        const product = {
            ...results[0],
            colors: JSON.parse(results[0].colors || '[]')
        };
        
        res.json(product);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// إضافة منتج جديد (للمسؤول فقط)
app.post('/api/products', authenticateToken, async (req, res) => {
    try {
        const { name, price, originalPrice, category, colors, image } = req.body;
        
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            `INSERT INTO products (name, price, original_price, category, colors, image_url) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, price, originalPrice, category, JSON.stringify(colors), image]
        );
        
        await connection.end();
        
        res.json({ 
            message: 'تم إضافة المنتج بنجاح', 
            productId: result.insertId 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// تحديث منتج (للمسؤول فقط)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, price, originalPrice, category, colors, image } = req.body;
        
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            `UPDATE products 
             SET name = ?, price = ?, original_price = ?, category = ?, colors = ?, image_url = ?
             WHERE id = ?`,
            [name, price, originalPrice, category, JSON.stringify(colors), image, productId]
        );
        
        await connection.end();
        
        res.json({ message: 'تم تحديث المنتج بنجاح' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// حذف منتج (للمسؤول فقط)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.id;
        
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'DELETE FROM products WHERE id = ?',
            [productId]
        );
        
        await connection.end();
        
        res.json({ message: 'تم حذف المنتج بنجاح' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🛒 مسارات الطلبات

// إضافة طلب جديد
app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, customerPhone, products, totalAmount } = req.body;
        
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            `INSERT INTO orders (customer_name, customer_phone, products, total_amount, status) 
             VALUES (?, ?, ?, ?, 'pending')`,
            [customerName, customerPhone, JSON.stringify(products), totalAmount]
        );
        
        await connection.end();
        
        res.json({ 
            message: 'تم إضافة الطلب بنجاح', 
            orderId: result.insertId 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// جلب جميع الطلبات (للمسؤول فقط)
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [results] = await connection.execute(
            'SELECT * FROM orders ORDER BY created_at DESC'
        );
        
        await connection.end();
        
        const orders = results.map(order => ({
            ...order,
            products: JSON.parse(order.products || '[]')
        }));
        
        res.json(orders);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// تحديث حالة الطلب
app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        
        await connection.end();
        
        res.json({ message: 'تم تحديث حالة الطلب بنجاح' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📊 إحصائيات (للمسؤول فقط)
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [[productCount]] = await connection.execute(
            'SELECT COUNT(*) as count FROM products'
        );
        
        const [[orderCount]] = await connection.execute(
            'SELECT COUNT(*) as count FROM orders'
        );
        
        const [[totalRevenue]] = await connection.execute(
            'SELECT SUM(total_amount) as total FROM orders WHERE status = "delivered"'
        );
        
        await connection.end();
        
        res.json({
            products: productCount.count,
            orders: orderCount.count,
            revenue: totalRevenue.total || 0
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// تقديم الملفات الثابتة
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/latest-products.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'latest-products.html'));
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`);
    console.log(`📊 لوحة التحكم: http://localhost:${PORT}/latest-products.html`);
});
