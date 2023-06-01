const tableListContainer = document.getElementById('table-list-container');
const tableList = tableListContainer.getElementById("table-list");

const createTableItem = (tableObject) => {    
    const { id: tableId, name: tableName, players: tablePlayers } = tableObject;
    if (!tableId || !tableName) return;

    const tableItem = document.createElement("div");
    tableItem.classList.add("table-item");
    tableItem.dataset.tableId = tableId;

    const tableNameElement = document.createElement("span");
    tableNameElement.innerText = tableName;
    tableItem.appendChild(tableNameElement);

    const tablePlayersElement = document.createElement("span");
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

refreshTables();