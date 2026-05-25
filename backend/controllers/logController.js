import HabitLog from "../models/HabitLog.js";
import Habit from "../models/Habit.js";
import {
    todayKey,
    last90Days,
    lastNDays,
    calcStreak
} from "../utils/dateHelpers.js";

export const markComplete = async (req, res) => {
    try {
        const { HabitId, date } = req.body;
        const completedDate = date || todayKey();
        const habit = await Habit.findOne({ _id: HabitId, userID: req.user._id });
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }
        const log = await HabitLog.findOneAndUpdate(
            { habitID: HabitId, userID: req.user._id, date: completedDate },
            { $setOnInsert: { habitID: HabitId, userID: req.user._id, date: completedDate } },
            { upsert: true, new: true }
        );
        res.status(200).json({ message: "Marked as complete", log });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const unmarkComplete = async (req, res) => {
    try {
        const { HabitId, date } = req.body;
        const completedDate = date || todayKey();
        const habit = await Habit.findOne({ _id: HabitId, userID: req.user._id });
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }
        await HabitLog.findOneAndDelete({ habitID: HabitId, userID: req.user._id, date: completedDate });
        res.status(200).json({ message: "Unmarked as complete" });
    }
    catch (error) {
        console.error(error); res.status(500).json({ message: error.message });
    }
};

export const getToday = async (req, res) => {
    try {
        const logs = await HabitLog.find({ userID: req.user._id, completedDate: todayKey() });
        res.status(200).json({ logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getRange = async (req, res) => {
    try {
        const { start, end } = req.query;
        const logs = await HabitLog.find({ userID: req.user._id, completedDate: { $gte: start, $lte: end } });
        res.status(200).json({ logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
export const getHeatmap = async (req, res) => {
    try {
        const days = last90Days();
        const logs = await HabitLog.find({
            userID: req.user._id,
            completedDate: { $gte: days[0], $lte: days[days.length - 1] }
        });
        const counts = {};
        for (const d of days) {
            counts[d] = 0;
        }
        for (const log of logs) {
            counts[log.completedDate]++;
        }
        const data = days.map(d => ({ date: d, count: counts[d] || 0 }));
        res.status(200).json({ data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


export const getHabitStats = async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.habitId, userID: req.user._id });
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }
        const logs = (await HabitLog.find({ habitID: habit._id, userID: req.user._id })).sort({ completedDate: -1 });
        const dateKeys = logs.map(l => l.completedDate);
        const { current, longest } = calcStreak(dateKeys);
        const createdKey = habit.createdAt.toISOString().slice(0, 10);
        const today = todayKey();
        const start = new Date(createdKey);
        const end = new Date(today);
        const totalDays = Math.floor((end - start) / 86400000) + 1;
        const completionRate = Math.round((logs.length / totalDays) * 100);

        const monthly = {};
        for (const log of logs) {
            const month = log.completedDate.slice(0, 7);
            monthly[month] = (monthly[month] || 0) + 1;
        }
        res.json({
            habit,
            totalCompletions: logs.length,
            currentStreak: current,
            longestStreak: longest,
            completionRate,
            monthly
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

export const getAllStats = async (req, res) => {
    try {
        const habits = await Habit.find({ userID: req.user._id, isArchived: false });
        const days = lastNDays(30);
        const logs = await HabitLog.find({ userID: req.user._id, completedDate: { $gte: days[0], $lte: days[days.length - 1] } });
        const perHabit = habits.map((habit) => {
            const habitLogs = logs.filter(l => l.habitID.toString() === habit._id.toString());
            const dateKeys = habitLogs.map(l => l.completedDate).sort().reverse();
            const { current, longest } = calcStreak(dateKeys);
            return {
                habitId: habit._id,
                name: habit.name,
                icon: habit.icon,
                color: habit.color,
                category: habit.category,
                completions30d: habitLogs.length,
                currentStreak: current,
                longestStreak: longest
            }
        }
        );
        res.json({ perHabit, days });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};