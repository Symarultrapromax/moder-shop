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

document.getElementById('applicationFormElement').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        nickname: document.getElementById('nickname').value,
        discord: document.getElementById('discord').value,
        gamepassId: document.getElementById('gamepassId').value,
        message: document.getElementById('message').value,
        role: document.getElementById('selectedRole').value
    };
    
    try {
        const response = await fetch('/api/submit-application', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Заявка успешно отправлена! Мы свяжемся с вами через Discord.');
            closeForm();
        } else {
            alert('Ошибка при отправке заявки. Попробуйте еще раз.');
        }
    } catch (error) {
        alert('Ошибка соединения. Проверьте интернет и попробуйте еще раз.');
    }
});

document.getElementById('applicationForm').addEventListener('click', function(e) {
    if (e.target === this) {
        closeForm();
    }
});