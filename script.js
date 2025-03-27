const folders = ["data", "group_1", "group_2"];
const maxDays = 60;
const mainlineBranch = `https://raw.githubusercontent.com/suddu16/ipl-fantasy/main`;
// Function to populate dropdowns for each tab
function populateDropdowns() {
    folders.forEach(folder => {
        const select = document.getElementById(`${folder}Selector`);
        if (folder === 'data') {
            // Handle 'data' folder with mvp_day_X.csv files
            for (let i = 0; i <= 60; i++) { // Assuming you have up to 60 days worth of data
                const filename = `${mainlineBranch}/ipl2025/data/mvp_day_${i}.csv`;

                // Create an option for each file
                const option = document.createElement("option");
                option.value = filename;
                option.textContent = `Day ${i}`; // Display "Day X" in the dropdown
                select.appendChild(option);
            }
        } else {
            for (let day = 0; day <= maxDays; day++) {
                const option = document.createElement("option");
                option.value = `${mainlineBranch}/ipl2025/${folder}/ipl2025_results_day_${day}.csv`;
                option.textContent = `Day ${day}`;
                select.appendChild(option);
            }
        }
    });
}

// Function to switch between tabs
function showTab(folder) {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.getElementById(folder).classList.add("active");
}

// Function to load CSV and check if it exists
async function loadCSV(folder) {
    let select, filename, messageDiv, tableDiv;

    // Set up player tabs
    if (folder === "group_1Players") {
        select = document.getElementById("group_1PlayersSelector");
        filename = select.value;
        messageDiv = document.getElementById("group_1PlayerMessage");
        tableDiv = document.getElementById("group_1PlayerTable");
    } else if (folder === "group_2Players") {
        select = document.getElementById("group_2PlayersSelector");
        filename = select.value;
        messageDiv = document.getElementById("group_2PlayerMessage");
        tableDiv = document.getElementById("group_2PlayerTable");
    } else {
        // Set up other tabs (data, group_1, group_2)
        select = document.getElementById(`${folder}Selector`);
        filename = select.value;
        messageDiv = document.getElementById(`${folder}Message`);
        tableDiv = document.getElementById(`${folder}Table`);
    }
    console.log('here');

    // Check if the messageDiv and tableDiv are not null
    if (!messageDiv || !tableDiv) {
        console.error(`Error: Cannot find elements for ${folder} - messageDiv or tableDiv is null.`);
        return;
    }

    try {
        const response = await fetch(filename, { method: "HEAD" });

        if (!response.ok) throw new Error("File not found");

        messageDiv.textContent = `Loading ${filename}...`;

        // Fetch the CSV data
        const csvResponse = await fetch(filename);
        const csvText = await csvResponse.text();

        // Convert CSV text to a 2D array, filtering out any empty rows
        const rows = csvText.split("\n")
            .map(row => row.split(","))
            .filter(row => row.length > 1); // Filter out empty or malformed rows

        // Clear previous table data
        tableDiv.innerHTML = "";

        // Create a table
        const table = document.createElement("table");

        // Table header
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        // Add "Day" as the first column in the header
        const thDay = document.createElement("th");
        thDay.textContent = "#";
        headerRow.appendChild(thDay);

        // Add CSV headers (without "Day" as it's already added)
        rows[0].forEach(field => {
            const th = document.createElement("th");
            th.textContent = field;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Table body
        const tbody = document.createElement("tbody");
        rows.slice(1).forEach((row, index) => {
            const tr = document.createElement("tr");

            // Add "Day" number as the first column in each row
            const tdDay = document.createElement("td");
            tdDay.textContent = index; // Incrementing day starting from 0
            tr.appendChild(tdDay);

            // Add the rest of the row data
            row.forEach(cell => {
                const td = document.createElement("td");
                td.textContent = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        // Append the table to the div
        tableDiv.appendChild(table);

    } catch (error) {
        messageDiv.textContent = `File not found: ${filename}. Wait for it to be generated.`;
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    populateDropdowns();
    showTab("data"); // Show 'data' tab by default
});
