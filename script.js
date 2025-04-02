const folders = ["data", "group_1", "group_2"];
const maxDays = 60;
const mainlineBranch = `https://raw.githubusercontent.com/suddu16/ipl-fantasy/main`;

// Function to populate dropdowns for each tab
function populateDropdowns() {
    folders.forEach(folder => {
        const select = document.getElementById(`${folder}Selector`);
        if (folder === 'data') {
            for (let i = 0; i <= 60; i++) { 
                const filename = `${mainlineBranch}/ipl2025/data/mvp_day_${i}.csv`;

                const option = document.createElement("option");
                option.value = filename;
                option.textContent = `Day ${i}`;
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

        // Convert CSV text to a 2D array, filtering out empty rows
        const rows = csvText.split("\n")
            .map(row => row.split(","))
            .filter(row => row.length > 1); 

        // Clear previous table data
        tableDiv.innerHTML = "";

        // Create a table
        const table = document.createElement("table");
        table.classList.add("table", "table-striped"); // Add table styles
        table.id = `${folder}TableData`;  
        // Table header
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        if (rows.length === 0) throw new Error("Empty file or invalid format");

        // Process headers based on folder type
        if (folder === "data") {
            // MVP Data - render as-is
            rows[0].forEach(field => {
                const th = document.createElement("th");
                th.textContent = field;
                headerRow.appendChild(th);
            });
        } else if (folder === "group_1Players" || folder === "group_2Players") {
            // For player groups, use the first row as header, and reverse columns for days
            const totalDays = rows[0].length - 1;
            headerRow.appendChild(createHeaderCell("Player")); // First column remains "Player"
            for (let day = totalDays; day > 0; day--) {
                headerRow.appendChild(createHeaderCell(`Day ${day}`));
            }
        } else {
            // Other groups - Keep Player column, reverse the rest
            const totalDays = rows[0].length - 1;
            headerRow.appendChild(createHeaderCell("Player")); // First column remains "Player"
            for (let day = totalDays; day > 0; day--) {
                headerRow.appendChild(createHeaderCell(`Day ${day}`));
            }
        }

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Table body
        const tbody = document.createElement("tbody");
        var startIndex = 1
        if (folder == "group_1" || folder == "group_2") {
            startIndex = 0
        }
        rows.slice(startIndex).forEach(row => {
            const tr = document.createElement("tr");

            if (folder === "data") {
                // Render MVP data as-is
                row.forEach(cell => {
                    tr.appendChild(createCell(cell));
                });
            } else {
                // For group_1Players and group_2Players, reverse the order for days
                tr.appendChild(createCell(row[0])); // Player name first
                for (let i = row.length - 1; i > 0; i--) {
                    tr.appendChild(createCell(row[i]));
                }
            }

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        tableDiv.appendChild(table);

        // Initialize DataTable functionality
$(document).ready(function() {
    const tableId = table.id; // Get table ID

    if (tableId.includes("dataTableData")) {
        // For MVP data, disable sorting
        $(table).DataTable({
            searching: true,  
            ordering: true, 
            pageLength: 20,

            info: true,
            order: [[2, "desc"]] 
    
        });
    } else {
        // For group_1 and group_2, sort by the last column
        $(table).DataTable({
            searching: true,  
            pageLength: 20,

            ordering: true,   
            info: true,       
            order: [[1, "desc"]] 
        });
    }
});


    } catch (error) {
        messageDiv.textContent = `File not found: ${filename}. Wait for it to be generated.`;
    }
}

// Helper function to create table header cells
function createHeaderCell(text) {
    const th = document.createElement("th");
    th.textContent = text;
    return th;
}

// Helper function to create table data cells
function createCell(text) {
    const td = document.createElement("td");
    td.textContent = text || "-"; // Handle empty values
    return td;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    populateDropdowns();
    showTab("data");

    // Fix tab switching issue
    document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", (event) => {
            showTab(event.target.getAttribute("data-tab"));
        });
    });
});
