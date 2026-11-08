const accountSelect = document.getElementById("accountSelect");
const recordsMessage = document.getElementById("recordsMessage");
const recordsTable = document.getElementById("recordsTable");

let records = [];

async function loadRecords() {
    try {
        const response = await fetch("/api/records");

        if (response.status === 401) {
            window.location.href = "/";
            return;
        }

        const result = await response.json();

        if (!response.ok) {
            recordsMessage.textContent = result.message;
            return;
        }

        records = result.records;

        records.forEach(record => {
            const option = document.createElement("option");
            option.value = record.id;
            option.textContent = record.id;
            accountSelect.appendChild(option);
        });

    } catch (error) {
        console.error(error);
        recordsMessage.textContent = "Could not load records.";
    }
}

function displayRecord() {
    const selectedID = accountSelect.value;

    recordsTable.innerHTML = "";
    recordsMessage.textContent = "";

    if (!selectedID) {
        return;
    }

    const record = records.find(item => item.id === selectedID);

    if (!record || !record.formData) {
        recordsMessage.textContent = "This account has not submitted a survey.";
        return;
    }

    const data = record.formData;

    const table = document.createElement("table");
    table.className = "records-table";

    const fields = [
        ["Name", data.name],
        ["Age", data.age],
        ["Favorite Color", data.color],
        ["Gaming Platform", data.platform],
        ["Hours Played", data.hours],
        ["About Yourself", data.about]
    ];

    fields.forEach(([label, value]) => {
        const row = document.createElement("tr");

        const heading = document.createElement("th");
        heading.textContent = label;

        const cell = document.createElement("td");
        cell.textContent = value || "No response";

        row.appendChild(heading);
        row.appendChild(cell);
        table.appendChild(row);
    });

    recordsTable.appendChild(table);
}

accountSelect.addEventListener("change", displayRecord);

loadRecords();