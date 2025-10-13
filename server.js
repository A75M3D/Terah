require('dotenv').config();
const express = require('express');
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

// تخزين البيانات في الذاكرة (مؤقت)
let products = [
    {
        id: 1,
        name: "طرح كلاسيكي أسود",
        price: 149.99,
        originalPrice: 199.99,
        category: "طرح كلاسيكي",
        colors: ["أسود"],
        image: "https://via.placeholder.com/400x300?text=طرح+أسود",
        created_at: new Date()
    }
];

let orders = [];
let nextProductId = 2;
let nextOrderId = 1;

// JWT Secret (استخدم متغير بيئة أو قيمة افتراضية)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Middleware للتحقق من التوكن
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'الوصول مرفوض' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
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
        
        // تحقق من بيانات المسؤول
        const adminUsername = 'admin';
        const adminPassword = 'admin123'; // في الواقع، لازم تشفرها
        
        if (username !== adminUsername || password !== adminPassword) {
            return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }
        
        const token = jwt.sign(
            { username: adminUsername, role: 'admin' },
            JWT_SECRET,
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
app.get('/api/products', (req, res) => {
    try {
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// جلب منتج بواسطة ID
app.get('/api/products/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            return res.status(404).json({ error: 'المنتج غير موجود' });
        }
        
        res.json(product);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// إضافة منتج جديد (للمسؤول فقط)
app.post('/api/products', authenticateToken, (req, res) => {
    try {
        const { name, price, originalPrice, category, colors, image } = req.body;
        
        const newProduct = {
            id: nextProductId++,
            name,
            price: parseFloat(price),
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            category,
            colors: colors || [],
            image: image || 'https://via.placeholder.com/400x300?text=صورة+المنتج',
            created_at: new Date()
        };
        
        products.push(newProduct);
        
        res.json({ 
            message: 'تم إضافة المنتج بنجاح', 
            product: newProduct 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// تحديث منتج (للمسؤول فقط)
app.put('/api/products/:id', authenticateToken, (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { name, price, originalPrice, category, colors, image } = req.body;
        
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ error: 'المنتج غير موجود' });
        }
        
        products[productIndex] = {
            ...products[productIndex],
            name,
            price: parseFloat(price),
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            category,
            colors: colors || [],
            image: image || products[productIndex].image
        };
        
        res.json({ message: 'تم تحديث المنتج بنجاح', product: products[productIndex] });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// حذف منتج (للمسؤول فقط)
app.delete('/api/products/:id', authenticateToken, (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ error: 'المنتج غير موجود' });
        }
        
        products.splice(productIndex, 1);
        
        res.json({ message: 'تم حذف المنتج بنجاح' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🛒 مسارات الطلبات

// إضافة طلب جديد
app.post('/api/orders', (req, res) => {
    try {
        const { customerName, customerPhone, products: orderProducts, totalAmount } = req.body;
        
        const newOrder = {
            id: nextOrderId++,
            customerName,
            customerPhone,
            products: orderProducts,
            totalAmount: parseFloat(totalAmount),
            status: 'pending',
            created_at: new Date()
        };
        
        orders.push(newOrder);
        
        res.json({ 
            message: 'تم إضافة الطلب بنجاح', 
            order: newOrder 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// جلب جميع الطلبات (للمسؤول فقط)
app.get('/api/orders', authenticateToken, (req, res) => {
    try {
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// تحديث حالة الطلب
app.put('/api/orders/:id/status', authenticateToken, (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;
        
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'الطلب غير موجود' });
        }
        
        orders[orderIndex].status = status;
        
        res.json({ message: 'تم تحديث حالة الطلب بنجاح', order: orders[orderIndex] });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📊 إحصائيات (للمسؤول فقط)
app.get('/api/stats', authenticateToken, (req, res) => {
    try {
        const productCount = products.length;
        const orderCount = orders.length;
        const totalRevenue = orders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + order.totalAmount, 0);
        
        res.json({
            products: productCount,
            orders: orderCount,
            revenue: totalRevenue
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
