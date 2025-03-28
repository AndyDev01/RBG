// Константы
const ANIMATION_DURATION = 300;
const VIDEO_LOAD_TIMEOUT = 8000;

// Утилиты
const hideElement = (element, removeActive = true) => {
  element.classList.add("closing");
  setTimeout(() => {
    if (removeActive) {
      element.classList.remove("active");
      // Проверяем, остались ли активные сайдбары
      const activeSidebars = document.querySelectorAll(".sidebar.active");
      if (activeSidebars.length === 0) {
        document.querySelector(".overlay")?.classList.remove("active");
      }
    }
    element.classList.remove("closing");
  }, ANIMATION_DURATION);
};

// Управление загрузкой видео
const initVideoBackground = (videoElement) => {
  if (!videoElement) return;

  // Сброс стилей видео
  videoElement.style.removeProperty('transition');
  videoElement.classList.remove('ready');

  // Установка начальных параметров
  videoElement.playsInline = true;
  videoElement.muted = true;
  videoElement.loop = true;
  videoElement.setAttribute('playsinline', '');
  videoElement.setAttribute('muted', '');
  videoElement.setAttribute('loop', '');
  
  // Предварительная загрузка видео
  videoElement.preload = 'auto';
  
  let isPlaying = false;

  // Функция для показа и воспроизведения видео
  const showAndPlayVideo = () => {
    if (isPlaying) return;
    
    isPlaying = true;
    videoElement.classList.add('ready');
    
    const playPromise = videoElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("Ошибка автовоспроизведения:", error);
        isPlaying = false;
        videoElement.classList.remove('ready');
      });
    }
  };

  // Обработчики событий загрузки
  const handleVideoLoad = () => {
    if (videoElement.readyState >= 4) { // HAVE_ENOUGH_DATA
      showAndPlayVideo();
    }
  };

  // Обработчик ошибок
  const handleVideoError = (error) => {
    console.error("Ошибка загрузки видео:", error);
    videoElement.style.display = 'none';
  };

  // Слушатели событий
  videoElement.addEventListener("loadeddata", handleVideoLoad);
  videoElement.addEventListener("canplaythrough", handleVideoLoad);
  videoElement.addEventListener("error", handleVideoError);

  // Проверка текущего состояния
  if (videoElement.readyState >= 4) {
    handleVideoLoad();
  }

  // Таймаут для проверки загрузки
  setTimeout(() => {
    if (!isPlaying) {
      console.warn("Видео не загрузилось за отведенное время");
    }
  }, VIDEO_LOAD_TIMEOUT);
};

// Управление загрузкой сайта
document.addEventListener("DOMContentLoaded", function() {
  // Разрешаем взаимодействие с сайтом сразу
  document.body.style.overflow = "auto";
  
  const contentWrapper = document.querySelector(".content-wrapper");
  const videoElement = document.getElementById("video-background");

  // Инициализация видео фона
  initVideoBackground(videoElement);

  // Показываем контент после небольшой задержки
  if (contentWrapper) {
    // Даем время для применения стилей и загрузки шрифтов
    setTimeout(() => {
      contentWrapper.classList.add("loaded");
    }, 100);
  }

  // iOS высота
  const setAppHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setAppHeight();
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', setAppHeight);
});

// Управление сайдбарами
document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    overlay: document.querySelector(".overlay"),
    contactSidebar: document.querySelector(".contact-sidebar"),
    requestSidebar: document.querySelector(".request-sidebar"),
    policySidebar: document.querySelector(".policy-sidebar"),
    successModal: document.getElementById("success-modal")
  };

  const showSidebar = (sidebar) => {
    sidebar.classList.add("active");
    elements.overlay.classList.add("active");
  };

  // Обработчики кнопок
  document.querySelector(".contact_button")?.addEventListener("click", () => {
    showSidebar(elements.contactSidebar);
    if (!window.mapInitialized) {
      ymaps.ready(init);
      window.mapInitialized = true;
    }
  });

  document.querySelector(".request__button")?.addEventListener("click", () => {
    showSidebar(elements.requestSidebar);
  });

  document.querySelector(".request__policy-link")?.addEventListener("click", (e) => {
      e.preventDefault();
    showSidebar(elements.policySidebar);
  });

  // Закрытие сайдбаров
  elements.overlay?.addEventListener("click", () => {
    document.querySelectorAll(".sidebar.active").forEach(sidebar => hideElement(sidebar));
    elements.overlay.classList.remove("active");
  });

  document.querySelectorAll(".close-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const sidebar = e.currentTarget.closest(".sidebar");
      if (sidebar) {
        hideElement(sidebar);
        // Проверяем количество активных сайдбаров сразу
        const activeSidebars = document.querySelectorAll(".sidebar.active");
        if (activeSidebars.length <= 1) { // <= 1, так как текущий сайдбар еще не закрылся
          elements.overlay?.classList.remove("active");
        }
      }
    });
  });

  // Управление скроллом
  elements.overlay?.addEventListener("transitionstart", (e) => {
      if (e.target.classList.contains("active")) {
        document.body.style.overflow = "hidden";
      }
    });

  elements.overlay?.addEventListener("transitionend", (e) => {
    if (!e.target.classList.contains("active")) {
      document.body.style.overflow = "";
    }
  });

  // Форма запроса
  const requestForm = document.querySelector(".request__form");
  if (requestForm) {
    const formElements = {
      nameInput: requestForm.querySelector('input[placeholder="Имя"]'),
      emailInput: requestForm.querySelector('input[placeholder="Ваша эл. почта"]'),
      phoneInput: requestForm.querySelector('input[placeholder="Номер телефона"]'),
      fileInput: document.getElementById("file-upload"),
      fileButton: document.getElementById("file-button"),
      fileInfo: document.querySelector(".request__file-info"),
      policyCheckbox: document.getElementById("policy-checkbox"),
      submitButton: document.getElementById("submit-button"),
      successModal: document.getElementById("success-modal")
    };

    // Обработка файла
    formElements.fileButton?.addEventListener("click", () => formElements.fileInput.click());
    formElements.fileInput?.addEventListener("change", (e) => {
        const file = e.target.files[0];
      formElements.fileInfo.textContent = file 
        ? `Файл: ${file.name} (${Math.round(file.size / 1024)} KB)`
        : "Файл не выбран";
    });

    // Валидация
    const validators = {
      name: (value) => value.trim().length >= 2,
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      phone: (value) => value.replace(/\D/g, '').length >= 10
    };

    const validateForm = () => {
      return validators.name(formElements.nameInput.value) &&
             validators.email(formElements.emailInput.value) &&
             validators.phone(formElements.phoneInput.value) &&
             formElements.policyCheckbox.checked;
    };

    // Обработчики валидации
    [formElements.nameInput, formElements.emailInput, formElements.phoneInput].forEach(input => {
      input?.addEventListener('input', () => {
        formElements.submitButton.disabled = !validateForm();
      });
    });

    formElements.policyCheckbox?.addEventListener("change", () => {
      formElements.submitButton.disabled = !validateForm();
    });

    // Отправка формы
    requestForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!validateForm()) return;

      try {
        const formData = new FormData(requestForm);
        await fetch("send_email.php", { method: "POST", body: formData });
        
        hideElement(elements.requestSidebar);
        showSidebar(elements.successModal);
        
        requestForm.reset();
        formElements.fileInfo.textContent = "Файл не выбран";
        formElements.submitButton.disabled = true;
        
        setTimeout(() => hideElement(elements.successModal), 3000);
      } catch (error) {
        console.error("Ошибка отправки формы:", error);
        // Показываем модальное окно успеха даже при ошибке, как было в оригинале
        hideElement(elements.requestSidebar);
        showSidebar(elements.successModal);
        setTimeout(() => hideElement(elements.successModal), 3000);
      }
    });
  }
});

function init() {
  try {
  const map = new ymaps.Map("map", {
    center: [55.76259, 38.357773],
    zoom: 9,
    controls: ["zoomControl"],
      suppressMapOpenBlock: true // Скрываем кнопку "Открыть в Яндекс.Картах"
  });

    const placemarks = [
    {
        coordinates: [55.800944, 37.967062],
        options: {
      preset: "islands#redIcon",
          iconColor: "#cc0000"
    }
      },
    {
        coordinates: [55.890025, 38.798681],
        options: {
      preset: "islands#redIcon",
          iconColor: "#cc0000"
        }
      }
    ];

    placemarks.forEach(mark => {
      const placemark = new ymaps.Placemark(
        mark.coordinates,
        {},
        mark.options
      );
  map.geoObjects.add(placemark);
    });

  map.options.set("nightMode", true);
  } catch (error) {
    console.error("Ошибка при инициализации карты:", error);
  }
}
