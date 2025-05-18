const input = document.querySelector(".input");

input.addEventListener("input", function () {
  if (input.value.length === 4) {
    checkPassword(input.value);
  }
});

function checkPassword(password) {
  if (password === "2509") {
    document.getElementById("user1").style.display = "flex";
    document.getElementById("user2").style.display = "flex";
    document.getElementById("user-label").style.display = "none";
    document.getElementById("user-input").style.display = "none";
  } else {
    window.location.href = "new.html";
  }
}
let savedUsername = "";

function initAs(username) {
  localStorage.setItem("username", username);
  window.location.href = "another.html";
}

barba.init({
  transitions: [
    {
      name: "fade",
      async leave(data) {
        await gsap.to(data.current.container, {
          opacity: 0,
          duration: 0.4,
        });
      },
      enter(data) {
        gsap.from(data.next.container, {
          opacity: 0,
          duration: 0.4,
        });
      },
    },
  ],
});
