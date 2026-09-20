(() => {
    "use strict";

    const wrapper = document.getElementById("heartWrapper");
    if (!wrapper) return;

    function toggle() {
        const flipped = wrapper.classList.toggle("is-flipped");
        wrapper.setAttribute("aria-pressed", String(flipped));
        wrapper.setAttribute(
            "aria-label",
            flipped ? "Я тебя люблю" : "Нажми на сердце"
        );
    }

    wrapper.addEventListener("click", toggle);

    wrapper.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            toggle();
        }
    });
})();