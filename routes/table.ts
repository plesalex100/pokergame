
// current path: /api/table
import { Router, Request, Response } from "express";
const router = Router();

import { randomBytes } from "crypto";
import { userAuth, RequestWithUser } from "../middleware/auth";
import PokerTable from "../classes/pokerTable";

let pokerTables = new Map<string, PokerTable>([
    ["abc", new PokerTable("abc", "Test Table")]
]);

interface clientPokerTable {
    id: string,
    name: string,
    players: number
}

router.get("/", userAuth, async (_req: RequestWithUser, res: Response) => {
    let pokerTablesAvailable: clientPokerTable[] = [];

    pokerTables.forEach((table, tableId) => {
        pokerTablesAvailable.push({
            id: tableId,
            name: table.name,
            players: table.getTotalPlayers()
        });
    });

    res.status(200).json(pokerTablesAvailable);
});

router.get("/:tableId", userAuth, async (req: RequestWithUser, res: Response) => {

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

    } catch (err: any) {
        res.status(400).json({
            message: "An error occurred",
            error: err.message,
        })
    }
});

router.post("/create", userAuth, async (req: RequestWithUser, res: Response) => {

    const { name } = req.body;
    
    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Introdu un nume pentru masa de poker"
        });
    }

    const randomId: string = await new Promise((resolve) => {
        let genId;
        do {
            genId = randomBytes(6).toString("hex");
        } while (pokerTables.has(genId));
        resolve(genId);
    });

    
    const table = new PokerTable(randomId, name);
    pokerTables.set(randomId, table);

    console.log(`New poker table created {id: ${randomId}, name: ${name}}`);
    
    res.status(200).json({
        success: true,
        message: `/table/${table.id}`
    })
});

export default router;