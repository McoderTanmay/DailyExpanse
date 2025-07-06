import Finance from "../models/financeModel.js";

export const getFinanceData = async (req, res) => {
  const { category } = req.query;
  try {
    const filter = category ? { category } : {};
    const financeData = await Finance.find(filter).sort({ date: -1 });
    res.status(200).json({ success: true, data: financeData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addFinanceData = async (req, res) => {
  const { date, amount, category, description, type } = req.body;
  const newFinanceData = new Finance({ date, amount, category, description,type });

  try {
    await newFinanceData.save();
    res.status(201).json({success:true ,data:newFinanceData});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateFinanceData = async (req, res) => {
  const { id } = req.params;
  const { date, amount, category, description, type } = req.body;

  try {
    const updatedFinanceData = await Finance.findByIdAndUpdate(
      id,
      { date, amount, category, description, type },
      { new: true }
    );

    if (!updatedFinanceData) {
      return res.status(404).json({ message: "Finance data not found" });
    }

    res.status(200).json(updatedFinanceData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFinanceData = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFinanceData = await Finance.findByIdAndDelete(id);

    if (!deletedFinanceData) {
      return res.status(404).json({ message: "Finance data not found" });
    }

    res.status(200).json({success: true});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyFinanceData = async (req, res) => {
  try {
    const financeData = await Finance.aggregate([
      {
        $group: {
          _id: { $month: "$date" },
          totalAmount: { $sum: "$amount" },
          categories: { $push: "$category" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({success:true, data:financeData});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get current month transactions
    const currentMonthTransactions = await Finance.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Calculate totals
    const totalExpenses = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);


    // Category breakdown
    const categoryMap = new Map();
    const categoryColors = {
      Food: "#3b82f6",
      Transport: "#10b981",
      Entertainment: "#ef4444",
      Utilities: "#8b5cf6",
      Other: "#06b6d4",
    };

    currentMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + Math.abs(t.amount));
      });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || "#6b7280",
    }));

    // Monthly expenses for last 6 months
    const monthlyExpenses = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthTransactions = await Finance.find({
        date: { $gte: monthStart, $lte: monthEnd },
        type: "expense",
      });

      const monthTotal = monthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      monthlyExpenses.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        amount: monthTotal,
      });
    }


    const stats = {
      totalExpenses,
      totalIncome,
      categoryBreakdown,
      monthlyExpenses,
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch dashboard stats" });
  }
};
