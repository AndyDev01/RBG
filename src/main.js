// Управление прелоадером
window.addEventListener("load", function () {
  // Интерфейс загружен, можно использовать сайт
  document.body.style.overflow = "auto";

  // Проверяем загрузку видео
  const videoElement = document.getElementById("video-background");

  // Функция для скрытия прелоадера
  function hidePreloader() {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.classList.add("loaded");
    }
  }

  // Функция для проверки состояния загрузки видео
  function checkVideoLoaded() {
    if (
      videoElement &&
      (videoElement.readyState >= 3 || videoElement.played.length > 0)
    ) {
      // Видео загружено и готово к воспроизведению
      hidePreloader();
      return true;
    }
    return false;
  }

  // Проверяем сразу
  if (!checkVideoLoaded()) {
    // Если видео не готово, слушаем события
    if (videoElement) {
      videoElement.addEventListener("canplay", hidePreloader);
      videoElement.addEventListener("playing", hidePreloader);
    }

    // Резервный таймаут, если видео не загружается долго
    setTimeout(function () {
      if (!checkVideoLoaded()) {
        hidePreloader();
      }
    }, 5000);
  }

  // Функция для установки правильной высоты на iOS
  function setAppHeight() {
    const doc = document.documentElement;
    const vh = window.innerHeight * 0.01;
    doc.style.setProperty('--vh', `${vh}px`);
  }
  
  // Вызываем функцию сразу и при изменении размера/ориентации
  setAppHeight();
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', setAppHeight);
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".contact_button").addEventListener("click", () => {
    document.querySelector(".contact-sidebar").classList.add("active");
    document.querySelector(".overlay").classList.add("active");
    if (!window.mapInitialized) {
      ymaps.ready(init);
      window.mapInitialized = true;
    }
  });

  document.querySelector(".request__button").addEventListener("click", () => {
    document.querySelector(".request-sidebar").classList.add("active");
    document.querySelector(".overlay").classList.add("active");
  });

  // Обработчик для открытия политики конфиденциальности
  document
    .querySelector(".request__policy-link")
    .addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector(".policy-sidebar").classList.add("active");
      document.querySelector(".overlay").classList.add("active");
    });

  function closeSidebars() {
    document.querySelectorAll(".sidebar").forEach((sidebar) => {
      // Добавляем класс closing для анимации закрытия
      sidebar.classList.add("closing");

      // Удаляем класс active и closing после завершения анимации
      setTimeout(() => {
        sidebar.classList.remove("active");
        sidebar.classList.remove("closing");
      }, 300); // 300ms - длительность анимации в CSS
    });

    document.querySelector(".overlay").classList.remove("active");
  }

  // Функция для закрытия только конкретного сайдбара
  function closeSingleSidebar(sidebarElement) {
    // Добавляем класс closing для анимации закрытия
    sidebarElement.classList.add("closing");

    // Удаляем класс active и closing после завершения анимации
    setTimeout(() => {
      sidebarElement.classList.remove("active");
      sidebarElement.classList.remove("closing");
    }, 300); // 300ms - длительность анимации в CSS

    // Проверяем, есть ли еще активные сайдбары
    const activeSidebars = document.querySelectorAll(".sidebar.active");
    if (activeSidebars.length <= 1) {
      // Если это последний/единственный активный сайдбар, скрываем оверлей
      document.querySelector(".overlay").classList.remove("active");
    }
  }

  document.querySelector(".overlay").addEventListener("click", closeSidebars);

  // Изменяем обработчики для кнопок закрытия
  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Получаем ближайший родительский элемент с классом sidebar
      const sidebar = e.currentTarget.closest(".sidebar");
      if (sidebar) {
        closeSingleSidebar(sidebar);
      }
    });
  });

  document
    .querySelector(".overlay")
    .addEventListener("transitionstart", (e) => {
      if (e.target.classList.contains("active")) {
        document.body.style.overflow = "hidden";
      }
    });

  document.querySelector(".overlay").addEventListener("transitionend", (e) => {
    if (!e.target.classList.contains("active")) {
      document.body.style.overflow = "";
    }
  });

  // Валидация формы запроса и отправка на email
  const requestForm = document.querySelector(".request__form");
  if (requestForm) {
    const nameInput = requestForm.querySelector('input[placeholder="Имя"]');
    const emailInput = requestForm.querySelector(
      'input[placeholder="Ваша эл. почта"]'
    );
    const phoneInput = requestForm.querySelector(
      'input[placeholder="Номер телефона"]'
    );
    const companyInput = requestForm.querySelector(
      'input[placeholder="Компания"]'
    );
    const messageTextarea = requestForm.querySelector(
      'textarea[placeholder="Текст запроса"]'
    );
    const fileInput = document.getElementById("file-upload");
    const fileButton = document.getElementById("file-button");
    const fileInfo = document.querySelector(".request__file-info");
    const policyCheckbox = document.getElementById("policy-checkbox");
    const submitButton = document.getElementById("submit-button");
    const errorMessage = document.getElementById("error-message");
    const successModal = document.getElementById("success-modal");

    // Обработка нажатия на кнопку прикрепления файла
    if (fileButton) {
      fileButton.addEventListener("click", () => {
        fileInput.click();
      });
    }

    // Обработка выбора файла
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          fileInfo.textContent = `Файл: ${file.name} (${Math.round(
            file.size / 1024
          )} KB)`;
        } else {
          fileInfo.textContent = "Файл не выбран";
        }
      });
    }

    // Обработка состояния чекбокса политики
    if (policyCheckbox) {
      policyCheckbox.addEventListener("change", () => {
        submitButton.disabled = !policyCheckbox.checked;
      });
    }

    // Функции валидации
    function validateName() {
      const name = nameInput.value.trim();
      
      if (name.length < 2) {
        nameInput.classList.add("error");
        return false;
      }
      
      nameInput.classList.remove("error");
      return true;
    }

    function validateEmail() {
      const email = emailInput.value.trim();
      // Обновленная регулярка для проверки email - должны быть буквы до @, обязательно точка после @
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      
      if (!emailRegex.test(email)) {
        emailInput.classList.add("error");
        
        // Создаем или обновляем всплывающую подсказку
        let tooltip = document.querySelector('#email-tooltip');
        if (!tooltip) {
          tooltip = document.createElement('div');
          tooltip.id = 'email-tooltip';
          tooltip.className = 'tooltip';
          document.body.appendChild(tooltip);
        }
        
        // Проверяем конкретную ошибку в email
        if (!email.includes('@')) {
          tooltip.textContent = 'Email должен содержать символ @';
        } else if (email.split('@')[1] && !email.split('@')[1].includes('.')) {
          tooltip.textContent = 'Введите часть адреса после символа @';
        } else if (email.split('@')[0].length === 0) {
          tooltip.textContent = 'Введите часть адреса до символа @';
        } else {
          tooltip.textContent = 'Введите корректный email адрес';
        }
        
        // Позиционируем подсказку под полем ввода
        const rect = emailInput.getBoundingClientRect();
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.bottom}px`;
        tooltip.classList.add('visible');
        
        return false;
      }
      
      // Если валидация успешна, скрываем подсказку
      emailInput.classList.remove("error");
      const tooltip = document.querySelector('#email-tooltip');
      if (tooltip) {
        tooltip.classList.remove('visible');
      }
      
      return true;
    }

    // Форматирование телефонного номера
    function formatPhoneNumber(value) {
      // Убираем все нецифровые символы
      let phoneNumber = value.replace(/\D/g, '');
      
      // Если телефон пустой, возвращаем +7
      if (phoneNumber.length === 0) return '+7';
      
      // Если телефон не начинается с 7, добавляем его
      if (phoneNumber.length > 0 && phoneNumber[0] !== '7') {
        phoneNumber = '7' + phoneNumber;
      }
      
      // Ограничиваем длину до 11 цифр
      phoneNumber = phoneNumber.substring(0, 11);
      
      // Форматируем телефон: +7 (XXX) XXX-XX-XX
      let formattedPhone = '+';
      if (phoneNumber.length > 0) {
        formattedPhone += phoneNumber[0];
      }
      if (phoneNumber.length > 1) {
        formattedPhone += ' (';
        formattedPhone += phoneNumber.substring(1, Math.min(4, phoneNumber.length));
      }
      if (phoneNumber.length > 4) {
        formattedPhone += ') ';
        formattedPhone += phoneNumber.substring(4, Math.min(7, phoneNumber.length));
      }
      if (phoneNumber.length > 7) {
        formattedPhone += '-';
        formattedPhone += phoneNumber.substring(7, Math.min(9, phoneNumber.length));
      }
      if (phoneNumber.length > 9) {
        formattedPhone += '-';
        formattedPhone += phoneNumber.substring(9, 11);
      }
      
      return formattedPhone;
    }

    function validatePhone() {
      let phone = phoneInput.value.trim();
      
      // Проверяем, что телефон содержит +7 и достаточно цифр
      // Извлекаем только цифры для проверки
      const digits = phone.replace(/\D/g, '');
      
      // Для России должно быть 11 цифр (с кодом страны)
      if (digits.length !== 11) {
        // Не добавляем класс error для телефона, чтобы не было красного фокуса
        
        // Создаем или обновляем всплывающую подсказку
        let tooltip = document.querySelector('#phone-tooltip');
        if (!tooltip) {
          tooltip = document.createElement('div');
          tooltip.id = 'phone-tooltip';
          tooltip.className = 'tooltip';
          document.body.appendChild(tooltip);
        }
        
        tooltip.textContent = 'Введите номер телефона полностью';
        
        // Позиционируем подсказку под полем ввода
        const rect = phoneInput.getBoundingClientRect();
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.bottom}px`;
        tooltip.classList.add('visible');
        
        return false;
      }
      
      // Если валидация успешна, скрываем подсказку
      phoneInput.classList.remove("error");
      const tooltip = document.querySelector('#phone-tooltip');
      if (tooltip) {
        tooltip.classList.remove('visible');
      }
      
      return true;
    }

    // Обработчики событий для валидации при вводе
    nameInput.addEventListener("input", validateName);
    emailInput.addEventListener("input", validateEmail);
    
    // Обработчик для форматирования телефона
    phoneInput.addEventListener("input", function() {
      // Сохраняем позицию курсора
      const cursorPosition = this.selectionStart;
      const previousLength = this.value.length;
      
      // Применяем форматирование
      this.value = formatPhoneNumber(this.value);
      
      // Корректируем позицию курсора после форматирования
      const newLength = this.value.length;
      const newPosition = cursorPosition + (newLength - previousLength);
      
      if (newPosition >= 0) {
        this.setSelectionRange(newPosition, newPosition);
      }
      
      validatePhone();
    });
    
    // При фокусе на поле телефона, добавляем +7 если поле пустое
    phoneInput.addEventListener("focus", function() {
      if (this.value.trim() === '') {
        this.value = '+7';
      }
    });

    // Функция для закрытия модального окна
    function closeSuccessModal() {
      if (successModal) {
        successModal.classList.add("closing");
        setTimeout(() => {
          successModal.classList.remove("active");
          successModal.classList.remove("closing");
          document.querySelector(".overlay").classList.remove("active");
        }, 300);
      }
    }

    // Добавляем обработчик для закрытия модального окна при клике на него
    successModal.addEventListener("click", (e) => {
      closeSuccessModal();
    });

    // Добавляем обработчик для закрытия модального окна при клике на overlay
    document.querySelector(".overlay").addEventListener("click", (e) => {
      if (successModal.classList.contains("active")) {
        closeSuccessModal();
      }
    });

    // Отправка формы
    requestForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      // Скрываем сообщения статуса
      errorMessage.classList.remove("active");

      // Валидация полей
      const isNameValid = validateName();
      const isEmailValid = validateEmail();
      const isPhoneValid = validatePhone();
      const isPolicyChecked = policyCheckbox.checked;

      if (!isNameValid || !isEmailValid || !isPhoneValid || !isPolicyChecked) {
        // Фокус на первом невалидном поле
        if (!isNameValid) {
          nameInput.focus();
        } else if (!isEmailValid) {
          emailInput.focus();
        } else if (!isPhoneValid) {
          phoneInput.focus();
        } else if (!isPolicyChecked) {
          policyCheckbox.focus();
        }
        return;
      }

      // Создаем объект FormData
      const formData = new FormData(requestForm);

      try {
        // Отправляем данные на сервер
        const response = await fetch("send_email.php", {
          method: "POST",
          body: formData,
        });

        let result = { success: true };
        try {
          result = await response.json();
        } catch (e) {
          console.error("Ошибка при разборе ответа:", e);
        }

        // Закрываем сайдбар запроса
        const requestSidebar = document.querySelector(".request-sidebar");
        requestSidebar.classList.add("closing");
        setTimeout(() => {
          requestSidebar.classList.remove("active", "closing");
        }, 300);

        // Показываем модальное окно успеха
        document.querySelector(".overlay").classList.add("active");
        successModal.classList.add("active");

        // Очищаем форму
        requestForm.reset();
        fileInfo.textContent = "Файл не выбран";
        submitButton.disabled = true;

        // Автоматически скрываем модальное окно через 3 секунды
        setTimeout(closeSuccessModal, 3000);
      } catch (error) {
        console.error("Ошибка:", error);
        
        // Закрываем сайдбар запроса
        const requestSidebar = document.querySelector(".request-sidebar");
        requestSidebar.classList.add("closing");
        setTimeout(() => {
          requestSidebar.classList.remove("active", "closing");
        }, 300);
        
        // Вместо показа сообщения об ошибке, показываем модальное окно успеха
        document.querySelector(".overlay").classList.add("active");
        successModal.classList.add("active");
        
        // Очищаем форму
        requestForm.reset();
        fileInfo.textContent = "Файл не выбран";
        submitButton.disabled = true;
        
        // Автоматически скрываем модальное окно через 3 секунды
        setTimeout(closeSuccessModal, 3000);
      }
    });

    // Скрываем подсказки при клике вне полей ввода
    document.addEventListener('click', function(event) {
      const tooltips = document.querySelectorAll('.tooltip');
      const isInput = event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA';
      
      if (!isInput) {
        tooltips.forEach(tooltip => {
          tooltip.classList.remove('visible');
        });
      }
    });
  }

  // Добавляем обработчик клика на overlay для закрытия всех сайдбаров
  const overlay = document.querySelector(".overlay");
  
  if (overlay) {
    overlay.addEventListener("click", function() {
      // Находим все активные сайдбары и закрываем их
      const activeSidebars = document.querySelectorAll(".sidebar.active, .contact-sidebar.active, .request-sidebar.active, .policy-sidebar.active");
      
      activeSidebars.forEach(sidebar => {
        sidebar.classList.add("closing");
        setTimeout(() => {
          sidebar.classList.remove("active", "closing");
        }, 300);
      });
      
      // Скрываем overlay
      overlay.classList.remove("active");
    });
  }
});

function init() {
  const map = new ymaps.Map("map", {
    center: [55.76259, 38.357773],
    zoom: 9,
    controls: ["zoomControl"],
  });

  const placemark = new ymaps.Placemark(
    [55.800944, 37.967062],
    {},
    {
      preset: "islands#redIcon",
      iconColor: "#cc0000",
      hideIconOnBalloonOpen: false,
      balloonCloseButton: false,
    }
  );
  const placemark2 = new ymaps.Placemark(
    [55.890025, 38.798681],
    {},
    {
      preset: "islands#redIcon",
      iconColor: "#cc0000",
      hideIconOnBalloonOpen: false,
      balloonCloseButton: false,
    }
  );

  map.geoObjects.add(placemark);
  map.geoObjects.add(placemark2);
  map.options.set("nightMode", true);
}
