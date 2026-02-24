// Оптимизированный слайдер отзывов
class OptimizedReviewsSlider {
  constructor() {
    this.slides = document.querySelectorAll('.review-slide');
    this.customerItems = document.querySelectorAll('.customer-item');
    this.progressBar = document.getElementById('progress-bar');
    this.currentSlide = 0;
    this.totalSlides = this.slides.length;
    this.interval = null;
    this.slideDuration = 5000; // 5 секунд на слайд
    
    this.init();
  }
  
  init() {
    // Инициализируем первый слайд
    this.showSlide(this.currentSlide);
    
    // Клики по авторам
    this.customerItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const slideIndex = parseInt(e.currentTarget.dataset.slide);
        this.goToSlide(slideIndex);
      });
    });
    
    // Автопрокрутка
    this.startAutoSlide();
    
    // Пауза при взаимодействии
    const sliderArea = document.querySelector('.reviews-section');
    sliderArea.addEventListener('mouseenter', () => this.stopAutoSlide());
    sliderArea.addEventListener('mouseleave', () => this.startAutoSlide());
  }
  
  showSlide(index) {
    // Скрываем все слайды
    this.slides.forEach(slide => {
      slide.classList.remove('active');
      slide.style.transform = 'translateX(100%)';
    });
    
    this.customerItems.forEach(item => item.classList.remove('active'));
    
    // Показываем выбранный слайд

    
    this.currentSlide = index;
    
    // Обновляем прогресс-бар
    this.updateProgressBar();
  }
  
  goToSlide(index) {
    this.showSlide(index);
    this.resetAutoSlide();
  }
  
  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.totalSlides;
    this.goToSlide(nextIndex);
  }
  
  updateProgressBar() {
    if (!this.progressBar) return;
    
    // Сбрасываем анимацию
    this.progressBar.style.transition = 'none';
    this.progressBar.style.width = '0%';
    
    // Запускаем новую анимацию
    setTimeout(() => {
      this.progressBar.style.transition = `width ${this.slideDuration}ms linear`;
      this.progressBar.style.width = '100%';
    }, 10);
  }
  
  startAutoSlide() {
    this.stopAutoSlide();
    this.interval = setInterval(() => this.nextSlide(), this.slideDuration);
    this.updateProgressBar();
  }
  
  stopAutoSlide() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    // Останавливаем прогресс-бар
    if (this.progressBar) {
      this.progressBar.style.transition = 'none';
    }
  }
  
  resetAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  const slider = new OptimizedReviewsSlider();
  
  // Экспортируем для ручного управления (если нужно)
  window.reviewsSlider = slider;
});

document.addEventListener('DOMContentLoaded', function () {
  const slides = document.querySelectorAll('.simple-slider .slide');
  let index = 0;

  function showSlide(n) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === n);
    });
  }

  function nextSlide() {
    index = (index + 1) % slides.length;
    showSlide(index);
  }

  // Старт автоматической прокрутки
  if (slides.length > 1) {
    setInterval(nextSlide, 5000); // каждые 5 секунд
  }
});

// Кнопка "Наверх"
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopButton.classList.add('show');
  } else {
    backToTopButton.classList.remove('show');
  }
});

backToTopButton.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Сразу отключаем стандартное якорное поведение
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault(); // ← блокируем переход по якорю

    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      // Плавная прокрутка к элементу
      const offsetTop = target.offsetTop - 80; // 80px — высота шапки
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});