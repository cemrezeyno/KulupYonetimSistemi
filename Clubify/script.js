// Sayfa açılış animasyonu

window.addEventListener("load", () => {
  document.querySelector(".hero-text").style.opacity = "1";
  document.querySelector(".phone").style.opacity = "1";
});

// Scroll animasyonu

const cards = document.querySelectorAll(".card");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  {
    threshold: 0.2,
  },
);

cards.forEach((card) => {
  observer.observe(card);
});

// Buton mesajı

const buttons = document.querySelectorAll("button");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    alert("Clubify çok yakında sizinle! 🚀");
  });
});
// Mobil Menü

function toggleMenu() {
  const menu = document.getElementById("menu");

  menu.classList.toggle("active");
}
// Sayaç animasyonu

const counters = document.querySelectorAll(".counter");

counters.forEach((counter) => {
  counter.innerText = "0";

  const updateCounter = () => {
    const target = +counter.getAttribute("data-target");

    const current = +counter.innerText;

    const increment = target / 100;

    if (current < target) {
      counter.innerText = Math.ceil(current + increment);

      setTimeout(updateCounter, 20);
    } else {
      counter.innerText = target;
    }
  };

  updateCounter();
});
const form = document.querySelector(".contact-form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  alert("Mesajınız alındı! Clubify ekibi sizinle iletişime geçecek 🚀");

  form.reset();
});
