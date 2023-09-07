import imgPath from "..uploads/2023-09-03T21-24-41.812Ztomean.jpg";

document.getElementById('adminForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const errorDiv = document.getElementById('error');
  const password = document.getElementById('password').value;
  errorDiv.classList.add('show');
  if (password === "Admin123") {
      fetch('/getPendingUsers').then(res => res.json()).then(data => {
        console.log(data);  
        if(data.length === 0){
          console.log("No data");
          errorDiv.innerHTML = "No pending users at the moment."; // Update the message to be more descriptive
          errorDiv.style.opacity = "1";
          
          // Set a timer to fade out the message after 5 seconds
          setTimeout(() => {
              errorDiv.style.opacity = "0";
          }, 2000);
          return;
      }

        const usersDiv = document.getElementById('pendingUsers');
          usersDiv.innerHTML = ''; // Clear the usersDiv before appending new data
          
          data.forEach((user,index) => {
            console.log(user.filePath);
              usersDiv.innerHTML += `
              <div class="card" id=${user.email}>   
                  <p>
                      ${user.email} 
                      <img src="./uploads/2023-09-03T21-24-41.812Ztomean.jpg" alt="N/A" width="100"> <!-- Display the user's ID picture -->
                      <button class="Approve" onclick="approve('${user.email}')">Approve</button> 
                      <button class="Reject" onclick="reject('${user.email}')">Reject</button>
                  </p>
              </div>`;
              setTimeout(() => {
                const userDiv = document.getElementById(user.email);
                if (userDiv) {
                    userDiv.style.opacity = '1';
                    userDiv.style.transform = 'translateY(0)';
                }
            }, index * 300);
          });
      });
  } else {
    const usersDiv = document.getElementById('pendingUsers');
    usersDiv.innerHTML = ''; 
    console.log("No data");
    const errorDiv = document.getElementById('error');
    errorDiv.innerHTML = "Incorrect password"; // Update the message to be more descriptive
    errorDiv.style.opacity = "1";
    
    // Set a timer to fade out the message after 5 seconds
    setTimeout(() => {
        errorDiv.style.opacity = "0";
    }, 2000);
    return;
  }
});

function approve(userId) {
  fetch('/approveUser', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
  })
  .then(res => res.json()).then(data => {
      const usersDiv = document.getElementById(userId);
      const errorDiv = document.getElementById('error');

      if (data.message === "User saved successfully and can login now") {
          if (usersDiv) {
              usersDiv.remove();
              if (errorDiv) {
                // Set the error message and fade in
                errorDiv.style.color = "green";
                errorDiv.innerHTML = `${userId} has been approved!`;
                errorDiv.style.opacity = "1";
                
                // Set a timer to fade out the error message after 5 seconds
                setTimeout(() => {
                    errorDiv.style.opacity = "0";
                    setTimeout(() => {
                      errorDiv.style.color = "red";
                    }, 1000);
                }, 2000);  // 5000 milliseconds = 5 seconds
              }
          }
      } else if (data.message === "An error occurred") {
          if (errorDiv) {
              // Set the error message and fade in
              errorDiv.innerHTML = `Failed to approve user ${userId}`;
              errorDiv.style.opacity = "1";
              
              // Set a timer to fade out the error message after 5 seconds
              setTimeout(() => {
                  errorDiv.style.opacity = "0";
              }, 5000);  // 5000 milliseconds = 5 seconds
          }
      }
  });
}
function reject(userId) {
  fetch('/rejectUser', {
      method: 'POST',
      headers: {
          'Content-type': 'application/json'
      },
      body: JSON.stringify({ userId })
    }).then(res => res.json()).then(data => {
      const usersDiv = document.getElementById(userId);
      const errorDiv = document.getElementById('error');

      if (data.message === "User rejected successfully") {
          if (usersDiv) {
              usersDiv.remove();
              if (errorDiv) {
                // Set the error message and fade in
                errorDiv.style.color = "green";
                errorDiv.innerHTML = `${userId} has been rejected!`;
                errorDiv.style.opacity = "1";
                
                // Set a timer to fade out the error message after 5 seconds
                setTimeout(() => {
                    errorDiv.style.opacity = "0";
                    setTimeout(() => {
                      errorDiv.style.color = "red";
                    }, 1000);
                }, 4000);  // 5000 milliseconds = 5 seconds
              }
          }
      } else if (data.message === "An error occurred") {
          if (errorDiv) {
              // Set the error message and fade in
              errorDiv.innerHTML = `Failed to reject user ${userId}`;
              errorDiv.style.opacity = "1";
              
              // Set a timer to fade out the error message after 5 seconds
              setTimeout(() => {
                  errorDiv.style.opacity = "0";
              }, 4000);  // 5000 milliseconds = 5 seconds
          }
      }
    });

}


const headElement = document.querySelector('.head');
let originalText = headElement.textContent; // Store original text

headElement.addEventListener('mouseenter', scrambleText);
headElement.addEventListener('mouseleave', restoreText);
headElement.addEventListener('click',{
  once: true,
  handleEvent: () => {
    window.location = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  }
});
function scrambleText() {
    let scrambledText = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < originalText.length; i++) {
        if (originalText[i] === ' ') { // retain space character
            scrambledText += ' ';
        } else {
            scrambledText += chars[Math.floor(Math.random() * chars.length)];
        }
    }
    headElement.textContent = scrambledText;
}

function restoreText() {
    headElement.textContent = originalText;
}