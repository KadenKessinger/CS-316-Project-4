
const createAccountForm = document.getElementById("createAccountForm");

createAccountForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password.trim()) {
        alert("Please enter a username and password.");
        return;
    }

    try {
        const response = await fetch("/api/create-account", {
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

        alert("Account created successfully! Your ID is " + result.id);

        window.location.href = "/";

    } catch (error) {
        alert("Unable to connect to the server.");
        console.error(error);
    }
});
