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
