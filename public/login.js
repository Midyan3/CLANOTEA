document.addEventListener('DOMContentLoaded', (event) => {
    const loginButton = document.querySelector('.submit-button');
    const emailField = document.querySelector('#email');
    const passwordField = document.querySelector('#password');

    loginButton.addEventListener('click', async function(event) {
        event.preventDefault();
        
        const email = emailField.value;
        const password = passwordField.value;

        // Show the "Logging in..." animation immediately after click
        showLoginAnimation();

        const loginStartTime = Date.now();

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(res => {
            // Ensure the animation plays for at least 1 second (1000 milliseconds)
            const elapsedTime = Date.now() - loginStartTime;
            const delay = Math.max(0, 1000 - elapsedTime);

            setTimeout(() => {
                // Hide the "Logging in..." animation
                hideLoginAnimation();

                if (res.status === 400) {
                    showError();
                } else if (res.status === 200) {
                    showSuccess();
                    setTimeout(() => {
                        window.location.href = '/Home.html'; 
                    }, 2500);
                }
            }, delay);

            return res.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(err => {
            hideLoginAnimation();
            console.error("Error during login:", err);
        });
    });
});

function showLoginAnimation() {
    const loginAnimation = document.querySelector('.login-animation');
    loginAnimation.style.display = 'block';
}

function hideLoginAnimation() {
    const loginAnimation = document.querySelector('.login-animation');
    loginAnimation.style.display = 'none';
}

function showError() {
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    const errorMessage = document.querySelector('.error-message');

    emailInput.classList.add('error');
    passwordInput.classList.add('error');
    errorMessage.style.display = 'block';

    setTimeout(() => {
        errorMessage.classList.add('active');
    }, 10); 
}

function clearError() {
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    const errorMessage = document.querySelector('.error-message');

    emailInput.classList.remove('error');
    passwordInput.classList.remove('error');
    errorMessage.classList.remove('active');

    setTimeout(() => {
        if(!errorMessage.classList.contains('active')) {
            errorMessage.style.display = 'none';
        }
    }, 1000); 
}

function showSuccess() {
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');

    emailInput.classList.add('success');
    passwordInput.classList.add('success');
}

setTimeout(() => {
    document.querySelector('#email').addEventListener('keyup', clearError);
    document.querySelector('#password').addEventListener('keyup', clearError);
}, 3000);
document.body.addEventListener('mousemove', (e) => {
    const xPos = (e.clientX / window.innerWidth) * 100;
    const yPos = (e.clientY / window.innerHeight) * 100;
    document.body.style.setProperty('--x-pos', `${xPos}%`);
    document.body.style.setProperty('--y-pos', `${yPos}%`);
  });
  
  document.querySelector('.header').addEventListener('mouseover', function(e) {
    let ripple = document.createElement("span");
    let rect = e.target.getBoundingClientRect();
    let size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = e.clientX - rect.left - (size / 2) + 'px';
    ripple.style.top = e.clientY - rect.top - (size / 2) + 'px';
    ripple.classList.add('ripple');

    const existingRipples = document.querySelectorAll('.ripple');
    if (existingRipples.length) {
      existingRipples[0].remove();
    }

    e.target.appendChild(ripple);
});
