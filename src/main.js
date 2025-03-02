document.addEventListener("DOMContentLoaded", () => {
    // Открытие сайдбаров
    document.querySelector(".contact_button").addEventListener("click", () => {
        document.querySelector(".contact-sidebar").classList.add("active");
        document.querySelector(".overlay").classList.add("active");
    });

    document.querySelector(".request__button").addEventListener("click", () => {
        document.querySelector(".request-sidebar").classList.add("active");
        document.querySelector(".overlay").classList.add("active");
    });

    // Закрытие сайдбаров
    function closeSidebars() {
        document.querySelectorAll(".sidebar").forEach((sidebar) => {
            sidebar.classList.remove("active");
        });
        document.querySelector(".overlay").classList.remove("active");
    }

    // Закрытие по клику на оверлей
    document.querySelector(".overlay").addEventListener("click", closeSidebars);

    // Закрытие по кнопке
    document.querySelectorAll(".close-btn").forEach((btn) => {
        btn.addEventListener("click", closeSidebars);
    });

    // Блокировка скролла
    document
        .querySelector(".overlay")
        .addEventListener("transitionstart", (e) => {
            if (e.target.classList.contains("active")) {
                document.body.style.overflow = "hidden";
            }
        });

    document
        .querySelector(".overlay")
        .addEventListener("transitionend", (e) => {
            if (!e.target.classList.contains("active")) {
                document.body.style.overflow = "";
            }
        });
});

document.querySelector(".contact_button").addEventListener("click", () => {
    document.querySelector(".contact-sidebar").classList.add("active");
    document.querySelector(".overlay").classList.add("active");

    // Инициализация карты только при открытии
    if (!window.mapInitialized) {
        ymaps.ready(init);
        window.mapInitialized = true;
    }
});

const script = document.createElement("script");
script.src = `https://api-maps.yandex.ru/2.1/?apikey=${
    import.meta.env.VITE_API_KEY
}&lang=ru_RU&theme=dark`;
document.head.appendChild(script);

// Инициализация карты после загрузки API
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
        {}, // Убираем содержимое балуна
        {
            preset: "islands#redIcon",
            iconColor: "#cc0000",
            // Добавляем опцию для отключения балуна
            hideIconOnBalloonOpen: false,
            balloonCloseButton: false,
        }
    );

    map.geoObjects.add(placemark);

    // Убираем автоматическое открытие балуна
    // placemark.balloon.open(); <-- эта строка больше не нужна

    map.options.set("nightMode", true);
}
