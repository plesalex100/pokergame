const tableListContainer = document.getElementById('table-list-container');
const tableList = tableListContainer.getElementById("table-list");

const refreshTables = () => {
    tableListContainer.classList.add("loading");

}
refreshTables();