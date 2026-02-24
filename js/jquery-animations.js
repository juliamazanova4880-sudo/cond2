// === ПОЛНЫЙ ИСПРАВЛЕННЫЙ JQUERY КОД ===
$(document).ready(function() {
  console.log('✅ jQuery подключен и работает!');
  
  // === 1. ФИКС: ВЫРАВНИВАНИЕ КАРТОЧЕК КАТАЛОГА ===
  // Показываем все карточки сразу без анимации
  $('.catalog-grid .card').css({
    'opacity': '1',
    'visibility': 'visible',
    'display': 'block'
  });
  
  // Выравниваем высоту карточек
  function alignCatalogCards() {
    var maxHeight = 0;
    
    // Находим максимальную высоту
    $('.catalog-grid .card').each(function() {
      $(this).css('height', 'auto');
      var cardHeight = $(this).outerHeight();
      if (cardHeight > maxHeight) {
        maxHeight = cardHeight;
      }
    });
    
    // Устанавливаем одинаковую высоту
    $('.catalog-grid .card').css('height', maxHeight + 'px');
  }
  
  // Вызываем после загрузки изображений
  $(window).on('load', function() {
    setTimeout(alignCatalogCards, 100);
  });
  
  // === 2. АНИМАЦИЯ ПРИ НАВЕДЕНИИ НА КАРТОЧКИ ===
  $('.card').hover(
    function() {
      $(this).stop().animate({
        'margin-top': '-10px',
        'box-shadow': '0 15px 30px rgba(255, 175, 188, 0.3)'
      }, 200);
    },
    function() {
      $(this).stop().animate({
        'margin-top': '0',
        'box-shadow': '0 5px 20px rgba(0, 0, 0, 0.05)'
      }, 200);
    }
  );
  
  // === 3. АНИМАЦИЯ ДОБАВЛЕНИЯ В КОРЗИНУ ===
  $('.card-btn, .slide-btn[data-add-to-cart]').click(function(e) {
    e.preventDefault();
    
    var $card = $(this).closest('.card, .slide');
    var productName = $card.find('h3').text() || "Товар";
    
    // Создаем летающую иконку
    var $flyIcon = $('<div class="flying-icon">🛒</div>').css({
      position: 'fixed',
      fontSize: '24px',
      color: '#ffafbc',
      zIndex: 10000,
      left: $(this).offset().left + 15,
      top: $(this).offset().top + 15,
      pointerEvents: 'none'
    }).appendTo('body');
    
    // Анимация полета к корзине
    var cartPos = $('.cart-icon').offset();
    $flyIcon.animate({
      left: cartPos.left + 10,
      top: cartPos.top + 10,
      fontSize: '12px',
      opacity: 0.7
    }, 800, 'swing', function() {
      $(this).remove();
      
      // Показываем всплывающее сообщение
      showToast(productName + ' добавлен в корзину!', '#4CAF50');
      
      // Анимация иконки корзины
      $('.cart-icon').addClass('pulse');
      setTimeout(function() {
        $('.cart-icon').removeClass('pulse');
      }, 500);
    });
    
    // Вызываем вашу существующую функцию добавления в корзину
    if (window.cart && window.cart.add) {
      var priceText = $card.find('.price').text() || "450";
      var price = parseInt(priceText.replace('₽', '').trim()) || 450;
      
      window.cart.add({
        name: productName,
        price: price,
        description: $card.find('p').text() || ''
      });
    }
  });
  
  // === 4. ПЛАВНЫЕ АНИМАЦИИ ДЛЯ КНОПОК ===
  $('.auth-btn, .dessert-btn, .join-btn, .morning-btn, .slide-btn').hover(
    function() {
      $(this).stop().animate({
        'transform': 'scale(1.05)',
        'box-shadow': '0 8px 20px rgba(255, 175, 188, 0.4)'
      }, 200);
    },
    function() {
      $(this).stop().animate({
        'transform': 'scale(1)',
        'box-shadow': 'none'
      }, 200);
    }
  );
  
  // === 5. ПЛАВНЫЙ СКРОЛЛ ДЛЯ ВСЕХ ССЫЛОК ===
  $('a[href^="#"]').not('[href="#"]').click(function(e) {
    e.preventDefault();
    var target = $(this.getAttribute('href'));
    if (target.length) {
      $('html, body').animate({
        scrollTop: target.offset().top - 80
      }, 800, 'swing');
    }
  });
  
  // === 6. ИСПРАВЛЕННЫЙ ПАРАЛЛАКС-ЭФФЕКТ (минимальное движение) ===
  $(window).scroll(function() {
    var scrolled = $(window).scrollTop();
    var parallaxOffset = scrolled * 0.1; // Минимальное движение
    $('.chocolate-bg img').css('transform', 'translateY(' + parallaxOffset + 'px)');
  });
  
  // === 7. ИНТЕРАКТИВНЫЕ ЭФФЕКТЫ ДЛЯ ДЕСЕРТОВ ===
  $('.dessert-image img, .morning-image img').hover(
    function() {
      $(this).stop().animate({
        'transform': 'rotate(2deg) scale(1.02)'
      }, 300);
    },
    function() {
      $(this).stop().animate({
        'transform': 'rotate(0deg) scale(1)'
      }, 300);
    }
  );
  
  // === 8. АНИМАЦИЯ FEATURE-КАРТОЧЕК ===
  // Показываем feature-карточки с анимацией
  $('.feature-card').hide().each(function(i) {
    $(this).delay(i * 100).fadeIn(500);
  });
  
  // Анимация при наведении
  $('.feature-card').hover(
    function() {
      $(this).stop().animate({
        'transform': 'translateY(-5px)',
        'box-shadow': '0 10px 25px rgba(255, 175, 188, 0.2)'
      }, 200);
    },
    function() {
      $(this).stop().animate({
        'transform': 'translateY(0)',
        'box-shadow': '0 5px 20px rgba(0, 0, 0, 0.05)'
      }, 200);
    }
  );
  
  // === 9. АНИМАЦИЯ ПРИ ПРОКРУТКЕ ===
  function animateOnScroll() {
    $('.feature-card, .review-card').each(function() {
      var elementTop = $(this).offset().top;
      var elementBottom = elementTop + $(this).outerHeight();
      var viewportTop = $(window).scrollTop();
      var viewportBottom = viewportTop + $(window).height();
      
      if (elementBottom > viewportTop && elementTop < viewportBottom) {
        if (!$(this).hasClass('animated')) {
          $(this).addClass('animated');
        }
      }
    });
  }
  
  // Запускаем анимацию при скролле
  $(window).scroll(animateOnScroll);
  setTimeout(animateOnScroll, 100);
  
  // === 11. АНИМАЦИЯ ВЫПАДАЮЩИХ МЕНЮ ===
  $('.dropdown').hover(
    function() {
      $(this).find('.dropdown-menu').stop().fadeIn(200);
    },
    function() {
      $(this).find('.dropdown-menu').stop().fadeOut(150);
    }
  );
});

// === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ УВЕДОМЛЕНИЙ ===
function showToast(message, color) {
  var $toast = $('<div class="jq-toast">' + message + '</div>').css({
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: color || '#ffafbc',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    zIndex: '10001',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: 'slideInRight 0.3s ease'
  }).appendTo('body');
  
  setTimeout(function() {
    $toast.fadeOut(300, function() {
      $(this).remove();
    });
  }, 2000);
}

// === ДОБАВЛЯЕМ CSS ДЛЯ АНИМАЦИЙ ===
$('<style>').text(`
  /* === ОСНОВНЫЕ СТИЛИ ДЛЯ JQUERY АНИМАЦИЙ === */
  
  /* 1. ФИКС ДЛЯ КАРТОЧЕК КАТАЛОГА */
  .catalog-grid {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    align-items: stretch !important;
    gap: 30px !important;
  }
  
  .catalog-grid .card {
    display: flex !important;
    flex-direction: column !important;
    opacity: 1 !important;
    visibility: visible !important;
    transition: all 0.3s ease !important;
    height: auto !important;
  }
  
  .catalog-grid .card img {
    height: 250px !important;
    object-fit: cover !important;
    width: 100% !important;
  }
  
  .catalog-grid .card .card-content {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    padding: 20px !important;
  }
  
  /* 2. АНИМАЦИЯ ПУЛЬСАЦИИ ДЛЯ ИКОНКИ КОРЗИНЫ */
  .cart-icon.pulse {
    animation: pulse 0.5s ease-in-out !important;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  
  /* 4. АНИМАЦИЯ ДЛЯ ПОЯВЛЕНИЯ СПРАВА */
  @keyframes slideInRight {
    from {
      transform: translateX(100px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  /* 7. АДАПТИВНОСТЬ ДЛЯ КАРТОЧЕК */
  @media (max-width: 1200px) {
    .catalog-grid {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
  
  @media (max-width: 992px) {
    .catalog-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  
  @media (max-width: 768px) {
    .catalog-grid {
      grid-template-columns: 1fr !important;
    }
  }
  
  /* 8. ПЛАВНЫЙ ПАРАЛЛАКС ДЛЯ ШОКОЛАДА */
  .chocolate-bg img {
    transition: transform 0.1s linear !important;
  }
  
  /* 10. ЭФФЕКТ ДРОЖАНИЯ ДЛЯ ОШИБОК */
  .error-shake {
    animation: shake 0.5s ease-in-out !important;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`).appendTo('head');

// === 12. УЛУЧШЕННАЯ ВАЛИДАЦИЯ ФОРМЫ ===
$('#registration-form').submit(function(e) {
  var isValid = true;
  
  var email = $('#email').val();
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    $('#email').addClass('error-shake');
    showToast('Пожалуйста, введите корректный email', '#ff6b6b');
    isValid = false;
    setTimeout(() => $('#email').removeClass('error-shake'), 500);
  }
  
  var password = $('#password').val();
  var confirmPassword = $('#confirm-password').val();
  if (password !== confirmPassword) {
    $('#password, #confirm-password').addClass('error-shake');
    showToast('Пароли не совпадают!', '#ff6b6b');
    isValid = false;
    setTimeout(() => {
      $('#password, #confirm-password').removeClass('error-shake');
    }, 500);
  }
  
  if (!isValid) {
    e.preventDefault();
  }
});

// === 13. ВЫРАВНИВАНИЕ ПРИ ИЗМЕНЕНИИ РАЗМЕРА ОКНА ===
$(window).resize(function() {
  setTimeout(function() {
    // Пересчитываем высоту карточек
    $('.catalog-grid .card').css('height', 'auto');
    
    var maxHeight = 0;
    $('.catalog-grid .card').each(function() {
      var cardHeight = $(this).outerHeight();
      if (cardHeight > maxHeight) {
        maxHeight = cardHeight;
      }
    });
    
    $('.catalog-grid .card').css('height', maxHeight + 'px');
  }, 300);
});
// Добавьте в конец файла jquery-animations.js

// ===== МОБИЛЬНОЕ МЕНЮ =====
$(document).ready(function() {
  // Создаем кнопку мобильного меню, если её нет
  if ($('.mobile-menu-btn').length === 0) {
    $('.header').prepend('<button class="mobile-menu-btn">☰</button>');
  }
  
  // Обработчик клика по кнопке меню
  $('.mobile-menu-btn').click(function(e) {
    e.stopPropagation();
    $('.main-nav').toggleClass('active');
    $(this).text($(this).text() === '☰' ? '✕' : '☰');
  });
  
  // Закрытие меню при клике вне его
  $(document).click(function(e) {
    if (!$(e.target).closest('.main-nav, .mobile-menu-btn').length) {
      $('.main-nav').removeClass('active');
      $('.mobile-menu-btn').text('☰');
    }
  });
  
  // Предотвращаем закрытие при клике внутри меню
  $('.main-nav').click(function(e) {
    e.stopPropagation();
  });
  
  // Обработка выпадающих меню на мобильных
  if ($(window).width() <= 768) {
    $('.nav-item.dropdown > .nav-link').click(function(e) {
      e.preventDefault();
      $(this).parent().toggleClass('active');
    });
  }
  
  // Обновление при изменении размера окна
  $(window).resize(function() {
    if ($(window).width() > 768) {
      $('.main-nav').removeClass('active');
      $('.mobile-menu-btn').text('☰');
    }
  });
  
  // Добавляем поддержку свайпа для мобильных
  let touchstartX = 0;
  let touchendX = 0;
  
  $('.main-nav').on('touchstart', function(e) {
    touchstartX = e.originalEvent.touches[0].screenX;
  });
  
  $('.main-nav').on('touchend', function(e) {
    touchendX = e.originalEvent.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    if (touchendX < touchstartX - 50) {
      // Свайп влево - закрыть меню
      $('.main-nav').removeClass('active');
      $('.mobile-menu-btn').text('☰');
    }
  }
});

console.log('✅ Полный jQuery код загружен! Все фиксы применены.');