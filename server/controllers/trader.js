const Token = require("../models/Token");

async function getTopTraders(req, res) {
  try {
    const topTraders = await Token.aggregate([
      {
        $group: {
          _id: "$maker",
          totalBuyVol: {
            $sum: { $ifNull: ["$buyVol", 0] },
          },
          totalSellVol: {
            $sum: { $ifNull: ["$sellVol", 0] },
          },
          totalBuyItems: {
            $sum: { $ifNull: ["$buys", 0] },
          },
          totalSellItems: {
            $sum: { $ifNull: ["$sells", 0] },
          },
          totalBuyAmount: {
            $sum: {
              $multiply: [
                { $ifNull: ["$buyVol", 0] },
                { $ifNull: ["$priceUSD", 0] },
              ],
            },
          },
          totalSellAmount: {
            $sum: {
              $multiply: [
                { $ifNull: ["$sellVol", 0] },
                { $ifNull: ["$priceUSD", 0] },
              ],
            },
          },
          totalCumulativePNL: { $sum: { $ifNull: ["$cumulativePNL", 0] } },
          totalTxns: { $sum: { $ifNull: ["$txns", 0] } },
          totalBalance: { $sum: { $ifNull: ["$balance", 0] } },
          totalUnrealized: { $sum: { $ifNull: ["$cumulativeUnrealized", 0] } },
          tokenData: { $push: "$$ROOT" },
        },
      },
      { $sort: { totalCumulativePNL: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "maker",
        },
      },
      { $unwind: "$maker" },
      {
        $project: {
          _id: 0,
          makerId: "$maker._id",
          makerUsername: "$maker.username",
          makerEmail: "$maker.email",
          makerLogo: "$maker.logo",
          totalBuyVol: 1,
          totalSellVol: 1,
          totalBuyItems: 1,
          totalSellItems: 1,
          totalBuyAmount: 1,
          totalSellAmount: 1,
          totalCumulativePNL: 1,
          totalTxns: 1,
          totalBalance: 1,
          totalUnrealized: 1,
          tokenData: 1,
        },
      },
    ]);
    const formattedTopTraders = topTraders.map((trader) => {
      const formattedTrader = { ...trader };
      formattedTrader.totalBuyVol = {
        volume: trader.totalBuyVol,
        item: trader.totalBuyItems,
        amount: trader.totalBuyAmount,
      };
      formattedTrader.totalSellVol = {
        volume: trader.totalSellVol,
        item: trader.totalSellItems,
        amount: trader.totalSellAmount,
      };

      return formattedTrader;
    });

    return res.status(200).json(formattedTopTraders);
  } catch (error) {
    console.error("Error in getTopTraders API:", error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { getTopTraders };
