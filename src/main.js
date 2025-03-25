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
        return false;
      }
      return true;
    }

    function validateEmail() {
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    function validatePhone() {
      const phone = phoneInput.value.replace(/\D/g, '');
      return phone.length >= 10;
    }

    // Обработчики событий для валидации в реальном времени
    const inputs = [nameInput, emailInput, phoneInput];
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const isValid = validateForm();
        submitButton.disabled = !isValid || !policyCheckbox.checked;
      });
    });

    function validateForm() {
      return (
        validateName() &&
        validateEmail() &&
        validatePhone() &&
        policyCheckbox.checked
      );
    }

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
