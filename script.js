const folders = ["data", "group_1", "group_2"];
const maxDays = 60;

// Function to populate dropdowns for each tab
function populateDropdowns() {
    folders.forEach(folder => {
        const select = document.getElementById(`${folder}Selector`);
        if (folder === 'data') {
            // Handle 'data' folder with mvp_day_X.csv files
            for (let i = 0; i <= 60; i++) { // Assuming you have up to 60 days worth of data
                const filename = `ipl2025/data/mvp_day_${i}.csv`;

                // Create an option for each file
                const option = document.createElement("option");
                option.value = filename;
                option.textContent = `Day ${i}`; // Display "Day X" in the dropdown
                select.appendChild(option);
            }
        } else {
            for (let day = 0; day <= maxDays; day++) {
            const option = document.createElement("option");
            option.value = `ipl2025/${folder}/ipl2025_results_day_${day}.csv`;
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
// Function to load CSV and check if it exists
async function loadCSV(folder) {
    const select = document.getElementById(`${folder}Selector`);
    const filename = select.value;
    const messageDiv = document.getElementById(`${folder}Message`);
    const tableDiv = document.getElementById(`${folder}Table`);

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
        thDay.textContent = "Day";
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
