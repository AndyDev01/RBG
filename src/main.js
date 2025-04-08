// Константы
const ANIMATION_DURATION = 300;
const VIDEO_LOAD_TIMEOUT = 8000;
const CONTENT_LOAD_DELAY = 300; // Задержка перед показом контента

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

  // Установка начальных параметров
  videoElement.playsInline = true;
  videoElement.muted = true;
  videoElement.loop = true;
  videoElement.preload = "auto";
  videoElement.setAttribute("playsinline", "");
  videoElement.setAttribute("muted", "");
  videoElement.setAttribute("loop", "");

  // Обработчик загрузки видео
  const handleVideoLoad = () => {
    if (videoElement.readyState >= 4) {
      // HAVE_ENOUGH_DATA
      videoElement.classList.add("ready");

      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Ошибка автовоспроизведения видео:", error);
          videoElement.classList.remove("ready");
        });
      }
    }
  };

  // Обработчик ошибок
  const handleVideoError = (error) => {
    console.error("Ошибка загрузки видео:", error);
    // При ошибке оставляем фоновое изображение
  };

  // Добавляем слушатели событий
  videoElement.addEventListener("canplaythrough", handleVideoLoad);
  videoElement.addEventListener("error", handleVideoError);

  // Проверяем текущее состояние
  if (videoElement.readyState >= 4) {
    handleVideoLoad();
  }

  // Таймаут на случай, если видео не загрузится за отведенное время
  setTimeout(() => {
    if (!videoElement.classList.contains("ready")) {
      console.warn("Видео не загрузилось за отведенное время");
    }
  }, VIDEO_LOAD_TIMEOUT);
};

// Управление загрузкой сайта
document.addEventListener("DOMContentLoaded", function () {
  // Разрешаем взаимодействие с сайтом сразу
  document.body.style.overflow = "auto";

  const contentWrapper = document.querySelector(".content-wrapper");
  const videoElement = document.getElementById("video-background");

  // Функция для закрепления интерфейса
  const stabilizeInterface = () => {
    // Проверяем и восстанавливаем видимость элементов интерфейса
    if (contentWrapper && !contentWrapper.classList.contains("loaded")) {
      contentWrapper.classList.add("loaded");
      contentWrapper.style.opacity = "1";
      contentWrapper.style.visibility = "visible";
      console.log("Интерфейс восстановлен");
    }

    // Убеждаемся, что скролл доступен
    document.body.style.overflow = "auto";
  };

  // Ждем полной загрузки всех ресурсов (кроме видео) перед отображением интерфейса
  window.addEventListener("load", () => {
    // Добавляем небольшую задержку, чтобы CSS-анимации корректно работали
    setTimeout(() => {
      if (contentWrapper) {
        contentWrapper.classList.add("loaded");

        // Делаем интерфейс стабильным и обеспечиваем его видимость
        contentWrapper.style.opacity = "1";
        contentWrapper.style.visibility = "visible";

        // Только после отображения интерфейса начинаем загрузку видео
        setTimeout(() => {
          // Гарантируем, что интерфейс останется видимым
          document.body.style.overflow = "auto";
          initVideoBackground(videoElement);
        }, 500); // Небольшая задержка перед загрузкой видео
      }
    }, CONTENT_LOAD_DELAY);
  });

  // Периодически проверяем стабильность интерфейса
  setInterval(stabilizeInterface, 3000);

  // Защита от исчезновения интерфейса при скролле
  window.addEventListener("scroll", () => {
    document.body.style.overflow = "auto";
    stabilizeInterface();
  });

  // iOS высота
  const setAppHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  setAppHeight();
  window.addEventListener("resize", setAppHeight);
  window.addEventListener("orientationchange", setAppHeight);
});

// Управление сайдбарами
document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    overlay: document.querySelector(".overlay"),
    contactSidebar: document.querySelector(".contact-sidebar"),
    requestSidebar: document.querySelector(".request-sidebar"),
    policySidebar: document.querySelector(".policy-sidebar"),
    successModal: document.getElementById("success-modal"),
  };

  const showSidebar = (sidebar) => {
    sidebar.classList.add("active");
    elements.overlay.classList.add("active");
  };

  // Создаем специальный слой оверлея только для модального окна успеха
  const createSuccessOverlay = () => {
    // Проверяем, существует ли уже элемент
    let successOverlay = document.querySelector(".success-overlay");
    if (!successOverlay) {
      successOverlay = document.createElement("div");
      successOverlay.className = "overlay success-overlay";
      document.body.appendChild(successOverlay);
    }
    return successOverlay;
  };

  // Показ модального окна успеха с оверлеем
  const showSuccessModal = () => {
    console.log("Показываем модальное окно и оверлей");

    // Скрываем основной оверлей, если он активен
    if (elements.overlay.classList.contains("active")) {
      elements.overlay.classList.remove("active");
    }

    // Скрываем сайдбар запроса, если он открыт
    if (elements.requestSidebar.classList.contains("active")) {
      // Используем специальную версию hideElement, которая не трогает оверлей
      elements.requestSidebar.classList.add("closing");
      setTimeout(() => {
        elements.requestSidebar.classList.remove("active", "closing");
      }, ANIMATION_DURATION);
    }

    // Получаем или создаем специальный оверлей для успешного сообщения
    const successOverlay = createSuccessOverlay();

    // Очищаем классы с обоих элементов
    elements.successModal.classList.remove("active", "closing");
    successOverlay.classList.remove("active", "closing");

    // Устанавливаем стили для анимации
    const animationTime = 600;
    elements.successModal.style.transition = `opacity ${animationTime}ms ease`;
    successOverlay.style.transition = `opacity ${animationTime}ms ease, visibility ${animationTime}ms ease`;

    // Добавляем блюр к оверлею
    successOverlay.style.backdropFilter = "blur(4px)";
    successOverlay.style.webkitBackdropFilter = "blur(4px)";

    // Показываем оба элемента
    requestAnimationFrame(() => {
      elements.successModal.classList.add("active");
      successOverlay.classList.add("active");
    });

    // Функция закрытия
    const closeSuccessMessage = () => {
      // Отменяем автозакрытие
      if (autoCloseTimer) clearTimeout(autoCloseTimer);

      // Удаляем обработчик клика
      successOverlay.removeEventListener("click", closeSuccessMessage);

      // Добавляем класс closing обоим элементам
      elements.successModal.classList.add("closing");
      successOverlay.classList.add("closing");

      // Через время анимации удаляем классы
      setTimeout(() => {
        elements.successModal.classList.remove("active", "closing");
        successOverlay.classList.remove("active", "closing");
      }, animationTime);
    };

    // Добавляем обработчик клика
    successOverlay.addEventListener("click", closeSuccessMessage);

    // Автозакрытие через 3 секунды
    const autoCloseTimer = setTimeout(closeSuccessMessage, 3000);
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

  document
    .querySelector(".request__policy-link")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      showSidebar(elements.policySidebar);
    });

  // Закрытие сайдбаров
  elements.overlay?.addEventListener("click", () => {
    document
      .querySelectorAll(".sidebar.active")
      .forEach((sidebar) => hideElement(sidebar));

    elements.overlay.classList.remove("active");
  });

  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const sidebar = e.currentTarget.closest(".sidebar");
      if (sidebar) {
        hideElement(sidebar);
        // Проверяем количество активных сайдбаров сразу
        const activeSidebars = document.querySelectorAll(".sidebar.active");
        if (activeSidebars.length <= 1) {
          // <= 1, так как текущий сайдбар еще не закрылся
          // Проверяем, есть ли активное модальное окно
          if (!elements.successModal.classList.contains("active")) {
            elements.overlay?.classList.remove("active");
          }
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
      emailInput: requestForm.querySelector(
        'input[placeholder="Ваша эл. почта"]'
      ),
      phoneInput: requestForm.querySelector(
        'input[placeholder="Номер телефона"]'
      ),
      fileInput: document.getElementById("file-upload"),
      fileButton: document.getElementById("file-button"),
      fileInfo: document.querySelector(".request__file-info"),
      policyCheckbox: document.getElementById("policy-checkbox"),
      submitButton: document.getElementById("submit-button"),
      successModal: document.getElementById("success-modal"),
    };

    // Обработка файла
    formElements.fileButton?.addEventListener("click", () =>
      formElements.fileInput.click()
    );
    formElements.fileInput?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (formElements.fileInfo) {
        formElements.fileInfo.textContent = file
          ? `Файл: ${file.name} (${Math.round(file.size / 1024)} KB)`
          : "Файл не выбран";
      }
    });

    // Инициализация поля телефона с префиксом +7
    if (formElements.phoneInput) {
      // Устанавливаем префикс +7 при загрузке
      formElements.phoneInput.value = "+7";

      // Обработчик фокуса - перемещаем курсор в конец
      formElements.phoneInput.addEventListener("focus", function () {
        if (this.value === "+7") {
          setTimeout(() => {
            this.selectionStart = this.selectionEnd = this.value.length;
          }, 0);
        }
      });

      // Обработчик ввода для телефона
      formElements.phoneInput.addEventListener("input", function (e) {
        // Сохраняем позицию курсора
        const cursorPos = this.selectionStart;

        // Сохраняем только цифры
        const digits = this.value.replace(/\D/g, "");

        // Если пользователь удалил все, включая +7, восстанавливаем префикс
        if (digits.length <= 1) {
          this.value = "+7";
          this.selectionStart = this.selectionEnd = 2;
          return;
        }

        // Форматируем номер с префиксом +7
        this.value = "+7" + digits.substring(1, 11);

        // Упрощенная валидация: корректно только если ровно 10 цифр после +7
        if (digits.length - 1 === 10) {
          this.classList.remove("invalid");
        } else {
          this.classList.add("invalid");
        }

        // Восстанавливаем позицию курсора, учитывая изменения
        const newCursorPos = Math.min(cursorPos, this.value.length);
        this.selectionStart = this.selectionEnd = newCursorPos;
      });

      // Предотвращение удаления префикса +7 через backspace и delete
      formElements.phoneInput.addEventListener("keydown", function (e) {
        // Если выделен весь текст, разрешаем удаление
        if (
          this.selectionStart === 0 &&
          this.selectionEnd === this.value.length
        ) {
          return;
        }

        // Запрещаем удаление префикса +7
        if (
          (e.key === "Backspace" && this.selectionStart <= 2) ||
          (e.key === "Delete" && this.selectionStart < 2)
        ) {
          e.preventDefault();
        }
      });
    }

    // Валидация email в реальном времени
    if (formElements.emailInput) {
      formElements.emailInput.addEventListener("input", function () {
        // Проверяем наличие @, точки и что используется только латиница
        const isValidEmail =
          /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
            this.value.trim()
          );

        if (isValidEmail || this.value.trim() === "") {
          this.classList.remove("invalid");
        } else {
          this.classList.add("invalid");
        }
      });
    }

    // Валидация
    const validators = {
      name: (value) => value.trim().length >= 2,
      email: (value) => {
        // Проверяем наличие @, точки и что используется только латиница
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
          value.trim()
        );
      },
      phone: (value) => {
        // Проверяем что введено ровно 10 цифр после +7
        const digits = value.replace(/\D/g, "");
        return digits.length === 11 && value.startsWith("+7");
      },
    };

    const validateForm = () => {
      return (
        validators.name(formElements.nameInput.value) &&
        validators.email(formElements.emailInput.value) &&
        validators.phone(formElements.phoneInput.value) &&
        formElements.policyCheckbox.checked
      );
    };

    // Обработчики валидации
    [
      formElements.nameInput,
      formElements.emailInput,
      formElements.phoneInput,
    ].forEach((input) => {
      input?.addEventListener("input", () => {
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
        showSuccessModal(); // Используем новую функцию

        requestForm.reset();
        if (formElements.fileInfo) {
          formElements.fileInfo.textContent = "Файл не выбран";
        }
        formElements.submitButton.disabled = true;
      } catch (error) {
        console.error("Ошибка отправки формы:", error);
        // Показываем модальное окно успеха даже при ошибке, как было в оригинале
        hideElement(elements.requestSidebar);
        showSuccessModal(); // Используем новую функцию
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
      suppressMapOpenBlock: true, // Скрываем кнопку "Открыть в Яндекс.Картах"
    });

    const placemarks = [
      {
        coordinates: [55.800944, 37.967062],
        options: {
          preset: "islands#redIcon",
          iconColor: "#cc0000",
        },
      },
      {
        coordinates: [55.890025, 38.798681],
        options: {
          preset: "islands#redIcon",
          iconColor: "#cc0000",
        },
      },
    ];

    placemarks.forEach((mark) => {
      const placemark = new ymaps.Placemark(mark.coordinates, {}, mark.options);
      map.geoObjects.add(placemark);
    });

    map.options.set("nightMode", true);
  } catch (error) {
    console.error("Ошибка при инициализации карты:", error);
  }
}
