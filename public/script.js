// Зашифрованный пароль (md5 от "admin123")
const ENCRYPTED_PASSWORD = "21232f297a57a5a743894a0e4a801fc3";

// Функции для основной формы
function openForm(role) {
    const form = document.getElementById('applicationForm');
    const roleTitle = document.getElementById('roleTitle');
    const selectedRole = document.getElementById('selectedRole');
    
    const roleNames = {
        'moderator': 'Модератор',
        'senior_moderator': 'Старший Модератор', 
        'administrator': 'Администратор'
    };
    
    roleTitle.textContent = roleNames[role];
    selectedRole.value = role;
    
    form.style.display = 'flex';
}

function closeForm() {
    document.getElementById('applicationForm').style.display = 'none';
    document.getElementById('applicationFormElement').reset();
}

// Обработка отправки формы заявки
document.getElementById('applicationFormElement').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        nickname: document.getElementById('nickname').value,
        discord: document.getElementById('discord').value,
        message: document.getElementById('message').value,
        role: document.getElementById('selectedRole').value
    };
    
    // Валидация
    if (!formData.nickname || !formData.discord || !formData.message) {
        alert('Заполните все поля!');
        return;
    }
    
    try {
        const response = await fetch('/api/submit-application', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('✅ Заявка успешно отправлена! Мы свяжемся с вами через Discord.');
            closeForm();
        } else {
            alert('❌ Ошибка: ' + (result.message || 'Попробуйте еще раз.'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Ошибка соединения. Проверьте интернет и попробуйте еще раз.');
    }
});

// Закрытие формы по клику вне её
document.getElementById('applicationForm').addEventListener('click', function(e) {
    if (e.target === this) {
        closeForm();
    }
});

// Функции для админ-панели
function openAdminPopup() {
    console.log('Открытие попапа админа');
    document.getElementById('adminPopup').style.display = 'flex';
}

function closeAdminPopup() {
    document.getElementById('adminPopup').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

function checkAdminPassword() {
    const password = document.getElementById('adminPassword').value;
    if (!password) {
        alert('Введите пароль!');
        return;
    }
    
    if (md5(password) === ENCRYPTED_PASSWORD) {
        closeAdminPopup();
        openAdminPanel();
    } else {
        alert('❌ Неверный пароль!');
    }
}

function openAdminPanel() {
    console.log('Открытие админ-панели');
    document.getElementById('adminPanel').style.display = 'block';
    loadAdminApplications();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
}

// Загрузка заявок для админа
async function loadAdminApplications() {
    try {
        const response = await fetch('/api/applications');
        if (!response.ok) {
            throw new Error('Ошибка сервера');
        }
        const applications = await response.json();
        displayAdminApplications(applications);
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
        document.getElementById('adminApplicationsList').innerHTML = 
            '<p style="text-align: center; color: #dc3545;">❌ Ошибка загрузки заявок</p>';
    }
}

function displayAdminApplications(applications) {
    const container = document.getElementById('adminApplicationsList');
    
    if (applications.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">📭 Заявок пока нет</p>';
        return;
    }
    
    container.innerHTML = applications.map(app => `
        <div class="application-card ${app.status}">
            <div class="application-header">
                <div class="application-info">
                    <h3>👤 ${app.nickname}</h3>
                    <div class="application-meta">
                        <p><strong>Роль:</strong> ${getRoleName(app.role)}</p>
                        <p><strong>Discord:</strong> ${app.discord}</p>
                        <p><strong>Дата:</strong> ${app.date}</p>
                        <p><strong>Сообщение:</strong> ${app.message}</p>
                    </div>
                </div>
            </div>
            <span class="status-badge status-${app.status}">
                ${getStatusText(app.status)}
            </span>
            <div class="application-actions">
                <button class="btn-status btn-approve" onclick="updateApplicationStatus(${app.id}, 'approved')">
                    ✅ Принять
                </button>
                <button class="btn-status btn-reject" onclick="updateApplicationStatus(${app.id}, 'rejected')">
                    ❌ Отклонить
                </button>
                ${app.status !== 'pending' ? `
                    <button class="btn-status btn-pending" onclick="updateApplicationStatus(${app.id}, 'pending')">
                        ⏳ В ожидание
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function updateApplicationStatus(applicationId, newStatus) {
    try {
        const response = await fetch(`/api/application/${applicationId}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                status: newStatus
            })
        });
        
        if (response.ok) {
            loadAdminApplications();
        } else {
            alert('❌ Ошибка обновления статуса');
        }
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        alert('❌ Ошибка обновления статуса');
    }
}

function getRoleName(role) {
    const roles = {
        'moderator': '👮 Модератор',
        'senior_moderator': '🛡️ Старший Модератор',
        'administrator': '👑 Администратор'
    };
    return roles[role] || role;
}

function getStatusText(status) {
    const statuses = {
        'pending': '⏳ Ожидает',
        'approved': '✅ Принята',
        'rejected': '❌ Отклонена'
    };
    return statuses[status] || status;
}

// MD5 функция
function md5(input) {
    return CryptoJS.MD5(input).toString();
}

// Обработчики событий после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Закрытие попапа по клику вне его
    document.getElementById('adminPopup').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAdminPopup();
        }
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAdminPopup();
            closeAdminPanel();
            closeForm();
        }
    });
    
    console.log('✅ Скрипт загружен! Кнопка админа должна работать.');
});