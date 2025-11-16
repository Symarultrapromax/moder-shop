const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Секретный ключ для доступа (замени на свой)
const ADMIN_SECRET = "mysimarsecret123";

// Хранилище заявок
let applications = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Главная страница для игроков
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Админ-панель (только для тебя)
app.get('/admin-panel', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'admin-panel.html'));
});

// API для получения заявок (только с секретным ключом)
app.get('/api/applications', (req, res) => {
    const secret = req.query.secret;
    
    if (secret === ADMIN_SECRET) {
        res.json(applications);
    } else {
        res.status(403).json({ error: 'Доступ запрещен' });
    }
});

// API для изменения статуса заявки
app.post('/api/application/:id/status', (req, res) => {
    const { secret, status } = req.body;
    
    if (secret !== ADMIN_SECRET) {
        return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    const { id } = req.params;
    
    applications = applications.map(app => 
        app.id == id ? { ...app, status } : app
    );
    
    res.json({ success: true });
});

// Прием заявок от игроков
app.post('/api/submit-application', (req, res) => {
    const { nickname, discord, gamepassId, message, role } = req.body;
    
    const newApplication = {
        id: Date.now(),
        nickname,
        discord,
        gamepassId,
        message,
        role,
        status: 'pending', // pending, approved, rejected
        date: new Date().toLocaleString('ru-RU'),
        price: getRolePrice(role)
    };
    
    applications.push(newApplication);
    
    console.log('📨 НОВАЯ ЗАЯВКА Community Simar:');
    console.log('👤 Никнейм:', nickname);
    console.log('💬 Discord:', discord);
    console.log('📝 Сообщение:', message);
    console.log('🛡️ Роль:', role);
    console.log('💰 Цена:', getRolePrice(role) + ' Robux');
    console.log('⏰ Время:', newApplication.date);
    console.log('-----------------------------------');
    
    res.json({ 
        success: true, 
        message: 'Заявка отправлена! Мы свяжемся с тобой в Discord.' 
    });
});

// Цены для ролей
function getRolePrice(role) {
    const prices = {
        'moderator': 459,
        'senior_moderator': 899,
        'administrator': 4999
    };
    return prices[role] || 0;
}

app.listen(PORT, () => {
    console.log(`🚀 Community Simar запущен на порту ${PORT}`);
    console.log(`🎮 Для игроков: http://localhost:${PORT}/`);
    console.log(`👑 Твоя админка: http://localhost:${PORT}/admin-panel`);
    console.log(`🔐 Секретный ключ: ${ADMIN_SECRET}`);
});