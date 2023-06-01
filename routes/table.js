
// current path: /api/table
const router = require("express").Router();
const crypto = require("crypto");

const { userAuth } = require("../middleware/auth");
const PokerTable = require("../classes/pokerTable");

let pokerTables = new Map([
    ["abc", new PokerTable("abc", "Test Table")]
]);

router.get("/", userAuth, async (req, res) => {
    let pokerTablesAvailable = [];

    pokerTables.forEach((table, tableId) => {
        pokerTablesAvailable.push({
            id: tableId,
            name: table.name
        });
    });

    res.status(200).json(pokerTablesAvailable);
});

router.get("/:tableId", userAuth, async (req, res) => {

    const { tableId } = req.params;

    if (!tableId) {
        return res.status(400).json({
            success: false,
            message: "Table ID required"
        });
    }

    if (!pokerTables.has(tableId)) {
        return res.status(404).json({
            success: false,
            message: "Table not found"
        });
    }

    try {

        const table = pokerTables.get(tableId);


        res.send("Table ID: " + tableId);

    } catch (err) {
        res.status(400).json({
            message: "An error occurred",
            error: err.message,
        })
    }
});

router.post("/create", userAuth, async (req, res) => {

    const { name } = req.body;
    
    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Name required"
        });
    }
    
    const randomId = await new Promise((resolve) => {
        let genId;
        do {
            genId = crypto.randomBytes(6).toString("hex");
        } while (pokerTables.has(genId));
        resolve(genId);
    });

    
    
    const table = new PokerTable(randomId, name);
    pokerTables.set(randomId, table);

    console.log(`New poker table created {id: ${randomId}, name: ${name}}`);
    
    res.redirect("/table/" + randomId);
});

module.exports = router;