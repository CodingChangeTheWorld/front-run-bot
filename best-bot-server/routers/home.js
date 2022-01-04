const express = require('express')
const home = express.Router();
const { getBlockNumber, getUserInfo, approve, buy, sell, startTrade, getTokenName, getDEXS } = require('../runner/core')
const { ethers, utils, BigNumber, Contract } = require("ethers");

home.post('/startTrade', (req, res) => {
    const body = req.body;
    console.log(body);
})
home.get('/', (req, res) => {
    res.send('123')
})
home.get('/getDEXS', (req, res, next) => {
    try {
        res.send(JSON.stringify(getDEXS()))
    } catch (err) {
        next(err);
    }
})
home.get('/getBlockNumber', async (req, res, next) => {
    try {
        const blockNumber = await getBlockNumber(req.query.websocket)
        res.send(blockNumber.toString());
    } catch (err) {
        next(err);
    }
    // new ethers.providers.WebSocketProvider(req.query.websocket).getBlockNumber().then(console.log).catch(r=>console.log(r))

})
home.post('/getTokenName', express.json(), async (req, res, next) => {
    try {
        const tokenName = await getTokenName(req.body)
        res.send(tokenName.toString());
    } catch (err) {
        next(err);
    }
})
home.post('/getUserInfo', express.json(), async (req, res, next) => {
    try {
        const userInfo = await getUserInfo(req.body);
        res.send(JSON.stringify(userInfo));
    } catch (err) {
        next(err);
    }
})
home.post('/approve', express.json(), async (req, res, next) => {
    try {
        const txHash = await approve(req.body)
        res.send(JSON.stringify(txHash));
    } catch (err) {
        next(err);
    }
})
home.post('/forceSell', express.json(), async (req, res, next) => {
    try {
        const txHash = await sell(req.body);
        res.send(JSON.stringify(txHash));
    } catch (err) {
        next(err)
    }
})
home.post('/buy', express.json(), async (req, res, next) => {
    try {
        const txHash = await buy(req.body);
        res.send(JSON.stringify(txHash));
    } catch (err) {
        next(err)
    }
})
home.ws('/startTrade', async (ws, next) => {
    try {
        console.log("开始连接");
        ws.send('连接成功,开始交易')
        ws.onmessage = (msg) => {
            startTrade(ws, JSON.parse(msg.data))
        }
        ws.on('close', function (e) {
            console.log('断开连接');
        })
    } catch (err) {
        next(err)
    }
})
module.exports = home;