const Token = require("../models/Token");
const User = require("../models/User");
const { getIo } = require("../socket");

async function createToken(req, res) {
  try {
    const tokenData = { ...req.body, maker: req.user._id };

    const token = new Token(tokenData);
    await token.save();

    const io = getIo();
    io.emit("token", token);

    return res.status(201).json(token);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getAllTokens(req, res) {
  try {
    const tokens = await Token.find().sort({ createdAt: -1 });

    const totalPortfolioValue = tokens.reduce(
      (sum, token) => sum + token.priceUSD * token.liquidity,
      0
    );

    const enrichedTokens = tokens.map((token) => {
      const currentValueUSD = token.priceUSD * token.liquidity;
      const currentValueSOL = token.priceSOL * token.liquidity;
      const profit = token.cumulativePNL;
      const profitPercentage =
        token.cumulativePNL + token.cumulativeUnrealized > 0
          ? (
              (profit / (token.cumulativePNL + token.cumulativeUnrealized)) *
              100
            ).toFixed(2)
          : 0;
      const percentageOfTotal =
        totalPortfolioValue > 0
          ? ((currentValueUSD / totalPortfolioValue) * 100).toFixed(2)
          : 0;

      return {
        ...token.toObject(),
        currentValueUSD,
        currentValueSOL,
        percentageOfTotal,
        profit,
        profitPercentage,
      };
    });

    return res.status(200).json(enrichedTokens);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getTokenById(req, res) {
  try {
    const token = await Token.findOne({ pairAddress: req.params.pairAddress });
    if (!token) {
      return res.status(404).json({ error: "Token not found" });
    }

    const user = await User.findById(token.maker);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const totalTokens = await Token.countDocuments({ maker: token.maker });
    const tokenObject = token.toObject();
    tokenObject.ownerToken = totalTokens;

    return res.status(200).json(tokenObject);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function updateToken(req, res) {
  try {
    const token = await Token.findOne({ pairAddress: req.params.pairAddress });
    if (!token) {
      return res.status(404).json({ error: "Token not found" });
    }

    if (
      token.maker.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this token" });
    }

    const updatedToken = await Token.findOneAndUpdate(
      { pairAddress: req.params.pairAddress },
      req.body,
      { new: true }
    );
    const user = await User.findById(token.maker);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const totalTokens = await Token.countDocuments({ maker: token.maker });
    const tokenObject = updatedToken.toObject();
    tokenObject.ownerToken = totalTokens;
    const io = getIo();
    io.emit("token", tokenObject);

    return res.status(200).json(tokenObject);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function deleteToken(req, res) {
  try {
    const token = await Token.findOneAndDelete({
      pairAddress: req.params.pairAddress,
    });
    if (!token) {
      return res.status(404).json({ error: "Token not found" });
    }

    const io = getIo();
    io.emit("delete-token", token);

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createToken,
  getAllTokens,
  getTokenById,
  updateToken,
  deleteToken,
};
