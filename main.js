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

// Инициализация
if (!localStorage.getItem('users')) {
    DB.setUsers([
        { login: 'Admin26', password: 'Demo20', name: 'Администратор', phone: '', email: '' }
    ]);
}

if (!localStorage.getItem('requests') || DB.getRequests().length === 0) {
    DB.setRequests([
        { id: 'req-1', userLogin: 'Admin26', course: 'Повышение квалификации', date: '15.01.2026', payment: 'Оплата картой МИР', status: 'Новая' },
        { id: 'req-2', userLogin: 'Admin26', course: 'Курс по охране труда', date: '20.02.2026', payment: 'Предоплата по QR-коду', status: 'Идет обучение' },
        { id: 'req-3', userLogin: 'Admin26', course: 'Курс переподготовки', date: '10.03.2026', payment: 'Постоплата в офисе', status: 'Обучение завершено' },
        { id: 'req-4', userLogin: 'Admin26', course: 'Курс профессиональной безопасности', date: '05.04.2026', payment: 'Оплата картой МИР', status: 'Обучение завершено' },
    ]);
}

// ================================================================
//  ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================================================
function showToast(msg, duration = 2500, type = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast' + (type ? ' ' + type : '');
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => { t.className = 'toast'; }, 300);
    }, duration);
}

function navigate(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === pageId);
    });
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
        showToast('⚠️ Заполните все поля!', 2500, 'warning');
        valid = false;
    }

    if (!valid) return;

    const users = DB.getUsers();
    if (users.find(u => u.login === login)) {
        showToast('⚠️ Логин уже занят', 2500, 'warning');
        return;
    }

    users.push({ login, password, name, phone, email });
    DB.setUsers(users);
    showToast('✅ Регистрация успешна! Войдите.', 2500, 'success');
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
        showToast('👋 Добро пожаловать, ' + user.name, 2500, 'success');
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
    showToast('👋 До свидания!', 2000);
});
document.getElementById('adminLogoutBtn').addEventListener('click', () => {
    DB.setCurrentUser(null);
    navigate('page-login');
    showToast('👋 До свидания!', 2000);
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
                showToast('⛔ Доступ только для администратора', 2500, 'error');
                return;
            }
        }
        if (page === 'page-profile' || page === 'page-request') {
            const user = DB.getCurrentUser();
            if (!user) {
                showToast('⚠️ Сначала войдите в систему', 2500, 'warning');
                navigate('page-login');
                return;
            }
        }
        navigate(page);
        if (page === 'page-profile') renderProfile();
        if (page === 'page-admin') renderAdmin();
    });
});

document.getElementById('adminNavBtn').addEventListener('click', function() {
    const user = DB.getCurrentUser();
    if (!user || user.login !== 'Admin26') {
        showToast('⛔ Доступ только для администратора', 2500, 'error');
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
        this.style.transform = 'scale(1.3)';
        setTimeout(() => this.style.transform = 'scale(1)', 200);
    });
    star.addEventListener('mouseenter', function() {
        const val = parseInt(this.dataset.value);
        stars.forEach(s => {
            if (parseInt(s.dataset.value) <= val) {
                s.style.color = '#f5b342';
                s.style.transform = 'scale(1.1)';
            } else {
                s.style.color = '#ced4da';
                s.style.transform = 'scale(1)';
            }
        });
    });
    star.addEventListener('mouseleave', function() {
        updateStars();
        stars.forEach(s => s.style.transform = 'scale(1)');
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
    const labels = ['', '😞 Ужасно', '😕 Плохо', '😐 Нормально', '😊 Хорошо', '🌟 Отлично!'];
    ratingText.textContent = selectedRating > 0 ? `${selectedRating} ★ — ${labels[selectedRating]}` : '👆 Выберите оценку';
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

document.getElementById('sliderPrev').addEventListener('click', () => {
    goToSlide(currentSlide - 1);
    showToast('⬅️ Предыдущий слайд', 1000);
});
document.getElementById('sliderNext').addEventListener('click', () => {
    goToSlide(currentSlide + 1);
    showToast('➡️ Следующий слайд', 1000);
});

let autoSlide = setInterval(() => goToSlide(currentSlide + 1), 3000);

document.querySelectorAll('.slider-btn, .slider-dot').forEach(el => {
    el.addEventListener('click', () => {
        clearInterval(autoSlide);
        autoSlide = setInterval(() => goToSlide(currentSlide + 1), 3000);
    });
});

// ================================================================
//  СЧЁТЧИК СИМВОЛОВ
// ================================================================
const reviewText = document.getElementById('reviewText');
const charCount = document.getElementById('charCount');

if (reviewText) {
    reviewText.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;
        if (count > 450) {
            charCount.style.color = '#dc3545';
        } else {
            charCount.style.color = '#999';
        }
    });
}

// ================================================================
//  АВАТАР ПОЛЬЗОВАТЕЛЯ
// ================================================================
const dropZone = document.getElementById('avatarDropZone');
const avatarInput = document.getElementById('avatarInput');
const userAvatar = document.getElementById('userAvatar');

if (dropZone) {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        userAvatar.src = savedAvatar;
    }

    dropZone.addEventListener('click', () => {
        avatarInput.click();
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                userAvatar.src = event.target.result;
                localStorage.setItem('userAvatar', event.target.result);
                showToast('✅ Аватар обновлён!', 2000, 'success');
            };
            reader.readAsDataURL(file);
        }
    });

    avatarInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                userAvatar.src = event.target.result;
                localStorage.setItem('userAvatar', event.target.result);
                showToast('✅ Аватар обновлён!', 2000, 'success');
            };
            reader.readAsDataURL(file);
        }
    });
}

// ================================================================
//  ПРОГРЕСС-БАР
// ================================================================
function updateProgress() {
    const user = DB.getCurrentUser();
    if (!user) return;
    const allRequests = DB.getRequests();
    const userRequests = allRequests.filter(r => r.userLogin === user.login);
    const total = userRequests.length;
    const completed = userRequests.filter(r => r.status === 'Обучение завершено').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const fill = document.getElementById('progressFill');
    const percentLabel = document.getElementById('progressPercent');
    if (fill) fill.style.width = percent + '%';
    if (percentLabel) percentLabel.textContent = percent + '%';
}

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
        container.innerHTML = '<p class="text-small">📭 У вас пока нет заявок</p>';
    } else {
        userRequests.forEach((r) => {
            const div = document.createElement('div');
            div.className = 'card';
            const statusEmoji = { 'Новая': '📌', 'Идет обучение': '📖', 'Обучение завершено': '✅' };
            div.innerHTML = `
                <div class="flex-between">
                    <strong>${r.course}</strong>
                    <span class="status-badge ${getStatusClass(r.status)}">${statusEmoji[r.status] || ''} ${r.status}</span>
                </div>
                <div class="text-small">📅 ${r.date} | 💳 ${r.payment}</div>
                ${r.status === 'Обучение завершено' ? '<div class="text-small" style="color:#0d47a1;">✏️ Можно оставить отзыв</div>' : ''}
            `;
            container.appendChild(div);
        });
    }

    const select = document.getElementById('reviewRequestSelect');
    select.innerHTML = '<option value="">— выберите завершённую заявку —</option>';
    const completedRequests = userRequests.filter(r => r.status === 'Обучение завершено');
    if (completedRequests.length === 0) {
        select.innerHTML = '<option value="">— нет завершённых заявок —</option>';
    } else {
        completedRequests.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = r.course + ' (' + r.date + ')';
            select.appendChild(opt);
        });
    }

    renderReviews();
    updateProgress();
}

function renderReviews() {
    const user = DB.getCurrentUser();
    if (!user) return;
    const allReviews = DB.getReviews();
    const userReviews = allReviews.filter(r => r.userLogin === user.login);
    const reviewsContainer = document.getElementById('reviewsList');
    reviewsContainer.innerHTML = '';
    if (userReviews.length === 0) {
        reviewsContainer.innerHTML = '<p class="text-small">💬 Отзывов пока нет</p>';
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
                <div class="text-small" style="color:#999;margin-top:4px;">📅 ${r.date || ''}</div>
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
    if (!user) { showToast('⚠️ Войдите в систему', 2500, 'warning'); return; }
    const select = document.getElementById('reviewRequestSelect');
    const text = document.getElementById('reviewText').value.trim();
    const mood = document.getElementById('reviewMood').value;
    
    if (!select.value) { showToast('⚠️ Выберите завершённую заявку', 2500, 'warning'); return; }
    if (!text) { showToast('⚠️ Напишите текст отзыва', 2500, 'warning'); return; }
    if (selectedRating === 0) { showToast('⭐ Поставьте оценку', 2500, 'warning'); return; }

    const allRequests = DB.getRequests();
    const request = allRequests.find(r => r.id === select.value);
    if (!request) { showToast('❌ Заявка не найдена', 2500, 'error'); return; }

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
    showToast('✅ Отзыв сохранён! Спасибо! 🌟', 2500, 'success');
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
    if (!user) { showToast('⚠️ Войдите в систему', 2500, 'warning'); return; }

    const course = document.getElementById('requestCourse').value;
    const dateInput = document.getElementById('requestDate').value;
    const payment = document.getElementById('requestPayment').value;
    const dateErr = document.getElementById('requestDateError');

    if (!dateInput) {
        dateErr.classList.add('show');
        return;
    } else {
        dateErr.classList.remove('show');
    }

    const dateParts = dateInput.split('-');
    const formattedDate = dateParts[2] + '.' + dateParts[1] + '.' + dateParts[0];

    const requests = DB.getRequests();
    const newReq = {
        id: 'req-' + Date.now(),
        userLogin: user.login,
        course: course,
        date: formattedDate,
        payment: payment,
        status: 'Новая'
    };
    requests.push(newReq);
    DB.setRequests(requests);
    showToast('✅ Заявка отправлена! 📨', 2500, 'success');
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
        container.innerHTML = '<p class="text-small">📭 Заявок нет</p>';
    } else {
        const statusEmoji = { 'Новая': '📌', 'Идет обучение': '📖', 'Обучение завершено': '✅' };
        pageItems.forEach(r => {
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `
                <div class="flex-between">
                    <div><strong>${r.course}</strong> <span class="text-small">👤 ${r.userLogin}</span></div>
                    <div>
                        <select class="status-select" data-id="${r.id}" style="width:auto;padding:4px 10px;border-radius:40px;font-size:13px;">
                            <option value="Новая" ${r.status === 'Новая' ? 'selected' : ''}>📌 Новая</option>
                            <option value="Идет обучение" ${r.status === 'Идет обучение' ? 'selected' : ''}>📖 Идет обучение</option>
                            <option value="Обучение завершено" ${r.status === 'Обучение завершено' ? 'selected' : ''}>✅ Обучение завершено</option>
                        </select>
                    </div>
                </div>
                <div class="text-small">📅 ${r.date} | 💳 ${r.payment}</div>
                <span class="status-badge ${getStatusClass(r.status)}">${statusEmoji[r.status] || ''} ${r.status}</span>
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
            showToast('📄 Страница ' + i, 1000);
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
                const emoji = { 'Новая': '📌', 'Идет обучение': '📖', 'Обучение завершено': '✅' };
                showToast('✅ Статус изменён на «' + (emoji[newStatus] || '') + ' ' + newStatus + '»', 2500, 'success');
                renderAdmin();
            }
        });
    });
}

document.getElementById('adminClearFilters').addEventListener('click', function() {
    document.getElementById('adminStatusFilter').value = 'all';
    document.getElementById('adminSearch').value = '';
    adminCurrentPage = 1;
    renderAdmin();
    showToast('🧹 Фильтры очищены', 1000);
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
//  ЭКСПОРТ ДАННЫХ
// ================================================================
const exportBtn = document.getElementById('exportDataBtn');
if (exportBtn) {
    exportBtn.addEventListener('click', function() {
        const data = {
            users: DB.getUsers(),
            requests: DB.getRequests(),
            reviews: DB.getReviews(),
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uchus_data_${new Date().toLocaleDateString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 Данные экспортированы!', 2000, 'success');
    });
}

// ================================================================
//  ТЁМНАЯ ТЕМА
// ================================================================
const themeSwitch = document.getElementById('themeSwitch');
let isDarkMode = localStorage.getItem('darkMode') === 'true';

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    themeSwitch.textContent = isDarkMode ? '☀️' : '🌙';
}

if (isDarkMode) {
    document.body.classList.add('dark-mode');
    themeSwitch.textContent = '☀️';
}

themeSwitch.addEventListener('click', toggleTheme);

// ================================================================
//  КНОПКА "НАВЕРХ"
// ================================================================
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ================================================================
//  ПЕЧАТНАЯ МАШИНКА
// ================================================================
(function typingEffect() {
    const title = document.getElementById('typingTitle');
    if (!title) return;
    const text = 'Учусь.РФ';
    let index = 0;
    title.textContent = '';
    
    function type() {
        if (index < text.length) {
            title.textContent += text.charAt(index);
            index++;
            setTimeout(type, 100);
        }
    }
    type();
})();

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