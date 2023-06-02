
const tableId = window.location.pathname.split("/")[2];
let joined = false;


fetchAPI(`/api/table/${tableId}/join`, {
    method: 'POST',
    body: JSON.stringify({ tableId, spectate: true })
}).then(({ success, message }) => {
    if (!success) {
        notify(message, "error");
        return;
    }
    
});


console.log("test", tableId);