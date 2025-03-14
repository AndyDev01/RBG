document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".contact_button").addEventListener("click", () => {
    document.querySelector(".contact-sidebar").classList.add("active");
    document.querySelector(".overlay").classList.add("active");
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
      sidebar.classList.remove("active");
    });
    document.querySelector(".overlay").classList.remove("active");
  }
  document.querySelector(".overlay").addEventListener("click", closeSidebars);
  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", closeSidebars);
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

  // Валидация формы запроса
  const requestForm = document.querySelector(".request__form");
  if (requestForm) {
    const nameInput = requestForm.querySelector('input[placeholder="Имя"]');
    const emailInput = requestForm.querySelector(
      'input[placeholder="Ваша эл. почта"]'
    );
    const phoneInput = requestForm.querySelector(
      'input[placeholder="Номер телефона"]'
    );

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

    // Валидация формы при отправке
    requestForm.addEventListener("submit", function (event) {
      const isNameValid = validateName();
      const isEmailValid = validateEmail();
      const isPhoneValid = validatePhone();

      if (!isNameValid || !isEmailValid || !isPhoneValid) {
        event.preventDefault();

        // Подсветка невалидных полей
        if (!isNameValid) {
          nameInput.focus();
        } else if (!isEmailValid) {
          emailInput.focus();
        } else if (!isPhoneValid) {
          phoneInput.focus();
        }
      }
    });
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
    center: [55.800944, 37.967062],
    zoom: 15,
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

  map.geoObjects.add(placemark);
  map.options.set("nightMode", true);
}
