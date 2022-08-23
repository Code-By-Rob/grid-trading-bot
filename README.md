# Gird Trading Bot

This is a simple grid trading bot written in JavaScript using Node.js as a runtime environment. 

The main code for the project can be found in **client.js**.

The application uses **config.js** to set variables such as the cryptocurrency pairing, known as the symbol. You can set the variable which sends to the Binance server the number of buy and sell order limits. You can set the position size which is the amount of the asset you will buy e.g., 1 ETH. The grid size variable allows a user to set the spatial difference between the buy and sell order limits e.g., 5 dollar movements. The check order frequency variable sets a limit on how quickly the application checks on the buy and sell orders, it is currently set to 500ms. After a buy or sell order is filled the application will set another order.