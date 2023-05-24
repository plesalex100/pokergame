const router = require("express").Router();

const { userAuth } = require("../middleware/auth");

router.get("/", userAuth, async (req, res) => {
    res.redirect("/table/1");
});

router.get("/:tableId", userAuth, async (req, res) => {

    const { tableId } = req.params;

    if (!tableId) {
        return res.status(400).json({ message: "Table ID required" });
    }

    try {

        res.send("Table ID: " + tableId);

    } catch (err) {
        res.status(400).json({
            message: "An error occurred",
            error: err.message,
        })
    }
});

module.exports = router;