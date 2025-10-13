const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// الاتصال مع Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://sjipwstkvvrautexigmt.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqaXB3c3RrdnZyYXV0ZXhpZ210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MTE5MDcsImV4cCI6MjA3NDQ4NzkwN30.FSh2yIdZdvdNvtWxK5JB02PIdWOG3707qO-F0c84PnY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 📦 مسارات المنتجات

// جلب جميع المنتجات
app.get('/api/products', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        // تحويل JSON strings إلى arrays
        const products = data.map(product => ({
            ...product,
            colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors
        }));

        res.json(products);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// إضافة منتج جديد
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, originalPrice, category, colors, image } = req.body;
        
        const { data, error } = await supabase
            .from('products')
            .insert([
                {
                    name,
                    price: parseFloat(price),
                    original_price: originalPrice ? parseFloat(originalPrice) : null,
                    category,
                    colors: colors || [],
                    image_url: image || 'https://via.placeholder.com/400x300?text=صورة+المنتج'
                }
            ])
            .select();

        if (error) throw error;
        
        res.json({ 
            message: 'تم إضافة المنتج بنجاح', 
            product: data[0] 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// حذف منتج
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;
        
        res.json({ message: 'تم حذف المنتج بنجاح' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// تحديث منتج
app.put('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, price, originalPrice, category, colors, image } = req.body;
        
        const { data, error } = await supabase
            .from('products')
            .update({
                name,
                price: parseFloat(price),
                original_price: originalPrice ? parseFloat(originalPrice) : null,
                category,
                colors: colors || [],
                image_url: image
            })
            .eq('id', productId)
            .select();

        if (error) throw error;
        
        res.json({ 
            message: 'تم تحديث المنتج بنجاح', 
            product: data[0] 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🛒 مسارات الطلبات
app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, customerPhone, products: orderProducts, totalAmount } = req.body;
        
        // حفظ الطلب في Supabase (يمكنك إنشاء جدول orders لاحقاً)
        res.json({ 
            message: 'تم إضافة الطلب بنجاح', 
            order: {
                id: Date.now(),
                customerName,
                customerPhone,
                products: orderProducts,
                totalAmount,
                status: 'pending',
                created_at: new Date()
            }
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
    console.log(`🚀 الخادم يعمل على port ${PORT}`);
    console.log(`📊 Supabase connected: ${supabaseUrl}`);
});

module.exports = app;
