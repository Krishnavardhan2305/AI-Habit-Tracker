import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";

export const getHabits = async (req, res) => {
    try {
        const { includeArchived } = req.query;
        let filter = { userID: req.user._id };
        if (includeArchived !== "true") {
            filter.isArchived = false;
        }
        const habits = await Habit.find(filter).sort({ order: 1, createdAt: 1 });
        res.status(200).json(habits);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createHabit = async (req, res) => {
    try {
        const { name, description, category, frequency, targetDays, color, icon } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Habit Name is required" });
        }
        const habitCount = await Habit.countDocuments({ userID: req.user._id });
        const newHabit = new Habit({
            userID: req.user._id,
            name,
            description,
            category,
            frequency,
            targetDays,
            color,
            icon,
            order: habitCount
        });
        const savedHabit = await newHabit.save();
        res.status(201).json(savedHabit);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message
        });
    }
};
export const updateHabit = async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userID: req.user._id });
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }
        const { name, description, category, frequency, targetDays, color, icon } = req.body;
        if (name) habit.name = name;
        if (description) habit.description = description;
        if (category) habit.category = category;
        if (frequency) habit.frequency = frequency;
        if (targetDays) habit.targetDays = targetDays;
        if (color) habit.color = color;
        if (icon) habit.icon = icon;
        const updatedHabit = await habit.save();
        res.status(200).json(updatedHabit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const archiveHabit = async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userID: req.user._id });
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }
        habit.isArchived = true;
        await habit.save();
        res.status(200).json({ message: "Habit archived successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const reorderHabits = async (req, res) => {
    try {
        const { order } = req.body;
        if (!Array.isArray(order)) {
            return res.status(400).json({ message: "Invalid input" });
        }
        const habits = await Habit.find({ userID: req.user._id });
        const habitMap = {};
        habits.forEach(habit => {
            habitMap[habit._id] = habit;
        }
        );
        for (let i = 0; i < order.length; i++) {
            const habit = habitMap[order[i]];
            if (habit) {
                habit.order = i;
                await habit.save();
            }
        }
        res.status(200).json({ message: "Habits reordered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userID: req.user._id });
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }
        await HabitLog.deleteMany({ habitID: habit._id });
        await habit.remove();
        res.status(200).json({ message: "Habit deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};