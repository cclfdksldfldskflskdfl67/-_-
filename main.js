// ================================================================
//  ХРАНИЛИЩЕ (localStorage)
// ================================================================
const DB = {
    getUsers() { return JSON.parse(localStorage.getItem('users')) || []; },
    setUsers(u) { localStorage.setItem('users', JSON.stringify(u)); },
    getRequests() { return JSON.parse(localStorage.getItem('requests')) || []; },
    setRequests(r) { localStorage.setItem('requests', JSON.stringify(r)); },
    getReviews() { return JSON.parse(localStorage.getItem('reviews')) || []; },
    setReviews(r) { localStorage.setItem('reviews', JSON.stringify(r)); },
    getCurrentUser() {
        const data = JSON.parse(localStorage.getItem('currentUser'));
        return data ? data : null;
    },
    setCurrentUser(u) {
        if (u) localStorage.setItem('currentUser', JSON.stringify(u));
        else localStorage.removeItem('currentUser');
    }
};

// Инициализация: если нет пользователей, создаём админа
if (!localStorage.getItem('users')) {
    DB.setUsers([
        { login: 'Admin26', password: 'Demo20', name: 'Администратор', phone: '', email: '' }
    ]);
}

// Создаём тестовые заявки если их нет
if (!localStorage.getItem('requests')) {
    DB.setRequests([
        { id: 'req-1', userLogin: 'Admin26', course: 'Повышение квалификации', date: '15.01.2026', payment: 'Оплата картой МИР', status: 'Новая' },
        { id: 'req-2', userLogin: 'Admin26', course: 'Курс по охране труда', date: '20.02.2026', payment: 'Предоплата по QR-коду', status: 'Идет обучение' },
        { id: 'req-3', userLogin: 'Admin26', course: 'Курс переподготовки', date: '10.03.2026', payment: 'Постоплата в офисе', status: 'Обучение завершено' },
    ]);
}

// ================================================================
//  ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================================================
function showToast(msg, duration = 2500) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

function navigate(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function getStatusClass(status) {
    if (status === 'Новая') return 'status-new';
    if (status === 'Идет обучение') return 'status-learning';
    if (status === 'Обучение завершено') return 'status-done';
    return '';
}

function isValidLogin(login) {
    return /^[A-Za-z0-9]{6,}$/.test(login);
}

function isValidPassword(pass) {
    return pass.length >= 8;
}

function isValidDate(d) {
    return /^\d{2}\.\d{2}\.\d{4}$/.test(d);
}

// ================================================================
//  РЕГИСТРАЦИЯ
// ================================================================
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const login = document.getElementById('regLogin').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();

    let valid = true;
    const loginErr = document.getElementById('regLoginError');
    const passErr = document.getElementById('regPassError');

    if (!isValidLogin(login)) {
        loginErr.classList.add('show');
        valid = false;
    } else {
        loginErr.classList.remove('show');
    }

    if (!isValidPassword(password)) {
        passErr.classList.add('show');
        valid = false;
    } else {
        passErr.classList.remove('show');
    }

    if (!name || !phone || !email) {
        showToast('Заполните все поля!');
        valid = false;
    }

    if (!valid) return;

    const users = DB.getUsers();
    if (users.find(u => u.login === login)) {
        showToast('Логин уже занят');
        return;
    }

    users.push({ login, password, name, phone, email });
    DB.setUsers(users);
    showToast('Регистрация успешна! Войдите.');
    navigate('page-login');
    document.getElementById('registerForm').reset();
});

// ================================================================
//  АВТОРИЗАЦИЯ
// ================================================================
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const login = document.getElementById('loginLogin').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const err = document.getElementById('loginError');

    const users = DB.getUsers();
    const user = users.find(u => u.login === login && u.password === password);
    if (user) {
        err.classList.remove('show');
        DB.setCurrentUser(user);
        showToast('Добро пожаловать, ' + user.name);
        navigate('page-profile');
        renderProfile();
        document.getElementById('loginForm').reset();
    } else {
        err.classList.add('show');
    }
});

// ================================================================
//  ВЫХОД
// ================================================================
document.getElementById('logoutBtn').addEventListener('click', () => {
    DB.setCurrentUser(null);
    navigate('page-login');
    showToast('Вы вышли');
});
document.getElementById('adminLogoutBtn').addEventListener('click', () => {
    DB.setCurrentUser(null);
    navigate('page-login');
    showToast('Вы вышли');
});

// ================================================================
//  НАВИГАЦИЯ
// ================================================================
document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', function() {
        const page = this.dataset.page;
        if (page === 'page-admin') {
            const user = DB.getCurrentUser();
            if (!user || user.login !== 'Admin26') {
                showToast('Доступ только для администратора');
                return;
            }
        }
        if (page === 'page-profile' || page === 'page-request') {
            const user = DB.getCurrentUser();
            if (!user) {
                showToast('Сначала войдите в систему');
                navigate('page-login');
                return;
            }
        }
        navigate(page);
        if (page === 'page-profile') renderProfile();
        if (page === 'page-admin') renderAdmin();
    });
});

// Админ кнопка в навигации
document.getElementById('adminNavBtn').addEventListener('click', function() {
    const user = DB.getCurrentUser();
    if (!user || user.login !== 'Admin26') {
        showToast('Доступ только для администратора');
        return;
    }
    navigate('page-admin');
    renderAdmin();
});

document.getElementById('backToProfileFromRequest').addEventListener('click', () => {
    const user = DB.getCurrentUser();
    if (!user) { navigate('page-login'); return; }
    navigate('page-profile');
    renderProfile();
});

// ================================================================
//  ЗВЁЗДЫ ДЛЯ ОТЗЫВОВ
// ================================================================
let selectedRating = 0;
const stars = document.querySelectorAll('.star');
const ratingText = document.getElementById('ratingText');

stars.forEach(star => {
    star.addEventListener('click', function() {
        selectedRating = parseInt(this.dataset.value);
        updateStars();
    });
    star.addEventListener('mouseenter', function() {
        const val = parseInt(this.dataset.value);
        stars.forEach(s => {
            if (parseInt(s.dataset.value) <= val) {
                s.style.color = '#f5b342';
            } else {
                s.style.color = '#ced4da';
            }
        });
    });
    star.addEventListener('mouseleave', function() {
        updateStars();
    });
});

function updateStars() {
    stars.forEach(s => {
        const val = parseInt(s.dataset.value);
        if (val <= selectedRating) {
            s.classList.add('active');
            s.style.color = '#f5b342';
        } else {
            s.classList.remove('active');
            s.style.color = '#ced4da';
        }
    });
    const labels = ['', 'Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично!'];
    ratingText.textContent = selectedRating > 0 ? `${selectedRating} ★ — ${labels[selectedRating]}` : 'Выберите оценку';
}

// ================================================================
//  СЛАЙДЕР
// ================================================================
let currentSlide = 0;
const track = document.getElementById('sliderTrack');
const slides = track.querySelectorAll('.slider-slide');
const dotsContainer = document.getElementById('sliderDots');
const totalSlides = slides.length;

for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.dataset.index = i;
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
}

function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    document.querySelectorAll('.slider-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

document.getElementById('sliderPrev').addEventListener('click', () => goToSlide(currentSlide - 1));
document.getElementById('sliderNext').addEventListener('click', () => goToSlide(currentSlide + 1));

let autoSlide = setInterval(() => goToSlide(currentSlide + 1), 3000);

document.querySelectorAll('.slider-btn, .slider-dot').forEach(el => {
    el.addEventListener('click', () => {
        clearInterval(autoSlide);
        autoSlide = setInterval(() => goToSlide(currentSlide + 1), 3000);
    });
});

// ================================================================
//  ЛИЧНЫЙ КАБИНЕТ
// ================================================================
function renderProfile() {
    const user = DB.getCurrentUser();
    if (!user) return;
    document.getElementById('profileUser').textContent = user.name;

    const allRequests = DB.getRequests();
    const userRequests = allRequests.filter(r => r.userLogin === user.login);
    const container = document.getElementById('profileRequests');
    container.innerHTML = '';
    if (userRequests.length === 0) {
        container.innerHTML = '<p class="text-small">У вас пока нет заявок</p>';
    } else {
        userRequests.forEach((r) => {
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `
                <div class="flex-between">
                    <strong>${r.course}</strong>
                    <span class="status-badge ${getStatusClass(r.status)}">${r.status}</span>
                </div>
                <div class="text-small">Дата: ${r.date} | Оплата: ${r.payment}</div>
                ${r.status === 'Обучение завершено' ? `<div class="text-small" style="color:#0d47a1;">✅ Можно оставить отзыв</div>` : ''}
            `;
            container.appendChild(div);
        });
    }

    // Обновляем выпадающий список для отзывов
    const select = document.getElementById('reviewRequestSelect');
    select.innerHTML = '<option value="">— выберите завершённую заявку —</option>';
    userRequests.filter(r => r.status === 'Обучение завершено').forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `${r.course} (${r.date})`;
        select.appendChild(opt);
    });

    // Отображаем отзывы
    renderReviews();
}

function renderReviews() {
    const user = DB.getCurrentUser();
    if (!user) return;
    const allReviews = DB.getReviews();
    const userReviews = allReviews.filter(r => r.userLogin === user.login);
    const reviewsContainer = document.getElementById('reviewsList');
    reviewsContainer.innerHTML = '';
    if (userReviews.length === 0) {
        reviewsContainer.innerHTML = '<p class="text-small">Отзывов пока нет</p>';
    } else {
        userReviews.forEach(r => {
            const div = document.createElement('div');
            div.className = 'review-item';
            const stars = '★'.repeat(r.rating || 0) + '☆'.repeat(5 - (r.rating || 0));
            const moodEmojis = { positive: '😊', neutral: '😐', negative: '😞' };
            div.innerHTML = `
                <div class="flex-between">
                    <strong>${r.course}</strong>
                    <span class="review-stars">${stars}</span>
                </div>
                <div>
                    <span class="review-mood">${moodEmojis[r.mood] || '😊'}</span>
                    <span class="text-small">${r.text}</span>
                </div>
                <div class="text-small" style="color:#999;margin-top:4px;">${r.date || ''}</div>
            `;
            reviewsContainer.appendChild(div);
        });
    }
}

// ================================================================
//  ОТПРАВКА ОТЗЫВА
// ================================================================
document.getElementById('submitReviewBtn').addEventListener('click', function() {
    const user = DB.getCurrentUser();
    if (!user) { showToast('Войдите в систему'); return; }
    const select = document.getElementById('reviewRequestSelect');
    const text = document.getElementById('reviewText').value.trim();
    const mood = document.getElementById('reviewMood').value;
    
    if (!select.value) { showToast('Выберите завершённую заявку'); return; }
    if (!text) { showToast('Напишите текст отзыва'); return; }
    if (selectedRating === 0) { showToast('Поставьте оценку'); return; }

    const allRequests = DB.getRequests();
    const request = allRequests.find(r => r.id === select.value);
    if (!request) { showToast('Заявка не найдена'); return; }

    const reviews = DB.getReviews();
    reviews.push({
        userLogin: user.login,
        course: request.course,
        text: text,
        rating: selectedRating,
        mood: mood,
        date: new Date().toLocaleDateString()
    });
    DB.setReviews(reviews);
    showToast('Отзыв сохранён! Спасибо!');
    document.getElementById('reviewText').value = '';
    selectedRating = 0;
    updateStars();
    renderReviews();
});

// ================================================================
//  НОВАЯ ЗАЯВКА
// ================================================================
document.getElementById('requestForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = DB.getCurrentUser();
    if (!user) { showToast('Войдите в систему'); return; }

    const course = document.getElementById('requestCourse').value;
    const date = document.getElementById('requestDate').value.trim();
    const payment = document.getElementById('requestPayment').value;
    const dateErr = document.getElementById('requestDateError');

    if (!isValidDate(date)) {
        dateErr.classList.add('show');
        return;
    } else {
        dateErr.classList.remove('show');
    }

    const requests = DB.getRequests();
    const newReq = {
        id: `req-${Date.now()}`,
        userLogin: user.login,
        course: course,
        date: date,
        payment: payment,
        status: 'Новая'
    };
    requests.push(newReq);
    DB.setRequests(requests);
    showToast('Заявка отправлена!');
    document.getElementById('requestForm').reset();
    navigate('page-profile');
    renderProfile();
});

// ================================================================
//  АДМИНКА
// ================================================================
let adminCurrentPage = 1;
const adminPageSize = 5;

function renderAdmin() {
    const allRequests = DB.getRequests();
    const statusFilter = document.getElementById('adminStatusFilter').value;
    const searchQuery = document.getElementById('adminSearch').value.toLowerCase();

    let filtered = allRequests;
    if (statusFilter !== 'all') {
        filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (searchQuery) {
        filtered = filtered.filter(r => 
            r.course.toLowerCase().includes(searchQuery) || 
            r.userLogin.toLowerCase().includes(searchQuery)
        );
    }

    // Статистика
    document.getElementById('statTotal').textContent = allRequests.length;
    document.getElementById('statNew').textContent = allRequests.filter(r => r.status === 'Новая').length;
    document.getElementById('statLearning').textContent = allRequests.filter(r => r.status === 'Идет обучение').length;
    document.getElementById('statDone').textContent = allRequests.filter(r => r.status === 'Обучение завершено').length;

    const totalPages = Math.ceil(filtered.length / adminPageSize) || 1;
    if (adminCurrentPage > totalPages) adminCurrentPage = totalPages;
    const start = (adminCurrentPage - 1) * adminPageSize;
    const pageItems = filtered.slice(start, start + adminPageSize);

    const container = document.getElementById('adminRequestsList');
    container.innerHTML = '';
    if (pageItems.length === 0) {
        container.innerHTML = '<p class="text-small">Заявок нет</p>';
    } else {
        pageItems.forEach(r => {
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `
                <div class="flex-between">
                    <div><strong>${r.course}</strong> <span class="text-small">(${r.userLogin})</span></div>
                    <div>
                        <select class="status-select" data-id="${r.id}" style="width:auto;padding:4px 10px;border-radius:40px;font-size:13px;">
                            <option value="Новая" ${r.status === 'Новая' ? 'selected' : ''}>Новая</option>
                            <option value="Идет обучение" ${r.status === 'Идет обучение' ? 'selected' : ''}>Идет обучение</option>
                            <option value="Обучение завершено" ${r.status === 'Обучение завершено' ? 'selected' : ''}>Обучение завершено</option>
                        </select>
                    </div>
                </div>
                <div class="text-small">Дата: ${r.date} | Оплата: ${r.payment}</div>
                <span class="status-badge ${getStatusClass(r.status)}">${r.status}</span>
            `;
            container.appendChild(div);
        });
    }

    const pagContainer = document.getElementById('adminPagination');
    pagContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === adminCurrentPage ? 'active' : '';
        btn.addEventListener('click', () => {
            adminCurrentPage = i;
            renderAdmin();
        });
        pagContainer.appendChild(btn);
    }

    document.querySelectorAll('.status-select').forEach(sel => {
        sel.addEventListener('change', function() {
            const id = this.dataset.id;
            const newStatus = this.value;
            const requests = DB.getRequests();
            const req = requests.find(r => r.id === id);
            if (req) {
                req.status = newStatus;
                DB.setRequests(requests);
                showToast(`Статус изменён на «${newStatus}»`);
                renderAdmin();
            }
        });
    });
}

// Очистка фильтров
document.getElementById('adminClearFilters').addEventListener('click', function() {
    document.getElementById('adminStatusFilter').value = 'all';
    document.getElementById('adminSearch').value = '';
    adminCurrentPage = 1;
    renderAdmin();
});

document.getElementById('adminStatusFilter').addEventListener('change', () => {
    adminCurrentPage = 1;
    renderAdmin();
});
document.getElementById('adminSearch').addEventListener('input', () => {
    adminCurrentPage = 1;
    renderAdmin();
});

// ================================================================
//  ИНИЦИАЛИЗАЦИЯ
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
    const user = DB.getCurrentUser();
    if (user) {
        navigate('page-profile');
        renderProfile();
    } else {
        navigate('page-login');
    }
});