document.addEventListener("DOMContentLoaded", function() {
  const registerButton = document.querySelector('.submit-button');

  registerButton.addEventListener('click', async function(event) {
      event.preventDefault(); // Prevent default form submission

      let failed = false;
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      const fileInput = document.querySelector('input[type="file"]');
      const emailError = document.getElementById('email-error');
      const passwordError = document.getElementById('password-error');
      const fileError = document.getElementById('file-error');
      // Clear previous errors
      emailError.innerText = '';
      passwordError.innerText = '';
      fileError.innerText = '';
  
      // Validate the Hunter College email
      if (!emailInput.value.endsWith('@myhunter.cuny.edu')) {
          emailError.innerText = 'Please use a Hunter College email to register.';
          failed = true;
      }
      
      // Validate password complexity
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(passwordInput.value)) {
          passwordError.innerText = 'Please check your password meets the complexity requirements.';
          failed = true;
      }
      
      // Validate the ID file upload
      if (fileInput.files.length === 0) {
          fileError.innerText = 'Please upload your Hunter College ID.';
          failed = true;
      }

      // If any validations failed, stop here
      if (failed) {
          return;
      }

      // If all validations pass, you can send data to the server
      const formData = new FormData();
      formData.append('email', emailInput.value);
      formData.append('password', passwordInput.value);
      formData.append('idFile', fileInput.files[0]);
      
      // Make the POST request
      try {
        const response = await fetch('/register', {
            method: 'POST',
            body: formData
        });
    
        const accountErrorDiv = document.getElementById('Account-error'); // Get the div where you want to display the error
        
        if (response.status === 200) {
            console.log('Account created successfully!');
            const loadingBarContainer = document.querySelector('.loading-bar-container');
            const loadingBar = document.querySelector('.loading-bar');
            const percentageText = document.querySelector('.loading-bar-percentage');
//...
            // Display the loading bar
            loadingBarContainer.style.display = "block";
        
            // Animate the loading bar
            let width = 0;
            const interval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(interval);
                    console.log('Done!')
                    percentageText.innerText = '0%';
                    loadingBarContainer.style.display = "none";
                    window.location.href = '/Success.html';
                } else {
                    width++;
                    loadingBar.style.width = width + '%';
                    percentageText.innerText = width + '%';
                }
            }, 10); 
        
             // Adjust this value to change the speed of the loading bar
        } else if (response.status === 500) {
            // Internal Server Error
            accountErrorDiv.innerText = 'An error occurred while creating your account. Please try again later.';
        } else if (response.status === 409) { // Custom code for "Conflict", i.e., user already pending
            // Handle user already pending
            accountErrorDiv.innerText = 'Account with email ' + emailInput.value + ' is already pending approval';
        } else {
            // Handle other HTTP codes
            console.error(`Server returned an HTTP ${response.status} code.`);
        }
    } catch (error) {
        console.error('There was a problem with the fetch:', error);
    }
  });
});

  