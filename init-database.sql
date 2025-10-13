require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    try {
        // الاتصال بدون تحديد قاعدة بيانات أولاً
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('✅ تم الاتصال بخادم MySQL');

        // إنشاء قاعدة البيانات إذا لم تكن موجودة
        await connection.execute('CREATE DATABASE IF NOT EXISTS tarhi_store');
        console.log('✅ تم إنشاء قاعدة البيانات');

        // استخدام قاعدة البيانات
        await connection.execute('USE tarhi_store');
        console.log('✅ تم اختيار قاعدة البيانات');

        // إنشاء جدول المنتجات
        await connection.execute(`
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
        `);
        console.log('✅ تم إنشاء جدول المنتجات');

        // إنشاء جدول الطلبات
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(20) NOT NULL,
                products JSON NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'confirmed', 'shipped', 'delivered') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ تم إنشاء جدول الطلبات');

        // إضافة بعض المنتجات الافتراضية
        await connection.execute(`
            INSERT IGNORE INTO products (name, price, original_price, category, colors, image_url) VALUES
            ('طرح كلاسيكي أنيق', 89.99, 120.00, 'طرح كلاسيكي', '["أسود", "أبيض", "بيج"]', 'https://dl.dropbox.com/scl/fi/urjzwaswjbwhxjbgckziw/b6f70c9159b90c61f3a8c3b5326c60e5.jpg?rlkey=sqh39xbecc24t7w45jtc3a6l0&st=s0flfpim&dl=1'),
            ('طرح مطرز فاخر', 149.99, 199.99, 'طرح مطرز', '["ذهبي", "فضي", "وردي"]', 'https://dl.dropbox.com/scl/fi/awh03wnh016l5609qu20m/173350f8e1de228032767d47bd334088.jpg?rlkey=z4zyaf52jh0bwoac4pwa2757o&st=kinig810&dl=0'),
            ('طرح شيفون ناعم', 75.50, 95.00, 'طرح شيفون', '["أزرق فاتح", "وردي", "أبيض"]', 'https://dl.dropbox.com/scl/fi/tk4umcp6zgjneyaquqmp7/29b1cb076116460b2b4c3db338db8d1c.jpg?rlkey=x1g9i0wy3mb6puyn0igrl7ngq&st=q3frifi1&dl=0')
        `);
        console.log('✅ تم إضافة المنتجات الافتراضية');

        await connection.end();
        console.log('🎉 تم تهيئة قاعدة البيانات بنجاح!');

    } catch (error) {
        console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
    }
}

initializeDatabase();
