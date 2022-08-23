module.exports = {
    symbol: 'SOL/USDT',
    positionSize: 1, // Amount = positionSize * numBuyGridLines;
    numBuyGridLines: 2,
    numSellGridLines: 2,
    gridSize: 0.5, // Profit = positionSize * gridSize
    checkOrdersFrequency: 500,
    closedOrderStatus: 'FILLED',
}