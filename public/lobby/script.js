const tableListContainer = document.getElementById('table-list-container');
const tableList = document.getElementById("table-list");

const createTableInput = document.getElementById("create-table-name");

const createTableItem = (tableObject) => {    
    const { id: tableId, name: tableName, players: tablePlayers } = tableObject;
    if (!tableId || !tableName) return;

    const tableItem = document.createElement("div");
    tableItem.classList.add("table-item");
    tableItem.dataset.tableId = tableId;

    const tableNameElement = document.createElement("div");
    tableNameElement.innerText = tableName;
    tableItem.appendChild(tableNameElement);

    const tablePlayersElement = document.createElement("div");
    tablePlayersElement.innerText = `Jucatori: ${tablePlayers || 0} / 6`;
    tableItem.appendChild(tablePlayersElement);

    const tableJoinButton = document.createElement("input");
    tableJoinButton.type = "button";
    tableJoinButton.value = "Join";
    tableJoinButton.addEventListener("click", () => joinTable(tableId));
    tableItem.appendChild(tableJoinButton);

    return tableItem;
}

const refreshTables = async () => {
    tableListContainer.classList.add("loading");

    tableList.innerHTML = "";
    
    const tablesArray = await fetchAPI("/api/table", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (tablesArray.length === 0) {
        const noTablesMessage = document.createElement("p");
        noTablesMessage.innerText = "Nu exista mese disponibile";
        tableList.appendChild(noTablesMessage);
    }

    tablesArray.forEach(tableObject => {
        const tableItem = createTableItem(tableObject);
        tableList.appendChild(tableItem);
    });

    tableListContainer.classList.remove("loading");
}

const joinTable = (tableId) => {
    window.location.href = `/table/${tableId}`;
}

const tryCreateTable = async () => {
    const tableName = createTableInput.value;
    if (!tableName) return;

    const { success, message } = await fetchAPI("/api/table/create", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: tableName })
    });

    if (!success) {
        notify(message, "error");
        return;
    };
    window.location.href = message;
}

refreshTables();