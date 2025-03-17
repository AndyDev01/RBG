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
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".contact_button").addEventListener("click", () => {
    document.querySelector(".contact-sidebar").classList.add("active");
    document.querySelector(".overlay").classList.add("active");
  });

  document.querySelector(".request__button").addEventListener("click", () => {
    document.querySelector(".request-sidebar").classList.add("active");
    document.querySelector(".overlay").classList.add("active");
  });

  // Обработчик для кнопки проверки модального окна
  const testModalButton = document.querySelector(".test-modal-button");
  if (testModalButton) {
    testModalButton.addEventListener("click", () => {
      console.log("Клик по кнопке проверки модального окна");
      const successModal = document.getElementById("success-modal");
      if (successModal) {
        document.querySelector(".overlay").classList.add("active");
        successModal.classList.add("active");
        console.log("Модальное окно должно быть активировано");

        // Автоматически скрываем через 3 секунды
        setTimeout(() => {
          closeSuccessModal();
        }, 3000);
      } else {
        console.error("Элемент success-modal не найден");
      }
    });
  } else {
    console.error("Кнопка test-modal-button не найдена");
  }

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

    // Функция валидации имени (только русские символы)
    function validateName() {
      const nameValue = nameInput.value.trim();
      const isRussianOnly = /^[А-Яа-яЁё\s-]+$/.test(nameValue);

      if (!isRussianOnly && nameValue.length > 0) {
        nameInput.classList.add("invalid");
        return false;
      } else {
        nameInput.classList.remove("invalid");
        return nameValue.length > 0;
      }
    }

    // Функция валидации email (содержит @)
    function validateEmail() {
      const emailValue = emailInput.value.trim();
      const hasAtSymbol = emailValue.includes("@");

      if (!hasAtSymbol && emailValue.length > 0) {
        emailInput.classList.add("invalid");
        return false;
      } else {
        emailInput.classList.remove("invalid");
        return hasAtSymbol;
      }
    }

    // Функция валидации телефона (только цифры и символ +)
    function validatePhone() {
      const phoneValue = phoneInput.value.trim();
      const isValidPhone = /^[0-9+]+$/.test(phoneValue);

      if (phoneValue.length === 0) {
        phoneInput.classList.add("invalid");
        return false;
      } else if (!isValidPhone) {
        phoneInput.classList.add("invalid");
        return false;
      } else {
        phoneInput.classList.remove("invalid");
        return true;
      }
    }

    // Добавление обработчиков событий для валидации в реальном времени
    nameInput.addEventListener("input", validateName);
    emailInput.addEventListener("input", validateEmail);
    phoneInput.addEventListener("input", validatePhone);

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

      // Подготовка данных формы
      try {
        console.log(
          "Форма успешно валидирована, готовимся показать модальное окно"
        );
        // Вместо отправки формы просто показываем модальное окно
        // requestForm.submit(); -- закомментировано, чтобы форма не отправлялась

        // Очищаем форму
        requestForm.reset();
        fileInfo.textContent = "Файл не выбран";
        submitButton.disabled = true;

        // Закрываем сайдбар и показываем модальное окно успешной отправки
        closeSidebars();
        document.querySelector(".overlay").classList.add("active");
        successModal.classList.add("active");
        console.log("Модальное окно должно быть показано");

        // Автоматически скрываем через 3 секунды
        setTimeout(() => {
          closeSuccessModal();
        }, 3000);
      } catch (error) {
        console.error("Ошибка:", error);
        errorMessage.classList.add("active");
      }
    });
  }

  // Функция для плавного закрытия модального окна
  function closeSuccessModal() {
    const modal = document.getElementById("success-modal");
    if (modal && modal.classList.contains("active")) {
      modal.classList.add("closing");

      setTimeout(() => {
        modal.classList.remove("active");
        modal.classList.remove("closing");

        // Проверяем, есть ли активные сайдбары
        const activeSidebars = document.querySelectorAll(".sidebar.active");
        if (activeSidebars.length === 0) {
          document.querySelector(".overlay").classList.remove("active");
        }
      }, 300); // 300ms - длительность анимации в CSS
    }
  }

  // Обработчик клика на модальное окно для его закрытия
  const successModal = document.getElementById("success-modal");
  if (successModal) {
    successModal.addEventListener("click", (e) => {
      closeSuccessModal();
    });

    // Предотвращаем закрытие при клике на содержимое модального окна
    const modalContent = successModal.querySelector(".success-modal__content");
    if (modalContent) {
      modalContent.addEventListener("click", (e) => {
        e.stopPropagation(); // Предотвращаем всплытие события клика
      });
    }
  }
});

document.querySelector(".contact_button").addEventListener("click", () => {
  document.querySelector(".contact-sidebar").classList.add("active");
  document.querySelector(".overlay").classList.add("active");
  if (!window.mapInitialized) {
    ymaps.ready(init);
    window.mapInitialized = true;
  }
});

const script = document.createElement("script");
script.src = `https://api-maps.yandex.ru/2.1/?apikey=${
  import.meta.env.VITE_API_KEY
}`;
document.head.appendChild(script);
script.onload = () => {
  ymaps.ready(initMap);
};

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
    [55.888917, 38.797438],
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
