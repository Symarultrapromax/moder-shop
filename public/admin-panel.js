let currentSecret = '';

function loadApplications() {
    const secret = document.getElementById('secretKey').value;
    
    if (!secret) {
        alert('Введи секретный ключ!');
        return;
    }
    
    currentSecret = secret;
    refreshApplications();
}

async function refreshApplications() {
    if (!currentSecret) {
        alert('Сначала введи секретный ключ!');
        return;
    }
    
    try {
        const response = await fetch(`/api/applications?secret=${currentSecret}`);
        
        if (response.status === 403) {
            alert('Неверный секретный ключ!');
            return;
        }
        
        const applications = await response.json();
        displayApplications(applications);
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
        alert('Ошибка загрузки заявок');
    }
}

function displayApplications(applications) {
    const container = document.getElementById('applicationsList');
    const countElement = document.getElementById('applicationsCount');
    
    countElement.textContent = applications.length;
    
    if (applications.length === 0) {
        container.innerHTML = '<p style="text-align: center;">Заявок пока нет</p>';
        return;
    }
    
    container.innerHTML = applications.map(app => `
        <div class="application-card ${app.status}">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <h3>👤 ${app.nickname}</h3>
                    <p><strong>Роль:</strong> ${getRoleName(app.role)}</p>
                    <p><strong>Discord:</strong> ${app.discord}</p>
                    <p><strong>GamePass ID:</strong> ${app.gamepassId}</p>
                    <p><strong>Дата:</strong> ${app.date}</p>
                    <p><strong>Сообщение:</strong> ${app.message}</p>
                </div>
                <div style="text-align: right;">
                    <span class="status-badge status-${app.status}">
                        ${getStatusText(app.status)}
                    </span>
                    <div style="margin-top: 10px;">
                        ${app.status === 'pending' ? `
                            <button class="btn-status btn-approve" onclick="updateStatus(${app.id}, 'approved')">
                                ✅ Принять
                            </button>
                            <button class="btn-status btn-reject" onclick="updateStatus(${app.id}, 'rejected')">
                                ❌ Отклонить
                            </button>
                        ` : ''}
                        ${app.status !== 'pending' ? `
                            <button class="btn-status" onclick="updateStatus(${app.id}, 'pending')" style="background: #ffc107;">
                                ⏳ Вернуть в ожидание
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
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

async function updateStatus(applicationId, newStatus) {
    if (!currentSecret) {
        alert('Сначала введи секретный ключ!');
        return;
    }
    
    try {
        const response = await fetch(`/api/application/${applicationId}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                status: newStatus,
                secret: currentSecret 
            })
        });
        
        if (response.ok) {
            refreshApplications(); // Перезагружаем список
        } else {
            alert('Ошибка обновления статуса');
        }
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        alert('Ошибка обновления статуса');
    }
}