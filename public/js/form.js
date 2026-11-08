
const surveyForm = document.getElementById("surveyForm");
const hoursInput = document.getElementById("hours");
const hoursValue = document.getElementById("hoursValue");
const formMessage = document.getElementById("formMessage");

// Update slider display
hoursInput.addEventListener("input", function() {
    hoursValue.textContent = hoursInput.value;
});

// Load previous survey answers
async function loadSurvey() {
    try {
        const response = await fetch("/api/form");

        if (response.status === 401) {
            window.location.href = "/";
            return;
        }

        const result = await response.json();

        if (result.formData) {
            document.getElementById("name").value =
                result.formData.name || "";

            document.getElementById("age").value =
                result.formData.age || "";

            document.getElementById("color").value =
                result.formData.color || "";

            document.getElementById("hours").value =
                result.formData.hours ?? 2;

            document.getElementById("about").value =
                result.formData.about || "";

            if (result.formData.platform) {
                const selected = document.querySelector(
                    `input[name="platform"][value="${result.formData.platform}"]`
                );

                if (selected) {
                    selected.checked = true;
                }
            }

            hoursValue.textContent =
                document.getElementById("hours").value;
        }

    } catch (error) {
        console.error(error);
        formMessage.textContent = "Could not load your survey.";
    }
}

// Save survey answers
surveyForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const selectedPlatform = document.querySelector(
        'input[name="platform"]:checked'
    );

    const formData = {
        name: document.getElementById("name").value,
        age: document.getElementById("age").value,
        color: document.getElementById("color").value,
        platform: selectedPlatform ? selectedPlatform.value : "",
        hours: document.getElementById("hours").value,
        about: document.getElementById("about").value
    };

    try {
        const response = await fetch("/api/form", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = "/";
                return;
            }

            alert(result.message);
            return;
        }

        formMessage.textContent = "Your survey has been saved!";

    } catch (error) {
        console.error(error);
        alert("Unable to save your survey.");
    }
});

loadSurvey();
