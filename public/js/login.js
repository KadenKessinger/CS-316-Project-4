
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const rememberCheckbox = document.getElementById("rememberUsername");
const createAccountButton = document.getElementById("createAccountButton");

// Load remembered username
if (localStorage.getItem("rememberUsername") === "true") {
    rememberCheckbox.checked = true;
    usernameInput.value = localStorage.getItem("savedUsername") || "";
}

// Remember username when checkbox is changed
rememberCheckbox.addEventListener("change", function() {
    if (rememberCheckbox.checked) {
        localStorage.setItem("rememberUsername", "true");
        localStorage.setItem("savedUsername", usernameInput.value);
    } else {
        localStorage.removeItem("rememberUsername");
        localStorage.removeItem("savedUsername");
    }
});

// Update remembered username when typing
usernameInput.addEventListener("input", function() {
    if (rememberCheckbox.checked) {
        localStorage.setItem("savedUsername", usernameInput.value);
    }
});

// Login
loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message);
            return;
        }

        window.location.href = "/form.html";

    } catch (error) {
        alert("Unable to connect to the server.");
        console.error(error);
    }
});

// Navigate to account creation
createAccountButton.addEventListener("click", function() {
    window.location.href = "/create-account.html";
});
