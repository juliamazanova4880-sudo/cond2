// unified-system.js - ЕДИНАЯ СИСТЕМА ВСЕХ ФУНКЦИЙ (ИСПРАВЛЕННАЯ)
// Объединяет: каталог, авторизация, корзина, админ-панель

// ========== ГЛОБАЛЬНЫЕ НАСТРОЙКИ ==========
const SYSTEM_CONFIG = {
  APP_NAME: 'Dolce Vita',
  ADMIN_EMAIL: 'admin@dolcevita.com',
  ADMIN_PASSWORD: 'Admin123!',
  CURRENCY: '₽'
};

// ========== БАЗОВЫЙ КАТАЛОГ ==========
const DEFAULT_CATALOG = [
  {
    id: 1,
    name: "Муссовый торт",
    description: "Бисквит 20% | Воздушный мусс 80%",
    price: 450,
    image: "images/tort.jpg",
    category: "торты",
    available: true,
    isDefault: true
  },
  {
    id: 2,
    name: "Чизкейк",
    description: "Сырный крем 90% | Хрустящая основа 10%",
    price: 430,
    image: "images/cheesecake.jpg",
    category: "торты",
    available: true,
    isDefault: true
  },
  {
    id: 3,
    name: "Эклер",
    description: "Заварной крем 50% | Сладкое тесто 50%",
    price: 300,
    image: "images/eclair.jpg",
    category: "десерты",
    available: true,
    isDefault: true
  },
  {
    id: 4,
    name: "Тирамису",
    description: "Крем маскарпоне 80% | Кофейная пропитка 20%",
    price: 500,
    image: "images/tiramisu.jpg",
    category: "десерты",
    available: true,
    isDefault: true
  }
];

// ========== ОСНОВНОЙ КЛАСС СИСТЕМЫ ==========
class UnifiedSystem {
  constructor() {
    this.catalog = [];
    this.users = [];
    this.currentUser = null;
    this.cart = [];
    this.deletedProductIds = [];
    this.isAdmin = false;
  }

  // ========== ИНИЦИАЛИЗАЦИЯ ==========
  init() {
    console.log('🚀 Инициализация единой системы...');
    
    // Добавляем CSS стили
    this.addStyles();
    
    // Загрузка всех данных
    this.loadAllData();
    
    // Инициализация компонентов
    this.initAuthSystem();
    this.initCatalogSystem();
    this.initCartSystem();
    this.initAdminSystem();
    this.initEventListeners();
    
    console.log('✅ Единая система готова!');
  }

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  loadAllData() {
    // Загрузка каталога
    this.loadCatalog();
    
    // Загрузка пользователей
    this.loadUsers();
    
    // Загрузка корзины
    this.loadCart();
    
    // Загрузка текущего пользователя
    this.loadCurrentUser();
  }

  // ========== СИСТЕМА КАТАЛОГА ==========
loadCatalog() {
  try {
    // Загружаем удаленные ID
    const deletedSaved = localStorage.getItem('dolcevita_deleted_products');
    this.deletedProductIds = deletedSaved ? JSON.parse(deletedSaved) : [];
    
    // Загружаем текущий каталог
    const saved = localStorage.getItem('dolcevita_catalog');
    
    if (saved) {
      this.catalog = JSON.parse(saved);
      
      // УБИРАЕМ ДУБЛИКАТЫ по ID
      const uniqueIds = new Set();
      this.catalog = this.catalog.filter(product => {
        if (uniqueIds.has(product.id)) {
          console.warn('Найден дубликат товара:', product);
          return false; // удаляем дубликат
        }
        uniqueIds.add(product.id);
        return true;
      });
      
      // Добавляем недостающие базовые товары (только если они не удалены и не существуют)
      DEFAULT_CATALOG.forEach(defaultProduct => {
        if (this.deletedProductIds.includes(defaultProduct.id)) return;
        
        const exists = this.catalog.find(p => p.id === defaultProduct.id);
        if (!exists) {
          this.catalog.push({ ...defaultProduct });
        }
      });
      
    } else {
      // Новый каталог (исключая удаленные)
      this.catalog = DEFAULT_CATALOG.filter(product => 
        !this.deletedProductIds.includes(product.id)
      );
    }
    
    // Сохраняем исправленный каталог
    this.saveCatalog();
    console.log('📦 Каталог загружен:', this.catalog.length, 'товаров');
    
  } catch (e) {
    console.error('Ошибка загрузки каталога:', e);
    this.catalog = DEFAULT_CATALOG.filter(product => 
      !this.deletedProductIds.includes(product.id)
    );
    this.saveCatalog();
  }
}

  addMissingDefaultProducts() {
    let needsUpdate = false;
    
    DEFAULT_CATALOG.forEach(defaultProduct => {
      if (this.deletedProductIds.includes(defaultProduct.id)) return;
      
      const exists = this.catalog.find(p => p.id === defaultProduct.id);
      if (!exists) {
        this.catalog.push({ ...defaultProduct });
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) this.saveCatalog();
  }

  saveCatalog() {
    localStorage.setItem('dolcevita_catalog', JSON.stringify(this.catalog));
  }

  saveDeletedProducts() {
    localStorage.setItem('dolcevita_deleted_products', JSON.stringify(this.deletedProductIds));
  }
// Отображение каталога — с поддержкой AJAX для базовых товаров
// ========== СИСТЕМА КАТАЛОГА ==========
// Отображение каталога — ГИБРИДНЫЙ ПОДХОД
renderCatalog() {
  const container = document.getElementById('catalog-grid');
  if (!container) return;

  const loading = document.querySelector('.catalog-loading');
  if (loading) loading.style.display = 'block';

  // Проверяем, есть ли изменения в каталоге (не базовые товары или удаления)
  const hasCustomProducts = this.catalog.some(p => !p.isDefault) || 
                           this.deletedProductIds.length > 0 ||
                           this.catalog.length !== 4; // Если товаров не 4

  if (hasCustomProducts) {
    // Если есть кастомные товары или удаления - используем JS-рендер
    console.log('📝 Используем JS-рендер (кастомный каталог)');
    this.renderCatalogJS(container, loading);
  } else {
    // Если только базовые товары - используем AJAX (быстрее)
    console.log('🌐 Используем AJAX-загрузку (базовый каталог)');
    
    // Добавляем timestamp для обхода кэша GitHub
    const cacheBuster = `?v=${Date.now()}`;
    
    fetch(`partials/base-cards.html${cacheBuster}`)
      .then(response => {
        if (!response.ok) throw new Error('Файл не найден');
        return response.text();
      })
      .then(html => {
        container.innerHTML = html;
        if (loading) loading.style.display = 'none';
        this.initCatalogButtons(); // Активируем кнопки
        
        // ✅ ИСПРАВЛЕНО: выравнивание карточек без вызова несуществующей функции
        setTimeout(() => {
          if (window.$) {
            // Используем jQuery если доступен
            let maxHeight = 0;
            $('.catalog-grid .card').each(function() {
              $(this).css('height', 'auto');
              let h = $(this).outerHeight();
              if (h > maxHeight) maxHeight = h;
            });
            $('.catalog-grid .card').css('height', maxHeight + 'px');
            console.log('✅ Карточки выровнены через jQuery');
          } else {
            // Если jQuery нет - используем чистый JS
            const cards = document.querySelectorAll('.catalog-grid .card');
            let maxHeight = 0;
            
            cards.forEach(card => {
              card.style.height = 'auto';
              let h = card.offsetHeight;
              if (h > maxHeight) maxHeight = h;
            });
            
            cards.forEach(card => {
              card.style.height = maxHeight + 'px';
            });
            console.log('✅ Карточки выровнены через JS');
          }
        }, 100);
      })
      .catch(err => {
        console.error('AJAX ошибка:', err);
        // Если AJAX не сработал - используем JS-рендер
        this.renderCatalogJS(container, loading);
      });
  }
}

// JS-рендер (для кастомного каталога)
renderCatalogJS(container, loading) {
  if (loading) loading.style.display = 'none';
  
  if (this.catalog.length === 0) {
    container.innerHTML = `<div class="empty-catalog"><div class="empty-icon">🍰</div><h3>Каталог пуст</h3></div>`;
    return;
  }

  let html = '';
  this.catalog.forEach(product => {
    html += `
      <div class="card" data-id="${product.id}" data-category="${product.category}">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='images/default-product.jpg'">
        <div class="card-content">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="price">${product.price}${SYSTEM_CONFIG.CURRENCY}</div>
          ${product.isDefault ? '<div class="default-badge">🏷️ Базовый</div>' : ''}
          <a href="#" class="card-btn add-to-cart" data-id="${product.id}">
            ${product.available ? 'Заказать' : 'Нет в наличии'}
          </a>
          ${!product.available ? '<div class="out-of-stock">Нет в наличии</div>' : ''}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  this.initCatalogButtons();
  setTimeout(() => this.alignCardsHeight(), 100);
}
  initCatalogSystem() {
    this.renderCatalog();
    this.initFilters();
  }


renderFilteredProductsFallback(products) {
  const container = document.getElementById('catalog-grid');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-catalog">
        <div class="empty-icon">🍰</div>
        <h3>Товары не найдены</h3>
        <p>Попробуйте изменить фильтры</p>
      </div>
    `;
    return;
  }

  let html = '';
  products.forEach(product => {
    html += `
      <div class="card" data-id="${product.id}" data-category="${product.category}">
        <img src="${product.image}" alt="${product.name}" 
             onerror="this.src='images/default-product.jpg'">
        <div class="card-content">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="price">${product.price}${SYSTEM_CONFIG.CURRENCY}</div>
          ${product.isDefault ? '<div class="default-badge">🏷️ Базовый</div>' : ''}
          <a href="#" class="card-btn add-to-cart" data-id="${product.id}">
            ${product.available ? 'Заказать' : 'Нет в наличии'}
          </a>
          ${!product.available ? '<div class="out-of-stock">Нет в наличии</div>' : ''}
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
  this.initCatalogButtons();
}

  // Фильтрация товаров
  initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons?.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        this.filterProducts(filter);
      });
    });
  }

filterProducts(filter) {
  const filtered = filter === 'all' 
    ? this.catalog 
    : this.catalog.filter(p => p.category === filter);
  this.renderFilteredProductsFallback(filtered); // ВСЕГДА через JS
}

  renderFilteredProducts(products) {
    const container = document.getElementById('catalog-grid');
    if (!container) return;
    
    if (products.length === 0) {
      container.innerHTML = `
        <div class="empty-catalog">
          <div class="empty-icon">🍰</div>
          <h3>Товары не найдены</h3>
          <p>Попробуйте изменить фильтры</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    products.forEach(product => {
      html += `
        <div class="card" data-id="${product.id}" data-category="${product.category}">
          <img src="${product.image}" alt="${product.name}" 
               onerror="this.src='images/default-product.jpg'">
          <div class="card-content">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="price">${product.price}${SYSTEM_CONFIG.CURRENCY}</div>
            <a href="#" class="card-btn add-to-cart" data-id="${product.id}">
              ${product.available ? 'Заказать' : 'Нет в наличии'}
            </a>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    this.initCatalogButtons();
  }

  // ========== СИСТЕМА КОРЗИНЫ ==========
  loadCart() {
    try {
      const saved = localStorage.getItem('cart');
      this.cart = saved ? JSON.parse(saved) : [];
      this.updateCartCounter();
    } catch (e) {
      this.cart = [];
      console.error('Ошибка загрузки корзины:', e);
    }
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartCounter();
  }

  updateCartCounter() {
    const totalItems = this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const counter = document.querySelector('.cart-counter');
    if (counter) {
      counter.textContent = totalItems;
    }
  }

  addToCart(product) {
    // Проверяем, есть ли уже такой товар
    const existingIndex = this.cart.findIndex(item => item.name === product.name);
    
    if (existingIndex !== -1) {
      // Увеличиваем количество
      this.cart[existingIndex].quantity = (this.cart[existingIndex].quantity || 1) + 1;
    } else {
      // Добавляем новый товар
      this.cart.push({
        ...product,
        id: Date.now(),
        quantity: 1
      });
    }
    
    this.saveCart();
    this.animateCartIcon();
    this.showToast(`${product.name} добавлен в корзину!`, 'success');
  }

  removeFromCart(id) {
    this.cart = this.cart.filter(item => item.id !== id);
    this.saveCart();
    this.showToast('Товар удален из корзины', 'info');
    this.renderCart();
  }

  updateQuantity(id, change) {
    const itemIndex = this.cart.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
      const newQuantity = (this.cart[itemIndex].quantity || 1) + change;
      
      if (newQuantity < 1) {
        this.removeFromCart(id);
      } else {
        this.cart[itemIndex].quantity = newQuantity;
        this.saveCart();
        this.renderCart();
      }
    }
  }

  clearCart() {
    if (this.cart.length === 0) return;
    
    if (confirm('Очистить корзину?')) {
      this.cart = [];
      this.saveCart();
      this.showToast('Корзина очищена', 'info');
      this.renderCart();
    }
  }

  renderCart() {
    const container = document.getElementById('cart-items-list');
    const totalPriceElement = document.getElementById('total-price');
    const clearBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!container) return;
    
    // Если корзина пуста
    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <h3>Корзина пуста</h3>
          <p>Добавьте товары из каталога</p>
        </div>
      `;
      
      if (totalPriceElement) totalPriceElement.textContent = '0';
      if (clearBtn) clearBtn.disabled = true;
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }
    
    // Рассчитываем общую сумму
    const totalPrice = this.calculateCartTotal();
    
    // Отображаем товары
    let html = '';
    this.cart.forEach(item => {
      const itemTotal = item.price * (item.quantity || 1);
      html += `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${item.price}${SYSTEM_CONFIG.CURRENCY} × ${item.quantity || 1} = ${itemTotal}${SYSTEM_CONFIG.CURRENCY}</div>
          </div>
          <div class="cart-item-controls">
            <div class="cart-item-quantity">
              <button class="quantity-btn minus" data-id="${item.id}">-</button>
              <span>${item.quantity || 1}</span>
              <button class="quantity-btn plus" data-id="${item.id}">+</button>
            </div>
            <button class="remove-btn" data-id="${item.id}">Удалить</button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
    // Обновляем итоговую сумму
    if (totalPriceElement) {
      totalPriceElement.textContent = totalPrice;
    }
    
    // Активируем кнопки
    if (clearBtn) clearBtn.disabled = false;
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    // Добавляем обработчики для кнопок +/- и удаления
    this.initCartItemButtons();
  }

  calculateCartTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  }

  animateCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.classList.add('bounce');
      setTimeout(() => cartIcon.classList.remove('bounce'), 500);
    }
  }

  initCartSystem() {
    this.renderCart();
    this.initCartButtons();
  }

  // Обработчики для кнопок в элементах корзины
  initCartItemButtons() {
    // Кнопки минус
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        this.updateQuantity(id, -1);
      });
    });
    
    // Кнопки плюс
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        this.updateQuantity(id, 1);
      });
    });
    
    // Кнопки удалить
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        this.removeFromCart(id);
      });
    });
  }

  // ========== СИСТЕМА АВТОРИЗАЦИИ ==========
  loadUsers() {
    try {
      const saved = localStorage.getItem('dolcevita_users');
      if (saved) {
        this.users = JSON.parse(saved);
      } else {
        // Создаем администратора по умолчанию
        this.users = [{
          id: 1,
          full_name: "Администратор",
          email: SYSTEM_CONFIG.ADMIN_EMAIL,
          password: SYSTEM_CONFIG.ADMIN_PASSWORD,
          role: "admin"
        }];
        this.saveUsers();
      }
    } catch (e) {
      this.users = [];
      console.error('Ошибка загрузки пользователей:', e);
    }
  }

  loadCurrentUser() {
    try {
      const saved = localStorage.getItem('current_user');
      if (saved) {
        this.currentUser = JSON.parse(saved);
        this.isAdmin = this.currentUser?.role === 'admin';
        this.updateUserMenu();
      }
    } catch (e) {
      this.currentUser = null;
      this.isAdmin = false;
    }
  }

  saveUsers() {
    localStorage.setItem('dolcevita_users', JSON.stringify(this.users));
  }

  saveCurrentUser() {
    if (this.currentUser) {
      localStorage.setItem('current_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('current_user');
    }
  }

  registerUser(userData) {
    // Проверка паролей
    const confirmPassword = document.getElementById('confirm-password')?.value;
    if (userData.password !== confirmPassword) {
      this.showToast('Пароли не совпадают!', 'error');
      return false;
    }
    
    // Проверка уникальности email
    if (this.users.find(u => u.email === userData.email.toLowerCase())) {
      this.showToast('Пользователь с таким email уже существует!', 'error');
      return false;
    }
    
    const newUser = {
      id: Date.now(),
      full_name: userData.full_name,
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      password: userData.password,
      city: userData.city,
      role: 'user',
      registration_date: new Date().toISOString()
    };
    
    this.users.push(newUser);
    this.saveUsers();
    
    // Авторизуем нового пользователя
    this.currentUser = newUser;
    this.saveCurrentUser();
    
    this.updateUserMenu();
    this.showToast(`Регистрация успешна! Добро пожаловать, ${newUser.full_name}!`, 'success');
    return true;
  }

  loginUser(email, password) {
    // Проверка администратора
    if (email === SYSTEM_CONFIG.ADMIN_EMAIL && password === SYSTEM_CONFIG.ADMIN_PASSWORD) {
      this.currentUser = {
        id: 1,
        full_name: "Администратор",
        email: SYSTEM_CONFIG.ADMIN_EMAIL,
        role: "admin"
      };
      this.isAdmin = true;
      this.saveCurrentUser();
      this.updateUserMenu();
      this.showToast('👑 Добро пожаловать, Администратор!', 'success');
      return true;
    }
    
    // Проверка обычного пользователя
    const user = this.users.find(u => 
      u.email === email.toLowerCase() && u.password === password
    );
    
    if (user) {
      this.currentUser = user;
      this.isAdmin = user.role === 'admin';
      this.saveCurrentUser();
      this.updateUserMenu();
      this.showToast(`👋 Добро пожаловать, ${user.full_name}!`, 'success');
      return true;
    }
    
    this.showToast('Неверный email или пароль!', 'error');
    return false;
  }

  logout() {
    this.currentUser = null;
    this.isAdmin = false;
    this.saveCurrentUser();
    this.updateUserMenu();
    this.showToast('Вы вышли из системы', 'info');
  }

  updateUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    if (this.currentUser) {
      // Скрываем кнопки входа/регистрации
      if (loginBtn) loginBtn.style.display = 'none';
      if (registerBtn) registerBtn.style.display = 'none';
      
      // Показываем меню пользователя
      if (userMenu) {
        userMenu.style.display = 'flex';
        
        // Обновляем информацию
        const avatar = userMenu.querySelector('.user-avatar');
        const name = userMenu.querySelector('.user-name');
        const adminLinks = userMenu.querySelectorAll('.admin-link');
        
        if (avatar) avatar.textContent = this.currentUser.full_name.charAt(0).toUpperCase();
        if (name) name.textContent = this.currentUser.full_name;
        
        // Показываем админские ссылки
        if (this.isAdmin) {
          adminLinks.forEach(link => {
            link.style.display = 'block';
            link.onclick = (e) => {
              e.preventDefault();
              this.showAdminPanel();
            };
          });
        }
      }
    } else {
      if (userMenu) userMenu.style.display = 'none';
      if (loginBtn) loginBtn.style.display = 'inline-block';
      if (registerBtn) registerBtn.style.display = 'inline-block';
    }
  }

  initAuthSystem() {
    this.updateUserMenu();
  }

  // ========== АДМИН-ПАНЕЛЬ ==========
  showAdminPanel() {
    console.log('Открытие админ-панели, isAdmin:', this.isAdmin);
    
    if (!this.isAdmin) {
      this.showToast('Требуются права администратора', 'error');
      return;
    }
    
    const modal = this.createModal('👑 Панель администратора', 'admin-panel-modal');
    
    let content = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <button class="admin-btn primary" data-action="catalog">
          📦 Управление каталогом
        </button>
        <button class="admin-btn info" data-action="users">
          👥 Управление пользователями
        </button>
        <button class="admin-btn warning" data-action="system">
          📊 Системная информация
        </button>
        <button class="admin-btn secondary" data-action="deleted">
          🗑️ Скрытые товары (${this.deletedProductIds.length})
        </button>
      </div>
      
      <div id="admin-panel-content">
        <!-- Контент будет загружен -->
      </div>
    `;
    
    const modalContent = modal.querySelector('#admin-panel-modal-content');
    if (modalContent) {
      modalContent.innerHTML = content;
    } else {
      const body = modal.querySelector('.admin-modal-body');
      if (body) {
        body.innerHTML = content;
        body.id = 'admin-panel-modal-content';
      }
    }
    
    this.showSystemInfo();
    modal.style.display = 'flex';
    
    // Добавляем обработчики кнопок
    modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        switch(action) {
          case 'catalog': this.showCatalogManager(); break;
          case 'users': this.showUsersManager(); break;
          case 'system': this.showSystemInfo(); break;
          case 'deleted': this.showDeletedProducts(); break;
        }
      });
    });
  }

  showCatalogManager() {
    const content = document.getElementById('admin-panel-content');
    if (!content) return;
    
    content.innerHTML = `
      <h3 style="color: #432719; margin-top: 0;">📦 Управление каталогом</h3>
      
      <div style="margin-bottom: 20px; display: flex; gap: 10px;">
        <button class="admin-btn primary" data-action="add-product">
          ➕ Добавить товар
        </button>
      </div>
      
      <div class="products-grid" style="display: grid; grid-template-columns: 1fr; gap: 15px;">
        ${this.catalog.map(product => `
          <div class="product-card" style="background: #f8f8f8; padding: 15px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
              <div>
                <strong>${product.name}</strong>
                ${product.isDefault ? '<span style="background: #ffafbc; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">Базовый</span>' : ''}
              </div>
              <div style="font-weight: bold; color: #ffafbc;">${product.price}${SYSTEM_CONFIG.CURRENCY}</div>
            </div>
            <div style="color: #666; margin-bottom: 10px; font-size: 14px;">${product.description}</div>
            <div style="font-size: 12px; color: #888; margin-bottom: 15px;">
              Категория: ${product.category} | 
              ${product.available ? '✅ В наличии' : '❌ Нет в наличии'}
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="admin-btn small edit" data-id="${product.id}">
                ✏️ Редактировать
              </button>
              <button class="admin-btn small ${product.isDefault ? 'archive' : 'delete'}" data-id="${product.id}">
                ${product.isDefault ? '📦 Скрыть' : '🗑️ Удалить'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    // Обработчики для кнопок редактирования и удаления
    content.querySelectorAll('.edit[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        this.editProduct(id);
      });
    });
    
    content.querySelectorAll('.archive[data-id], .delete[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        this.deleteProductConfirm(id);
      });
    });
    
    content.querySelector('[data-action="add-product"]').addEventListener('click', () => {
      this.showAddProductForm();
    });
  }

  deleteProductConfirm(id) {
    const product = this.catalog.find(p => p.id === id);
    if (!product) return;
    
    const message = product.isDefault 
      ? 'Скрыть этот базовый товар? Он будет доступен для восстановления.'
      : 'Удалить этот товар навсегда?';
    
    if (confirm(message)) {
      if (product.isDefault) {
        if (!this.deletedProductIds.includes(id)) {
          this.deletedProductIds.push(id);
          this.saveDeletedProducts();
        }
      }
      
      this.catalog = this.catalog.filter(p => p.id !== id);
      this.saveCatalog();
      this.renderCatalog();
      this.showCatalogManager();
      this.showToast(`✅ ${product.isDefault ? 'Товар скрыт' : 'Товар удален'}`, 'success');
    }
  }

  showDeletedProducts() {
    const content = document.getElementById('admin-panel-content');
    if (!content) return;
    
    let html = `<h3 style="color: #432719; margin-top: 0;">🗑️ Скрытые товары</h3>`;
    
    if (this.deletedProductIds.length === 0) {
      html += `
        <div style="text-align: center; padding: 40px 20px; color: #999;">
          <div style="font-size: 48px; margin-bottom: 20px;">📭</div>
          <p>Нет скрытых товаров</p>
        </div>
      `;
    } else {
      html += '<div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">';
      
      this.deletedProductIds.forEach(id => {
        const defaultProduct = DEFAULT_CATALOG.find(p => p.id === id);
        if (defaultProduct) {
          html += `
            <div style="background: #f8f8f8; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>${defaultProduct.name}</strong>
                <div style="color: #666; font-size: 14px; margin-top: 5px;">${defaultProduct.description}</div>
              </div>
              <button class="admin-btn small success" data-id="${id}">
                🔄 Восстановить
              </button>
            </div>
          `;
        }
      });
      
      html += '</div>';
    }
    
    html += `
      <div style="margin-top: 20px;">
        <button class="admin-btn secondary" data-action="back-to-catalog">
          ← Назад к каталогу
        </button>
      </div>
    `;
    
    content.innerHTML = html;
    
    // Обработчики для кнопок восстановления
    content.querySelectorAll('.success[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        this.restoreProduct(id);
      });
    });
    
    content.querySelector('[data-action="back-to-catalog"]').addEventListener('click', () => {
      this.showCatalogManager();
    });
  }

  restoreProduct(id) {
    this.deletedProductIds = this.deletedProductIds.filter(deletedId => deletedId !== id);
    this.saveDeletedProducts();
    
    const productToRestore = DEFAULT_CATALOG.find(p => p.id === id);
    if (productToRestore && !this.catalog.find(p => p.id === id)) {
      this.catalog.push({ ...productToRestore });
      this.saveCatalog();
      this.renderCatalog();
    }
    
    this.showDeletedProducts();
    this.showToast('✅ Товар восстановлен!', 'success');
  }

  showAddProductForm() {
    const content = document.getElementById('admin-panel-content');
    if (!content) return;
    
    content.innerHTML = `
      <h3 style="color: #432719; margin-top: 0;">➕ Добавить товар</h3>
      
      <form id="add-product-form-admin" style="margin-top: 20px;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; color: #432719; font-weight: 500;">Название товара</label>
          <input type="text" id="new-product-name" required 
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; color: #432719; font-weight: 500;">Описание</label>
          <textarea id="new-product-description" required 
                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; min-height: 80px;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 8px; color: #432719; font-weight: 500;">Цена (${SYSTEM_CONFIG.CURRENCY})</label>
            <input type="number" id="new-product-price" min="0" required 
                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 8px; color: #432719; font-weight: 500;">Категория</label>
            <select id="new-product-category" required 
                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
              <option value="">Выберите</option>
              <option value="торты">Торты</option>
              <option value="десерты">Десерты</option>
              <option value="пирожные">Пирожные</option>
              <option value="печенье">Печенье</option>
              <option value="напитки">Напитки</option>
            </select>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label>
            <input type="checkbox" id="new-product-available" checked>
            Товар доступен для заказа
          </label>
        </div>
        
        <div style="display: flex; gap: 15px;">
          <button type="button" class="admin-btn secondary" data-action="cancel-add">
            ← Отмена
          </button>
          <button type="submit" class="admin-btn primary">
            Добавить товар
          </button>
        </div>
      </form>
    `;
    
    const form = document.getElementById('add-product-form-admin');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const product = {
        name: document.getElementById('new-product-name').value,
        description: document.getElementById('new-product-description').value,
        price: parseInt(document.getElementById('new-product-price').value),
        category: document.getElementById('new-product-category').value,
        image: 'images/default-product.jpg',
        available: document.getElementById('new-product-available').checked
      };
      
      this.addProduct(product);
      this.showCatalogManager();
      this.showToast('✅ Товар добавлен!', 'success');
    });
    
    content.querySelector('[data-action="cancel-add"]').addEventListener('click', () => {
      this.showCatalogManager();
    });
  }

  addProduct(product) {
    const newProduct = {
      ...product,
      id: Date.now(),
      isDefault: false
    };
    
    this.catalog.push(newProduct);
    this.saveCatalog();
    this.renderCatalog();
  }

  editProduct(id) {
    const product = this.catalog.find(p => p.id === id);
    if (!product) return;
    
    const content = document.getElementById('admin-panel-content');
    if (!content) return;
    
    content.innerHTML = `
      <h3 style="color: #432719; margin-top: 0;">✏️ Редактировать товар</h3>
      
      <form id="edit-product-form-admin" style="margin-top: 20px;">
        <input type="hidden" id="edit-product-id" value="${product.id}">
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; color: #432719; font-weight: 500;">Название товара</label>
          <input type="text" id="edit-product-name" value="${product.name}" required 
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; color: #432719; font-weight: 500;">Описание</label>
          <textarea id="edit-product-description" required 
                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; min-height: 80px;">${product.description}</textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 8px; color: #432719; font-weight: 500;">Цена (${SYSTEM_CONFIG.CURRENCY})</label>
            <input type="number" id="edit-product-price" value="${product.price}" min="0" required 
                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 8px; color: #432719; font-weight: 500;">Категория</label>
            <select id="edit-product-category" required 
                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
              <option value="торты" ${product.category === 'торты' ? 'selected' : ''}>Торты</option>
              <option value="десерты" ${product.category === 'десерты' ? 'selected' : ''}>Десерты</option>
              <option value="пирожные" ${product.category === 'пирожные' ? 'selected' : ''}>Пирожные</option>
              <option value="печенье" ${product.category === 'печенье' ? 'selected' : ''}>Печенье</option>
              <option value="напитки" ${product.category === 'напитки' ? 'selected' : ''}>Напитки</option>
            </select>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label>
            <input type="checkbox" id="edit-product-available" ${product.available ? 'checked' : ''}>
            Товар доступен для заказа
          </label>
        </div>
        
        <div style="display: flex; gap: 15px;">
          <button type="button" class="admin-btn secondary" data-action="cancel-edit">
            ← Отмена
          </button>
          <button type="submit" class="admin-btn primary">
            Сохранить изменения
          </button>
        </div>
      </form>
    `;
    
    const form = document.getElementById('edit-product-form-admin');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const updates = {
        name: document.getElementById('edit-product-name').value,
        description: document.getElementById('edit-product-description').value,
        price: parseInt(document.getElementById('edit-product-price').value),
        category: document.getElementById('edit-product-category').value,
        available: document.getElementById('edit-product-available').checked
      };
      
      this.updateProduct(product.id, updates);
      this.showCatalogManager();
      this.showToast('✅ Товар обновлен!', 'success');
    });
    
    content.querySelector('[data-action="cancel-edit"]').addEventListener('click', () => {
      this.showCatalogManager();
    });
  }

  updateProduct(id, updates) {
    const index = this.catalog.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.catalog[index] = { ...this.catalog[index], ...updates };
    this.saveCatalog();
    this.renderCatalog();
    return true;
  }

  showUsersManager() {
    const content = document.getElementById('admin-panel-content');
    if (!content) return;
    
    content.innerHTML = `
      <h3 style="color: #432719; margin-top: 0;">👥 Пользователи системы (${this.users.length})</h3>
      
      <div style="margin-top: 20px;">
        ${this.users.map(user => `
          <div style="background: #f8f8f8; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>${user.full_name}</strong>
                <span style="background: ${user.role === 'admin' ? '#ffafbc' : '#e0e0e0'}; 
                      color: ${user.role === 'admin' ? 'white' : '#666'};
                      padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">
                  ${user.role === 'admin' ? '👑 Админ' : '👤 Пользователь'}
                </span>
              </div>
              <div style="font-size: 12px; color: #888;">
                ID: ${user.id}
              </div>
            </div>
            <div style="color: #666; font-size: 14px; margin-top: 5px;">
              ${user.email}
            </div>
            <div style="font-size: 11px; color: #999; margin-top: 3px;">
              ${new Date(user.registration_date).toLocaleDateString('ru-RU')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  showSystemInfo() {
    const content = document.getElementById('admin-panel-content');
    if (!content) return;
    
    const cartItems = this.cart || [];
    const orders = JSON.parse(localStorage.getItem('dolcevita_orders') || '[]');
    
    content.innerHTML = `
      <h3 style="color: #432719; margin-top: 0;">📊 Системная информация</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
          <div style="font-size: 24px; color: #4CAF50;">${this.catalog.length}</div>
          <div style="color: #666; font-size: 14px;">Товаров в каталоге</div>
        </div>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
          <div style="font-size: 24px; color: #2196F3;">${this.users.length}</div>
          <div style="color: #666; font-size: 14px;">Зарегистрированных пользователей</div>
        </div>
        
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px;">
          <div style="font-size: 24px; color: #ff9800;">${orders.length}</div>
          <div style="color: #666; font-size: 14px;">Оформленных заказов</div>
        </div>
        
        <div style="background: #ffebee; padding: 15px; border-radius: 8px;">
          <div style="font-size: 24px; color: #f44336;">${cartItems.length}</div>
          <div style="color: #666; font-size: 14px;">Товаров в активных корзинах</div>
        </div>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: #f8f8f8; border-radius: 8px;">
        <h4 style="margin-top: 0;">Статистика системы</h4>
        <div style="font-size: 14px; color: #666;">
          <p>📅 Дата: ${new Date().toLocaleDateString('ru-RU')}</p>
          <p>⏰ Время: ${new Date().toLocaleTimeString('ru-RU')}</p>
          <p>🏪 Приложение: ${SYSTEM_CONFIG.APP_NAME}</p>
          <p>👤 Текущий пользователь: ${this.currentUser?.full_name || 'Не авторизован'}</p>
          <p>🎯 Роль: ${this.currentUser?.role === 'admin' ? 'Администратор' : this.currentUser ? 'Пользователь' : 'Гость'}</p>
        </div>
      </div>
    `;
  }

  initAdminSystem() {
    // Добавляем админ-ссылку если пользователь администратор
    setTimeout(() => {
      if (this.isAdmin) {
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
          // Ищем существующую админ-ссылку
          let adminLink = userMenu.querySelector('.admin-link');
          if (!adminLink) {
            // Создаем новую ссылку
            adminLink = document.createElement('a');
            adminLink.href = '#';
            adminLink.className = 'dropdown-link admin-link';
            adminLink.innerHTML = '👑 Админ-панель';
            adminLink.style.display = 'block';
            
            adminLink.addEventListener('click', (e) => {
              e.preventDefault();
              this.showAdminPanel();
            });
            
            // Находим кнопку выхода и вставляем перед ней
            const logoutBtn = userMenu.querySelector('.logout-link');
            if (logoutBtn) {
              userMenu.insertBefore(adminLink, logoutBtn);
            } else {
              userMenu.appendChild(adminLink);
            }
          }
        }
      }
    }, 500);
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
  createModal(title, id) {
    const oldModal = document.getElementById(id);
    if (oldModal) oldModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.id = id;
    
    modal.innerHTML = `
      <div class="admin-modal-content">
        <div class="admin-modal-header">
          <h2>${title}</h2>
          <button class="close-admin-modal">&times;</button>
        </div>
        <div class="admin-modal-body"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчик закрытия
    const closeBtn = modal.querySelector('.close-admin-modal');
    closeBtn.addEventListener('click', () => {
      this.closeModal(id);
    });
    
    // Закрытие при клике вне окна
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(id);
      }
    });
    
    return modal;
  }

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = 'none';
      setTimeout(() => modal.remove(), 300);
    }
  }

// ====== Vue-реализация уведомлений (без синтаксических ошибок) ======
showToast(message, type = 'info') {
  // Вспомогательная функция — определена внутри showToast
  const initVueToasts = () => {
    if (window.toastApp) return; // уже инициализировано

    const { createApp, ref, h, TransitionGroup } = Vue;
    const toasts = ref([]);

    const ToastItem = {
      props: ['toast'],
      setup(props) {
        return () => h('div', {
          class: `toast-item toast-${props.toast.type || 'info'}`
        }, props.toast.message);
      }
    };

    const toastComponent = {
      setup() {
        return () => h(TransitionGroup, {
          name: "toast",
          tag: "div",
          class: "vue-toasts-container"
        }, () => toasts.value.map(toast =>
          h(ToastItem, { key: toast.id, toast })
        ));
      }
    };

    const app = createApp(toastComponent);
    app.mount('#vue-toasts');

    window.vueAddToast = (msg, tp = 'info') => {
      const id = Date.now() + Math.random();
      toasts.value.push({ id, message: msg, type: tp });
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id);
      }, 3000);
    };

    window.toastApp = app; // помечаем как инициализированное
  };

  // Инициализируем при первом вызове
  if (!window.vueAddToast) {
    initVueToasts();
  }

  // Показываем уведомление
  window.vueAddToast(message, type);
}
  // ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
initCatalogButtons() {
  document.addEventListener('click', (e) => {
    const addToCartBtn = e.target.closest('.add-to-cart');
    if (!addToCartBtn) return;
    e.preventDefault();
    const productId = parseInt(addToCartBtn.dataset.id);
    const product = this.catalog.find(p => p.id === productId);
    if (!product || !product.available) {
      this.showToast('Этот товар временно отсутствует', 'warning');
      return;
    }
    this.addToCart(product);
    this.animateAddToCart(addToCartBtn, product);
  });
}

alignCardsHeight() {

  setTimeout(() => {
    if (window.$) {
      let maxHeight = 0;
      $('.catalog-grid .card').each(function() {
        $(this).css('height', 'auto');
        let h = $(this).outerHeight();
        if (h > maxHeight) maxHeight = h;
      });
      $('.catalog-grid .card').css('height', maxHeight + 'px');
    } else {
      const cards = document.querySelectorAll('.catalog-grid .card');
      let maxHeight = 0;
      
      cards.forEach(card => {
        card.style.height = 'auto';
        let h = card.offsetHeight;
        if (h > maxHeight) maxHeight = h;
      });
      
      cards.forEach(card => {
        card.style.height = maxHeight + 'px';
      });
    }
  }, 100);
}

  initCartButtons() {
    // Открытие корзины
    document.querySelector('.cart-icon')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showCart();
    });
    
    // Кнопка закрытия корзины
    document.getElementById('close-cart-modal')?.addEventListener('click', () => {
      this.hideCart();
    });
    
    // Кнопка очистки корзины
    document.getElementById('clear-cart-btn')?.addEventListener('click', () => {
      this.clearCart();
    });
    
    // Кнопка оформления заказа
    document.getElementById('checkout-btn')?.addEventListener('click', () => {
      this.checkout();
    });
    
    // Универсальные кнопки добавления в корзину
    document.addEventListener('click', (e) => {
      if (e.target.matches('#winter-cheesecake-btn, .slide-btn[data-add-to-cart]')) {
        e.preventDefault();
        this.addToCart({
          name: 'Чизкейк «Снежная сказка»',
          price: 450,
          description: 'Зимний чизкейк с мандарином'
        });
      }
    });
  }

  animateAddToCart(button, product) {
    const flyIcon = document.createElement('div');
    flyIcon.className = 'flying-icon';
    flyIcon.textContent = '🛒';
    flyIcon.style.cssText = `
      position: fixed;
      font-size: 24px;
      color: #ffafbc;
      z-index: 10000;
      pointer-events: none;
    `;
    
    const btnRect = button.getBoundingClientRect();
    flyIcon.style.left = (btnRect.left + 15) + 'px';
    flyIcon.style.top = (btnRect.top + 15) + 'px';
    
    document.body.appendChild(flyIcon);
    
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect();
      
      const animation = flyIcon.animate([
        {
          left: flyIcon.style.left,
          top: flyIcon.style.top,
          fontSize: '24px',
          opacity: 1
        },
        {
          left: (cartRect.left + 10) + 'px',
          top: (cartRect.top + 10) + 'px',
          fontSize: '12px',
          opacity: 0.7
        }
      ], {
        duration: 800,
        easing: 'ease-in-out'
      });
      
      animation.onfinish = () => {
        flyIcon.remove();
        this.animateCartIcon();
      };
    } else {
      flyIcon.remove();
      this.animateCartIcon();
    }
  }

  showCart() {
    this.renderCart();
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
      cartModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  hideCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
      cartModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  // ========== ГЛАВНЫЕ ОБРАБОТЧИКИ ==========
  initEventListeners() {
    // Закрытие модальных окон
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', function() {
        const modal = this.closest('.modal-overlay');
        if (modal) {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
        }
      });
    });
    
    // Закрытие при клике вне окна
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          this.style.display = 'none';
          document.body.style.overflow = 'auto';
        }
      });
    });
    
    // Открытие окна регистрации
    document.getElementById('register-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('register-modal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
    
    // Открытие окна входа
    document.getElementById('login-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-modal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
    
    // Переход от входа к регистрации
    document.getElementById('go-to-register')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-modal').style.display = 'none';
      document.getElementById('register-modal').style.display = 'flex';
    });
    
    // Форма регистрации
    document.getElementById('registration-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const userData = {
        full_name: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value,
        city: document.getElementById('city').value
      };
      
      if (this.registerUser(userData)) {
        document.getElementById('register-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
    
    // Форма входа
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      if (this.loginUser(email, password)) {
        document.getElementById('login-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
    
    // Выход из системы
    document.getElementById('logout-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.logout();
    });
  }

  checkout() {
    if (this.cart.length === 0) {
      this.showToast('Корзина пуста', 'error');
      return;
    }
    
    if (!this.currentUser) {
      this.showToast('Для оформления заказа необходимо войти в систему', 'error');
      this.hideCart();
      setTimeout(() => {
        document.getElementById('login-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }, 300);
      return;
    }
    
    const total = this.calculateCartTotal();
    if (confirm(`Оформить заказ на сумму ${total}${SYSTEM_CONFIG.CURRENCY}?`)) {
      this.showToast(`Заказ оформлен, ${this.currentUser.full_name}!`, 'success');
      this.clearCart();
      this.hideCart();
    }
  }

  // ========== CSS СТИЛИ ==========
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Стили для уведомлений */
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      
      .system-toast {
        animation: slideIn 0.3s ease;
      }
      
      /* Стили для корзины */
      .cart-icon.bounce {
        animation: bounce 0.5s;
      }
      
      @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
      
      .flying-icon {
        z-index: 10000;
        pointer-events: none;
      }
      
      /* Стили для админ-панели */
.admin-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  z-index: 10001;
  justify-content: center;
  align-items: center;
  font-family: 'Playfair Display', serif;
}
.admin-modal-content {
  background: #fff9f9; /* Бледно-розовый фон */
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(255, 120, 150, 0.25);
  border: 1px solid #ffe0e6;
  animation: modalFade 0.3s ease;
  color: #432719; /* Основной тёмно-коричневый текст */
}
      
      .admin-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid #ffebef;
  background: #fff0f3;
  border-radius: 16px 16px 0 0;
}
.admin-modal-header h2 {
  margin: 0;
  color: #432719;
  font-size: 24px;
  font-weight: 600;
}
.close-admin-modal {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #ff6b6b;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border-radius: 50%;
  transition: background 0.2s;
}
      
.close-admin-modal:hover {
  background: #ffebef;
  color: #d32f2f;
}
.admin-modal-body {
  padding: 24px;
  color: #432719;
}
.admin-btn {
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  text-align: center;
  font-size: 14px;
  font-family: 'Playfair Display', serif;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.admin-btn.primary {
  background: #ffafbc;
  color: #432719;
}
      
.admin-btn.secondary {
  background: #f5e6e8;
  color: #432719;
}
.admin-btn.success {
  background: #c8e6c9;
  color: #2e7d32;
}
.admin-btn.warning {
  background: #ffe0b2;
  color: #e65100;
}
      
.admin-btn.info {
  background: #e3f2fd;
  color: #0d47a1;
}
.admin-btn.delete, .admin-btn.archive {
  background: #ffcdd2;
  color: #b71c1c;
}
.admin-btn.small {
  padding: 8px 16px;
  font-size: 13px;
}
      
.admin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  opacity: 0.95;
}
      
      @keyframes modalFade {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .product-card {
  background: #fff0f3 !important;
  border: 1px solid #ffebef;
}
/* Убедимся, что текст не белый */
.admin-modal-body h3,
.admin-modal-body p,
.admin-modal-body div,
.admin-modal-body label,
.admin-modal-body option {
  color: #432719 !important;
}
/* Стили для таблицы пользователей */
.admin-modal-body strong {
  color: #432719;
}
      /* Стили для каталога */
      .empty-catalog {
        text-align: center;
        padding: 60px 20px;
        grid-column: 1 / -1;
      }
      
      .empty-icon {
        font-size: 60px;
        margin-bottom: 20px;
        color: #ddd;
      }
      
      .default-badge {
        display: inline-block;
        background: #ffafbc;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        margin-left: 8px;
      }
      
      .out-of-stock {
        background: #ff6b6b;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        margin-top: 10px;
        display: inline-block;
      }
      
      /* Стили для корзины */
      .empty-cart {
        text-align: center;
        padding: 40px 20px;
      }
      
      .empty-cart-icon {
        font-size: 60px;
        margin-bottom: 20px;
        color: #ddd;
      }
      
      .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #eee;
        background: #f9f9f9;
        border-radius: 8px;
        margin-bottom: 10px;
      }
      
      .cart-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }
      
      .cart-item-info {
        flex: 1;
      }
      
      .cart-item-name {
        font-weight: 600;
        color: #432719;
        margin-bottom: 5px;
      }
      
      .cart-item-price {
        color: #666;
        font-size: 14px;
      }
      
      .cart-item-controls {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      
      .cart-item-quantity {
        display: flex;
        align-items: center;
        gap: 10px;
        background: white;
        padding: 5px 10px;
        border-radius: 20px;
        border: 1px solid #ddd;
      }
      
      .quantity-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: #ffafbc;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        transition: all 0.3s;
      }
      
      .quantity-btn:hover {
        background: #ff97a8;
        transform: scale(1.1);
      }
      
      .quantity-btn:active {
        transform: scale(0.95);
      }
      
      .cart-item-quantity span {
        min-width: 20px;
        text-align: center;
        font-weight: 600;
      }
      
      .remove-btn {
        background: #ff6b6b;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.3s;
      }
      
      .remove-btn:hover {
        background: #ff5252;
        transform: translateY(-2px);
      }
      
      /* Стили для меню пользователя */
      .user-menu {
        display: none;
        position: relative;
      }
      
      .user-btn {
        background: none;
        border: 1px solid #ddd;
        border-radius: 50px;
        padding: 8px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .user-avatar {
        width: 30px;
        height: 30px;
        background: #ffafbc;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
      }
      
      .user-dropdown {
        display: none;
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 10px 0;
        min-width: 200px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
      }
      
      .user-btn:hover + .user-dropdown,
      .user-dropdown:hover {
        display: block;
      }
      
      .dropdown-link {
        display: block;
        padding: 10px 20px;
        color: #333;
        text-decoration: none;
        transition: background 0.3s;
        font-size: 14px;
      }
      
      .dropdown-link:hover {
        background: #f5f5f5;
      }
      
      .admin-link {
        color: #ffafbc !important;
        font-weight: 600;
      }
      
      .logout-link {
        color: #ff6b6b !important;
        border-top: 1px solid #eee;
        margin-top: 5px;
        padding-top: 12px;
      }
    `;
    document.head.appendChild(style);
  }
}

// ========== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ==========
document.addEventListener('DOMContentLoaded', () => {
  // Создаем экземпляр системы
  window.unifiedSystem = new UnifiedSystem();
  
  // Инициализируем систему
  window.unifiedSystem.init();
  
  console.log('🚀 Единая система инициализирована!');
});


