const ccxt = require('ccxt');
const { positionSize } = require('./config');
const config = require('./config');

require('dotenv').config();

(async () => {
    let exchange = new ccxt.binance({
        apiKey: process.env.BINANCE_API_KEY,
        secret: process.env.BINANCE_SECRET,
    });
    // console.log('Binance Required Credentials', exchange.requiredCredentials);
    let ticker = await exchange.fetchTicker(config.symbol); // SOL/USDT
    console.log(ticker); // This can be used to base the grid reference price every 24 hours.

    let buyOrders = [];
    let sellOrders = [];

    console.log(config.positionSize * config.numSellGridLines);

    let initialBuyOrder = await exchange.createMarketOrder(config.symbol, "buy", config.positionSize * config.numSellGridLines);
    console.log(initialBuyOrder);

    console.log(`Initial buy order of: ${(ticker['bid'] * config.positionSize) * config.numSellGridLines}`);
    console.log('-----------------------------------------------------------');
    for (let i = 1; i <= config.numBuyGridLines; i++) {
        let price = ticker['bid'] - (config.gridSize * i);
        console.log(`submitting market limit buy order at ${price}`);
        let order = await exchange.createLimitBuyOrder(config.symbol, config.positionSize, price);
        buyOrders.push(order);
    }
    console.log('-----------------------------------------------------------');
    for (let i = 1; i <= config.numSellGridLines; i++) {
        let price = ticker['bid'] + (config.gridSize * i);
        console.log(`submitting market limit sell order at ${price}`);
        let order = await exchange.createLimitSellOrder(config.symbol, config.positionSize, parseFloat(price * .999));
        sellOrders.push(order);
    }

    let closedOrders = [];

    while(true) {
        // concatenate 3 order lists and send as jsonified 
        // client.send(JSON.stringify({buyOrders, sellOrders, closedOrders}));

        let closedOrderIds = [];

        for (let buyOrder of buyOrders) {
            console.log(`Checking buy order ${buyOrder['id']}`);
            try {
                let order = await exchange.fetchOrder(buyOrder['id'], config.symbol);
                console.log(order);

                let orderInfo = order['info'];

                if (orderInfo['status'] === config.closedOrderStatus) {
                    closedOrders.push(orderInfo);
                    closedOrderIds.push(orderInfo['orderId']);
                    console.log(`buy order executed at ${orderInfo['price']}`);
                    let newSellPrice = parseFloat(orderInfo['price']) + config.gridSize;
                    console.log(`creating a new limit sell order at ${newSellPrice}`);
                    let newSellOrder = await exchange.createLimitSellOrder(config.symbol, config.positionSize, parseFloat(newSellPrice * 0.999));
                    sellOrders.push(newSellOrder);
                } else {
                    console.log('order not FILLED');
                }
                await new Promise(resolve => setTimeout(resolve, config.checkOrdersFrequency)); // waiting for a second or two.
            } catch(err) {
                console.error('request failed: ', err);
            }
        }

        for (let sellOrder of sellOrders) {
            console.log(`checking sell order ${sellOrder['id']}`);
            try {
                let order = await exchange.fetchOrder(sellOrder['id'], config.symbol);
                console.log(order);

                let orderInfo = order['id'];

                if (orderInfo['status'] === config.closedOrderStatus) {
                    closedOrders.push(orderInfo);
                    closedOrderIds.push(orderInfo['orderId']);
                    console.log(`sell order executed at ${orderInfo['price']}`);
                    let newBuyPrice = parseFloat(orderInfo['price']) - config.gridSize;
                    console.log(`creating a new limit buy order at ${newBuyPrice}`);
                    let newBuyOrder = await exchange.createLimitBuyOrder(config.symbol, config.positionSize, newBuyPrice);
                    buyOrders.push(newBuyOrder);
                }
                await new Promise(resolve => setTimeout(resolve, config.checkOrdersFrequency)); // waiting for a second or two.
            } catch(err) {
                console.error('request failed', err);
            }
        }

        closedOrderIds.forEach(closedOrderId => {
            buyOrders = buyOrders.filter(buyOrder => buyOrder['id' != closedOrderId]);
            sellOrders = sellOrders.filter(sellOrder => sellOrder['id'] != closedOrderId);
        });

        if (sellOrders.length === 0) {
            console.log('nothing left to sell, reset the program');
            process.exit(1);
        }
    }
}) ();