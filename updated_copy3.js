document.body.style.zoom = "100%";
const body = document.querySelector("body");
const outputElement = document.getElementById("output");
const element = document.getElementById("coolani");
const screenHeight = window.innerHeight;
let savedUsername, finalTime, longPressTimer;
let selectedMessageIds = [];
let room_name = "tanRi";

const firebaseConfig = {
  apiKey: "AIzaSyCMIEE18ox9AnRgcPM-RaXFHJsiiuNVgs0",
  authDomain: "brandnew-a0ed3.firebaseapp.com",
  databaseURL: "https://brandnew-a0ed3-default-rtdb.firebaseio.com",
  projectId: "brandnew-a0ed3",
  storageBucket: "brandnew-a0ed3.firebasestorage.app",
  messagingSenderId: "21830356734",
  appId: "1:21830356734:web:dcee40a0e02386c918dfaf",
};
// Firebase Configuration
const firebaseConfig_cr = {
  apiKey: "AIzaSyC4UIKYVGc7SpZtliePivo1kWpoyMhTv2E",
  authDomain: "finalone-5d3cd.firebaseapp.com",
  databaseURL: "https://finalone-5d3cd-default-rtdb.firebaseio.com",
  projectId: "finalone-5d3cd",
  storageBucket: "finalone-5d3cd.firebasestorage.app",
  messagingSenderId: "1057241366940",
  appId: "1:1057241366940:web:815d788511f14ad9254859",
};

// document.body.addEventListener("click", () => {
//   document.documentElement.requestFullscreen();
// }, { once: true });

const firebaseApp_other = firebase.initializeApp(firebaseConfig_cr, "other");
const db = firebaseApp_other.database();
const firebaseApp_img = firebase.initializeApp(firebaseConfig, "image");
const db_img = firebaseApp_img.database();

savedUsername = localStorage.getItem("username");
const userRef = db.ref(`users/user${savedUsername}`);
const otherUserRef = db.ref(
  `users/user${savedUsername === "tan" ? "Ri" : "tan"}`
);

function setOnlineStatus(isOnline) {
  userRef.set(isOnline ? "Online" : finalTime);
}

setInterval(() => {
  const dt = new Date();
  const hours = dt.getHours() % 12 || 12;
  const AmOrPm = dt.getHours() >= 12 ? "PM" : "AM";
  const minutes = dt.getMinutes().toString().padStart(2, "0");
  const day = dt.getDate().toString().padStart(2, "0");
  const month = (dt.getMonth() + 1).toString().padStart(2, "0");
  finalTime = `${day}/${month}-${hours}:${minutes} ${AmOrPm}`;
}, 1000);

let newWidth = window.getComputedStyle(outputElement).width;
let newHeigth = window.getComputedStyle(outputElement).height;

function updateMargin() {
  document.getElementById("more").style.width = newWidth;
}

updateMargin();
window.addEventListener("resize", updateMargin);
window.addEventListener("beforeunload", () => setOnlineStatus(false));
document.addEventListener("visibilitychange", () =>
  setOnlineStatus(document.visibilityState === "visible")
);

document.addEventListener("DOMContentLoaded", getGreeting);

function getGreeting() {
  const dt = new Date();
  const hours = dt.getHours();
  let greeting;

  // if (hours >= 5 && hours < 14) {
  //   showPopup("Good Morning Januu...🥰", 4);
  // } else if (hours >= 14 && hours < 21) {
  //   showPopup("Hello Tanuu ❣️", 3.5);
  // } else {
  //   showPopup("Good Night Yrr...So Jaa 😘", 3.5);
  // }

  return greeting;
}

document.addEventListener("DOMContentLoaded", () => {
  // Trigger animation after short delay
  setTimeout(() => {
    document.querySelectorAll(".page-load-animate").forEach((el) => {
      el.classList.add("active");
    });
  }, 100); // short delay to let styles apply
});

function updateUserStatus() {
  db.ref("users/usertan").on("value", (snapshot) => {
    if (savedUsername === "Ri") {
      document.getElementById("status").textContent = snapshot.val();
      document.title = snapshot.val() === "Online" ? "Online" : "GoChat😎";
    }
  });
  db.ref("users/userRi").on("value", (snapshot) => {
    if (savedUsername === "tan") {
      document.getElementById("status").textContent = snapshot.val();
      document.title = snapshot.val() === "Online" ? "Online" : "GoChat😎";
    }
  });
}
updateUserStatus();

function detectAndStyleLinksForMultipleTexts(className) {
  document.querySelectorAll(`.${className}`).forEach((container) => {
    const urlRegex =
      /(?:https?:\/\/|www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:[^\s]*)/g;
    container.innerHTML = container.innerHTML.replace(urlRegex, (match) => {
      const url = match.startsWith("http") ? match : "https://" + match;
      return `<a href="${url}" class="detected-link" target="_blank">${url}</a>`;
    });
  });
}

let oldestMessageKey = null;
let loadingMore = false;
const messagesPerPage = 50;

let scrolled = false;
let latestMessageKey = null; // for real-time listener

function getData() {
  const loader = document.getElementById("firebaseLoader");
  loader.classList.remove("fade-out"); // Show + reset
  loader.style.visibility = "visible";
  loader.style.opacity = "1";

  db.ref(room_name)
    .orderByKey()
    .limitToLast(messagesPerPage)
    .once("value", (snapshot) => {
      const messages = [];
      snapshot.forEach((childSnapshot) => {
        messages.push(childSnapshot);
      });

      messages.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        if (!seenMessages.has(key)) {
          renderMessage(childSnapshot); // initial load
          seenMessages.add(key);

          if (!latestMessageKey || key > latestMessageKey) {
            latestMessageKey = key;
          }

          if (!oldestMessageKey || key < oldestMessageKey) {
            oldestMessageKey = key;
          }
        }
      });

      scrollToBottom();

      db.ref(room_name)
        .orderByKey()
        .startAt(latestMessageKey)
        .on("child_added", (snapshot) => {
          const key = snapshot.key;
          if (!seenMessages.has(key)) {
            renderMessage(snapshot);
            seenMessages.add(key);
            latestMessageKey = key;
          }
        });

      // ✅ Smooth fade out (no display: none)
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
      }, 1000); // Match with CSS transition duration
    });

  scrolled = true;
}

function scrollToBottom() {
  outputElement.scrollTop = outputElement.scrollHeight;
}

// Attach scroll event listener only after initial load is complete
function enableScrollDetection() {
  outputElement.addEventListener("scroll", () => {
    if (outputElement.scrollTop <= 20 && !loadingMore) {
      loadOlderMessages();
    }
  });
}

// After initial load, enable scroll detection
setTimeout(() => {
  scrolled = true;
  enableScrollDetection();
}, 10000);

function loadOlderMessages() {
  if (!oldestMessageKey) return;

  loadingMore = true;
  const scrollBefore = outputElement.scrollHeight;

  db.ref(room_name)
    .orderByKey()
    .endAt(oldestMessageKey)
    .limitToLast(messagesPerPage + 1) // +1 to remove overlap
    .once("value", (snapshot) => {
      const messages = [];
      snapshot.forEach((childSnapshot) => {
        messages.push(childSnapshot);
      });

      if (messages.length <= 1) {
        loadingMore = false;
        return; // no more older messages
      }

      messages.pop(); // remove duplicate

      messages.reverse().forEach((childSnapshot) => {
        const key = childSnapshot.key;
        if (!seenMessages.has(key)) {
          renderMessage(childSnapshot, true); // prepend
          seenMessages.add(key);
          if (!oldestMessageKey || key < oldestMessageKey) {
            oldestMessageKey = key;
          }
        }
      });

      const scrollAfter = outputElement.scrollHeight;
      outputElement.scrollTop = scrollAfter - scrollBefore;
      loadingMore = false;
    });
}

function toggleFullscreen(icon) {
  if (!document.fullscreenElement) {
    // Enter fullscreen
    document.documentElement
      .requestFullscreen()
      .then(() => {
        icon.classList.remove("bx-fullscreen");
        icon.classList.add("bx-exit-fullscreen");
      })
      .catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
  } else {
    // Exit fullscreen
    document
      .exitFullscreen()
      .then(() => {
        icon.classList.remove("bx-exit-fullscreen");
        icon.classList.add("bx-fullscreen");
      })
      .catch((err) => {
        console.error(`Error attempting to disable fullscreen: ${err.message}`);
      });
  }
}

document.addEventListener("fullscreenchange", () => {
  const icon = document.getElementById("shortCutFullscreen");
  if (!document.fullscreenElement) {
    icon.classList.remove("bx-exit-fullscreen");
    icon.classList.add("bx-fullscreen");
  }
});

let previousSender = ""; // Persist sender between calls

function renderMessage(snapshot, prepend = false) {
  const { name: sender, time, message, type } = snapshot.val();
  const isCurrentUser = sender === savedUsername;
  const alignmentClass = isCurrentUser ? "right-align" : "left-align";
  const borderRadius =
    sender === previousSender
      ? "20px"
      : isCurrentUser
      ? "20px 5px 20px 20px"
      : "5px 20px 20px 20px";

  let html = "";

  if (type === "image") {
    html = `
      <div class='msg main_msg_contain_img ${alignmentClass}' style='${
      sender === previousSender ? "margin-top: -4px;" : ""
    }'>
        <div id='${snapshot.key}' class='msg_contain_audio'
          style='border-radius: ${borderRadius};'
          onmousedown='startLongPress(this)'
          onmouseup='clearLongPress()'
          ontouchstart='startLongPress(this)'
          ontouchend='clearLongPress()'>
          <button class="buttonImg" id="${
            snapshot.key
          }" onclick="retriveImg(this)">
            <i id="iconImg" class="bx bx-right-arrow-alt"></i> Image
          </button>
          <p class='time_given ${
            isCurrentUser ? "left-align-time" : "right-align-time"
          }'>${time}</p>
        </div>
      </div>
      <br>`;
  } else {
    html = `
      <div class='msg main_msg_contain ${alignmentClass}' style='${
      sender === previousSender ? "margin-top: -4px;" : ""
    }'>
        <div id='${
          snapshot.key
        }' class='msg_contain ${alignmentClass}' style='border-radius: ${borderRadius};'
          onmousedown='startLongPress(this)' onmouseup='clearLongPress()'
          ontouchstart='startLongPress(this)' ontouchend='clearLongPress()'>
          <span class='message_text'>${message}</span>
          <p class='time_given ${
            isCurrentUser ? "left-align-time" : "right-align-time"
          }'>${time}</p>
        </div>
      </div>
      <br>`;
  }

  if (prepend) {
    outputElement.insertAdjacentHTML("afterbegin", html);
  } else {
    outputElement.innerHTML += html;
    outputElement.scrollTop = outputElement.scrollHeight;
  }

  previousSender = sender;
  detectAndStyleLinksForMultipleTexts("message_text");

  // After inserting message, update animations to reflect new elements
  updateScrollAnimations();
}

function updateScrollAnimations() {
  const chatContainer = outputElement; // your container element where messages are rendered
  const messages = chatContainer.querySelectorAll(".msg");

  messages.forEach((msg) => {
    const rect = msg.getBoundingClientRect();
    const offsetFromTop = rect.top;

    const isCurrentUser = msg.classList.contains("right-align");

    if (offsetFromTop > 0 && offsetFromTop < window.innerHeight) {
      const shift = Math.max(0, 70 - offsetFromTop / 0.8);
      const direction = isCurrentUser ? shift : -shift;

      msg.style.transform = `translateX(${direction}px)`;
      msg.style.opacity = `${1 - shift / 100}`;
    } else {
      msg.style.transform = isCurrentUser
        ? "translateX(100px)"
        : "translateX(-100px)";
      msg.style.opacity = "0";
    }
  });
}

const chatContainer = document.getElementById("output"); // or use window if no container

chatContainer.addEventListener("scroll", () => {
  const messages = document.querySelectorAll(".msg");

  messages.forEach((msg) => {
    const rect = msg.getBoundingClientRect();
    const offsetFromTop = rect.top;

    // Check if the message is aligned to the right (current user) or left (others)
    const isCurrentUser = msg.classList.contains("right-align"); // If it's right-align, it's from the current user

    // Only apply animation when the message is in view
    if (offsetFromTop > 0 && offsetFromTop < window.innerHeight) {
      // Closer to top = smaller X shift
      const shift = Math.max(0, 70 - offsetFromTop / 0.8); // Adjust this value for animation effect
      const direction = isCurrentUser ? shift : -shift; // Negative for left (current user), positive for right (others)

      msg.style.transform = `translateX(${direction}px)`;
      msg.style.opacity = `${1 - shift / 100}`;
    } else {
      msg.style.transform = `${
        isCurrentUser ? "translateX(100px)" : "translateX(-100px)"
      }`;
      msg.style.opacity = "0";
    }
  });
});

function openLink() {
  window.open("https://tv-rs.github.io/old", "_blank");
}

function send() {
  const msg = document.getElementById("msg").value.trim();
  if (msg === "") return;

  const messageData = {
    name: savedUsername,
    message: msg,
    time: finalTime,
  };

  db.ref(room_name).push(messageData);
  document.getElementById("msg").value = "";
}

// Initialize chat on page load
window.onload = function () {
  getData();
};

function startLongPress(element) {
  longPressTimer = setTimeout(() => {
    element.style.backgroundColor = "red";
    element.classList.add("selected");
    document.getElementById("btnCloseEmer").style.display = "block";
    document.getElementById("cancelDel").style.display = "block";
    selectedMessageIds.push(element.id);
  }, 500);
}

function cancelLongPress() {
  // Remove red background and 'selected' class from all selected messages
  selectedMessageIds.forEach((id) => {
    const msgElement = document.getElementById(id);
    if (msgElement) {
      msgElement.style.backgroundColor = "";
      msgElement.classList.remove("selected");
    }
  });

  // Clear the selected message list
  selectedMessageIds = [];

  // Hide action buttons
  document.getElementById("btnCloseEmer").style.display = "none";
  document.getElementById("cancelDel").style.display = "none";

  // Clear any long press timers
  clearTimeout(longPressTimer);
}

function clearLongPress() {
  clearTimeout(longPressTimer);
}
function deleteSelectedMessages() {
  selectedMessageIds.forEach((messageId) => {
    db.ref(room_name)
      .child(messageId)
      .once("value")
      .then((snapshot) => {
        const message = snapshot.val();
        if (message) {
          // Delete image from image DB if needed
          if (message.type === "image" && message.text) {
            firebaseApp_img
              .database()
              .ref(room_name)
              .child(message.text)
              .remove();
          }

          // Delete message from main DB
          db.ref(room_name)
            .child(messageId)
            .remove()
            .then(() => {
              // Remove the message element from DOM
              const elem = document.getElementById(messageId);
              if (elem) {
                const parent = elem.closest(".msg"); // removes entire .msg block
                if (parent) parent.remove();
              }
            });
        }
      });
  });

  // Reset selection and hide buttons
  selectedMessageIds = [];
  document.getElementById("btnCloseEmer").style.display = "none";
  document.getElementById("cancelDel").style.display = "none";
}

function retriveImg(buttonElement) {
  const messageKey = buttonElement.id;
  firebaseApp_other
    .database()
    .ref(room_name)
    .child(messageKey)
    .once("value")
    .then((snapshot) => {
      const messageData = snapshot.val();
      if (messageData && messageData.text) {
        const imgKey = messageData.text;
        firebaseApp_img
          .database()
          .ref(room_name)
          .child(imgKey)
          .once("value")
          .then((imgSnapshot) => {
            const imgData = imgSnapshot.val();
            if (imgData && imgData.message) {
              const imageURL = imgData.message;

              // Find the message div and the button
              const msgDiv = document.getElementById(messageKey);
              const button = msgDiv.querySelector(".buttonImg");

              // Hide the button
              if (button) {
                button.style.display = "none";
              }

              // Create the image element and insert it
              const imgElement = document.createElement("img");
              imgElement.src = imageURL;
              imgElement.alt = "Image";
              imgElement.classList.add("msg_contain_img");
              imgElement.style.height = "140px"; // Adjust height as necessary
              imgElement.style.borderRadius = "20px"; // Optional, matching your styling
              imgElement.setAttribute("onclick", "openImage(this)");

              // Replace the button with the image inside the same div
              msgDiv.appendChild(imgElement);
            } else {
              console.warn("Image data not found in img DB for key:", imgKey);
            }
          });
      } else {
        console.warn("Message data not found in other DB for key:", messageKey);
      }
    });
}

document.addEventListener("keypress", (event) => {
  if (event.key === "Enter") send();
});

let compressedImageDataUrl = null;
let compressedImageName = null;
let selectedImageFile = null;

function clickattach() {
  const input = document.getElementById("files");
  input.type = "file";
  input.onchange = (e) => {
    const file = e.target.files[0];
    input.value = ""; // ✅ Reset the input so same file can be selected again
    if (!file) return;

    selectedImageFile = file;

    updatePreviewWithQuality(); // ✅ shows the preview with current slider quality
    document.getElementById("overlay").style.display = "block";
  };
  input.click();
}

function uploadAndSendImage() {
  if (!compressedImageDataUrl || !compressedImageName) return;
  const dataToSave = {
    message: compressedImageDataUrl,
  };
  const newRef = firebaseApp_img.database().ref(room_name).push();
  newRef.set(dataToSave).then(() => {
    const dataToSave = {
      name: savedUsername,
      text: newRef.key,
      type: "image",
      time: finalTime,
    };

    firebaseApp_other.database().ref(room_name).push(dataToSave);
    cancelImage();
  });
}

function cancelImage() {
  document.getElementById("overlay").style.display = "none";
  compressedImageDataUrl = null;
  compressedImageName = null;
}

// function compressImage(file, callback) {
//   const reader = new FileReader();
//   reader.readAsDataURL(file);

//   reader.onload = function (event) {
//     const img = new Image();
//     img.src = event.target.result;

//     img.onload = function () {
//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");

//       const maxWidth = 400;
//       const scale = maxWidth / img.width;
//       canvas.width = maxWidth;
//       canvas.height = img.height * scale;

//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//       const compressed = canvas.toDataURL("image/webp", 10);
//       callback(compressed);
//     };
//   };
// }

function compressImage(file, quality, callback) {
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = function (event) {
    const img = new Image();
    img.src = event.target.result;

    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const maxWidth = 400;
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL("image/webp", quality);
      callback(compressed);
    };
  };
}

function updatePreviewWithQuality() {
  if (!selectedImageFile) return;

  const qualitySlider = document.getElementById("slider");
  const quality = parseInt(qualitySlider.value) / 100; // Convert 1-100 to 0.01-1.0

  compressImage(selectedImageFile, quality, (compressedDataUrl) => {
    compressedImageDataUrl = compressedDataUrl;
    compressedImageName = selectedImageFile.name;
    document.getElementById("myimg").src = compressedDataUrl;
  });
}

document.getElementById("slider").addEventListener("input", () => {
  updatePreviewWithQuality();
});

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function encodeBase32(bytes) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let output = "";
  let buffer = 0;
  let bitsLeft = 0;

  for (let byte of bytes) {
    buffer = (buffer << 8) | byte;
    bitsLeft += 8;

    while (bitsLeft >= 5) {
      const index = (buffer >> (bitsLeft - 5)) & 31;
      output += alphabet[index];
      bitsLeft -= 5;
    }
  }

  if (bitsLeft > 0) {
    const index = (buffer << (5 - bitsLeft)) & 31;
    output += alphabet[index];
  }

  return output;
}

function handleUpload(file) {
  compressImage(file, function (base64DataUrl) {
    document.getElementById("preview").src = base64DataUrl;
  });
}

const seenMessages = new Set();

function createChat() {
  var room_name1 = "tanRi";
  firebaseApp_other
    .database()
    .ref("/")
    .once("value")
    .then(function (snapshot) {
      if (snapshot.hasChild(room_name1)) {
        navigateToChat(room_name1);
      } else {
        firebaseApp_other
          .database()
          .ref("/")
          .child(room_name1)
          .update({
            purpose: "adding room name",
          })
          .then(() => {
            localStorage.setItem("room_name", room_name1);
            navigateToChat(room_name1);
          });
      }
    });
}

function navigateToChat(room_name1) {
  localStorage.setItem("room_name", room_name1);
  getData();
}

document.getElementById("menu-open").addEventListener("change", function () {
  let musicBtn = document.getElementById("music");

  if (this.checked) {
    musicBtn.style.display = "none";
    document.querySelector(".design").style.height = "135px";
    document.querySelector(".design").style.width = "145px";
    document.querySelector(".design").style.borderRadius = "0px 0px 55px 0px";
    document.documentElement.style.setProperty("--design-top", "135px");
    document.getElementById("status").style.padding = "3px 8% 5px 10px";
  } else {
    musicBtn.style.display = "flex";
    document.querySelector(".design").style.height = "60px";
    document.querySelector(".design").style.width = "125px";
    document.querySelector(".design").style.borderRadius = "0px 0px 35px 0px";
    document.documentElement.style.setProperty("--design-top", "60px");
    document.getElementById("status").style.padding = "3px 15% 5px 10px";
  }
});
createChat();

const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none"> 
  <path d="M4 7C4 5.58579 4 4.87868 4.43934 4.43934C4.87868 4 5.58579 4 7 4C8.41421 4 9.12132 4 9.56066 4.43934C10 4.87868 10 5.58579 10 7V17C10 18.4142 10 19.1213 9.56066 19.5607C9.12132 20 8.41421 20 7 20C5.58579 20 4.87868 20 4.43934 19.5607C4 19.1213 4 18.4142 4 17V7Z" stroke="currentColor" stroke-width="1.5" /> 
  <path d="M14 7C14 5.58579 14 4.87868 14.4393 4.43934C14.8787 4 15.5858 4 17 4C18.4142 4 19.1213 4 19.5607 4.43934C20 4.87868 20 5.58579 20 7V17C20 18.4142 20 19.1213 19.5607 19.5607C19.1213 20 18.4142 20 17 20C15.5858 20 14.8787 20 14.4393 19.5607C14 19.1213 14 18.4142 14 17V7Z" stroke="currentColor" stroke-width="1.5" />
</svg>`;

const startIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">  
  <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
</svg>`;

const ytinput = document.getElementById("ytinput");
const btnStart = document.getElementById("btnYT");
const videoFrames = document.querySelectorAll(".video");

function showPopup(text, duration) {
  let popup = document.getElementById("popup");
  let popupText = document.getElementById("popupText");

  popupText.innerText = text.trim();
  popup.style.display = "block";

  setTimeout(() => {
    if (Array.from(text.trim()).length === 1) {
      popup.style.top = "15%";
      popup.classList.remove("active");
      popup.classList.add("activeCool");
    } else {
      popup.style.top = "15%";
      popup.classList.remove("activeCool");
      popup.classList.add("active");
    }
  }, 10);

  setTimeout(() => {
    popup.style.top = "-100px";
    setTimeout(() => {
      popup.classList.remove("active", "activeCool");
    }, 1000);
    setTimeout(() => (popup.style.display = "none"), 500);
  }, duration * 1000);
}

function openImage(imgE) {
  document.getElementById("loaderpop").style.display = "flex";
  document.getElementById("close-image-btn").style.display = "flex";
  document.getElementById("popimg").src = imgE.src;
}

function close_img() {
  document.getElementById("loaderpop").style.display = "none";
  document.getElementById("close-image-btn").style.display = "none";
}

const slider = document.getElementById("slider");
const valueBox = document.getElementById("slider-value");
let fadeTimer;

slider.addEventListener("input", () => {
  valueBox.textContent = slider.value + "%";
  valueBox.classList.add("visible");

  clearTimeout(fadeTimer); // Reset previous timer
  fadeTimer = setTimeout(() => {
    valueBox.classList.remove("visible");
  }, 1500); // Fade out after 1.5 seconds
});
