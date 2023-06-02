
const loginForm = document.querySelector(".login-form");
const registerInput = loginForm.querySelector(".register-input");
const submitButton = loginForm.querySelector(".login-input > input[type='submit']");

const usernameFocusOut = async (name) => {
    
    if (!name) return;

    const { success, available } = await fetchAPI(`/api/auth/username?name=${name}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!success) return;

    if (isHidden(registerInput) === available) {
        registerInput.classList.toggle("hidden");

        if (available) {
            loginForm.dataset.api = "/api/auth/register";
            submitButton.value = "Register";
        } else {
            loginForm.dataset.api = "/api/auth/login";
            submitButton.value = "Login";
        }
    }
}

const submitForm = async () => {

    const username = loginForm.querySelector("#username");
    const password = loginForm.querySelector("#password");
    const confirmPassword = loginForm.querySelector("#confirm-password");
    const email = loginForm.querySelector("#email");

    const apiAction = loginForm.dataset.api;

    const body = apiAction === "/api/auth/register" ? {
        username: username.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
        email: email.value
    } : {
        username: username.value,
        password: password.value
    };

    const { success, message, user } = await fetchAPI(apiAction, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    notify(message, success ? "success" : "error");
    if (success) {
        setTimeout(() => {
            window.location.href = "/";
        }, 1500);
    }
}