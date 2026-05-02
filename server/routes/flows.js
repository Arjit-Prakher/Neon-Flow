const router = require('express').Router();
const Flow = require('../models/Flow');
const auth = require('../middleware/auth'); // Use our new bouncer middleware

// SAVE a new flow
router.post('/', auth, async (req, res) => {
    try {
        const { nodes, edges, messages, title } = req.body;
        const newFlow = new Flow({
            userId: req.user.id, // Taken from the JWT token
            nodes,
            edges,
            messages,
            title
        });
        const savedFlow = await newFlow.save();
        res.json(savedFlow);
    } catch (err) {
        res.status(500).json({ message: "Error saving flow" });
    }
});

// UPDATE an existing flow
router.put('/:id', auth, async (req, res) => {
    try {
        const { nodes, edges, messages, title } = req.body;

        const updatedFlow = await Flow.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { nodes, edges, messages, title },
            { new: true } // return the updated document
        );

        if (!updatedFlow) {
            return res.status(404).json({ message: "Flow not found" });
        }

        res.json(updatedFlow);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating flow" });
    }
});

// GET all flows for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const flows = await Flow.find({ userId: req.user.id }).sort({ updatedAt: -1 });
        res.json(flows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching flows" });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const flow = await Flow.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!flow) return res.status(404).json({ message: "Flow not found" });
        res.json({ message: "Flow deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
});

module.exports = router;