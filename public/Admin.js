document.getElementById("adminForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const errorDiv = document.getElementById("error");
  const password = document.getElementById("password").value;
  const Upload = document.getElementsByClassName("Upload")[0];
  errorDiv.classList.add("show");
  const pass =  'crappassword54321';
  if (password === pass) {
    Upload.style.display = "block";
    fetch("/getPendingUsers")
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) {
          displayErrorMessage("No pending users at the moment");
          return;
        }

        const usersDiv = document.getElementById("pendingUsers");
        usersDiv.innerHTML = ""; // Clear the usersDiv before appending new data

        data.forEach((user, index) => {
          usersDiv.innerHTML += `
              <div class="card" id=${user.email}>   
                  <p>
                      ${user.email} 
                      <img src="./${user.filePath}"  class="judgement" alt="N/A" width="100"> <!-- Display the user's ID picture -->
                      <button class="Approve" onclick="approve('${user.email}')">Approve</button> 
                      <button class="Reject" onclick="reject('${user.email}')">Reject</button>
                  </p>
              </div>`;
          setTimeout(() => {
            const userDiv = document.getElementById(user.email);
            if (userDiv) {
              userDiv.style.opacity = "1";
              userDiv.style.transform = "translateY(0)";
            }
          }, index * 300);
        });
      });
  } else {
    const usersDiv = document.getElementById("pendingUsers");
    usersDiv.innerHTML = "";
    displayErrorMessage("Incorrect password");
  }
});
function displayErrorMessage(message, color = 'red', duration = 5000) {
  const errorDiv = document.getElementById("error");
  
  errorDiv.innerHTML = message;

  // Check the color argument and toggle the green-shadow class accordingly
  if(color === 'green') {
      errorDiv.classList.add('green-shadow');
      errorDiv.classList.remove('error-message'); // to ensure the red shadow isn't applied at the same time
  } else {
      errorDiv.classList.add('error-message');
      errorDiv.classList.remove('green-shadow'); // to ensure the green shadow isn't applied at the same time
  }

  errorDiv.style.opacity = "1";

  // Fade out the error message after the specified duration
  setTimeout(() => {
      errorDiv.style.opacity = "0";

      // Reset to default styles after fade out
      setTimeout(() => {
          errorDiv.classList.add('error-message');
          errorDiv.classList.remove('green-shadow');
      }, 1000);
  }, duration);
}



function approve(userId) {1
  fetch("/approveUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  })
    .then((res) => res.json())
    .then((data) => {
      const usersDiv = document.getElementById(userId);
      const errorDiv = document.getElementById("error");

      if (data.message === "User saved successfully and can login now") {
        if (usersDiv) {
          usersDiv.remove();
          if (errorDiv) {
            displayErrorMessage(`${userId} has been approved!`, 'green');
          }
        }
      } else if (data.message === "An error occurred") {
        if (errorDiv) {
          displayErrorMessage(`Failed to approve user ${userId}`);
        }
      }
    });
}
function reject(userId) {
  fetch("/rejectUser", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ userId }),
  })
    .then((res) => res.json())
    .then((data) => {
      const usersDiv = document.getElementById(userId);
      const errorDiv = document.getElementById("error");

      if (data.message === "User rejected successfully") {
        if (usersDiv) {
          usersDiv.remove();
          if (errorDiv) {
            displayErrorMessage(`${userId} has been rejected!`, 'green');
          }
        }
      } else if (data.message === "An error occurred") {
        if (errorDiv) {
          displayErrorMessage(`Failed to reject user ${userId}`);
        }
      }
    });
}

const headElement = document.querySelector(".head");
let originalText = headElement.textContent; // Store original text

headElement.addEventListener("mouseenter", scrambleText);
headElement.addEventListener("mouseleave", restoreText);
headElement.addEventListener("click", {
  once: true,
  handleEvent: () => {
    window.location = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  },
});
function scrambleText() {
  let scrambledText = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < originalText.length; i++) {
    if (originalText[i] === " ") {
      // retain space character
      scrambledText += " ";
    } else {
      scrambledText += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  headElement.textContent = scrambledText;
}

function restoreText() {
  headElement.textContent = originalText;
}

document.querySelector(".Upload").addEventListener("click", fetchAndDisplayUploads);

function fetchAndDisplayUploads(e) {
    e.preventDefault();
    const usersDiv = document.getElementById("pendingUsers");

    fetch('/GetUploads')
        .then(handleFetchResponse)
        .then(displayUploads)
        .catch(handleFetchError);
}

function handleFetchResponse(res) {
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    return res.json();
}

function displayUploads(data) {
    const usersDiv = document.getElementById("pendingUsers");
    usersDiv.innerHTML = ""; // Clear existing content
    
    data.forEach(upload => {
        const uploadDiv = createUploadElement(upload);
        usersDiv.appendChild(uploadDiv);
    });
}

function createUploadElement(upload) { 
  const filePathEncoded = encodeURIComponent(upload.filePath);
  const div = document.createElement('div');
  div.classList.add("Uploads");
  div.id = filePathEncoded;
  
 // Creating labels and input boxes
  const labels = ["ClassName", "WeekName", "Title", "Description"];
  labels.forEach(label => {
      const lblElement = document.createElement('label');
      lblElement.htmlFor = label;
      lblElement.innerText = `${label}:`;

      const inputElement = document.createElement('input');
      inputElement.type = "text";
      inputElement.id = label;
      inputElement.name = label;
      inputElement.value = upload[label];
      inputElement.readOnly = true;

      div.appendChild(lblElement);
      div.appendChild(inputElement);
  });

  // File display logic
  const fileExt = upload.filePath.split('.').pop().toLowerCase();
  let fileDisplayElement;
  switch (fileExt) {
      case 'pdf':
          fileDisplayElement = document.createElement('embed');
          fileDisplayElement.src = `./${upload.filePath}`;
          fileDisplayElement.type = "application/pdf";
          fileDisplayElement.width = "100%";
          fileDisplayElement.height = "400px";
          break;
      case 'mp4':
          fileDisplayElement = document.createElement('video');
          fileDisplayElement.width = "320";
          fileDisplayElement.height = "240";
          fileDisplayElement.controls = true;
          
          const sourceElement = document.createElement('source');
          sourceElement.src = `./${upload.filePath}`;
          sourceElement.type = "video/mp4";
          fileDisplayElement.appendChild(sourceElement);
          break;
      case 'docx':
      default:
          fileDisplayElement = document.createElement('a');
          fileDisplayElement.href = `./${upload.filePath}`;
          fileDisplayElement.target = "_blank";
          fileDisplayElement.innerText = fileExt === 'docx' ? "Download DOCX" : "Download File";
  }
  div.appendChild(fileDisplayElement);

  // Create approve and reject buttons
  const approveBtn = document.createElement('button');
  approveBtn.classList.add("Approve");
  approveBtn.textContent = "Approve";
  approveBtn.addEventListener("click", () => approveUpload(filePathEncoded));

  const rejectBtn = document.createElement('button');
  rejectBtn.classList.add("Reject");
  rejectBtn.textContent = "Reject";
  rejectBtn.addEventListener("click", () => rejectUpload(filePathEncoded));

  div.appendChild(approveBtn);
  div.appendChild(rejectBtn);
  
  return div;
}


function approveUpload(filePath) {
    const bodyData = {
        filePath: decodeURIComponent(filePath)
    };

    fetch("/approveUpload", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
    })
    .then(handleFetchResponse)
    .then(data => {
        const uploadDiv = document.getElementById(filePath);
        uploadDiv.remove();
        displayErrorMessage(`${filePath} has been approved!`, 'green');
    })
    .catch(handleFetchError);
}

function rejectUpload(filePath) {
    const bodyData = {
        filePath: decodeURIComponent(filePath)
    };

    fetch("/rejectUpload", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
    })
    .then(handleFetchResponse)
    .then(data => {
        const uploadDiv = document.getElementById(filePath);
        uploadDiv.remove();
        displayErrorMessage(data.message , 'green');
    })
    .catch(handleFetchError);
}

function handleFetchError(error) {
    displayErrorMessage(`Error: ${error.message}`, "red", 5000);
    console.error('There was a problem with the fetch operation:', error.message);
}
