const { ethers, utils, BigNumber, Contract } = require("ethers");
const { erc20, factory, router, pair } = require('./abi');
const formatUnits = utils.formatUnits;
const parseUnits = utils.parseUnits;
const obj = require('./main_config.json')
const solidityKeccak256 = utils.solidityKeccak256;
const getCreate2Address = utils.getCreate2Address;


let deadline = parseInt(Date.now() / 1000) + 24 * 60 * 60;
function getDEXS() {
    let chainAndExchanges=[];
   for (let key of Object.keys(obj)) {
       let chainAndExchange = {};
       chainAndExchange.value = key;
       chainAndExchange.label = key;
       chainAndExchange.children = [];
       for (let key1 of Object.keys(obj[key]["exchanges"])) {
           chainAndExchange.children.push({ value: key1, label: key1 });
       }
       chainAndExchanges.push(chainAndExchange);
   }
   return chainAndExchanges;
}

async function getBlockNumber(websocket){
    const provider = new ethers.providers.WebSocketProvider(websocket);
    return await provider.getBlockNumber();      

}

async function getUserInfo(data){
    const provider = new ethers.providers.WebSocketProvider(data.websocket);
    const wallet = new ethers.Wallet(data.privateKey, provider);
    const balance=await wallet.getBalance();
    return {
        userAddress:wallet.address,
        userBalance:formatUnits(balance)
    }
}
async function approve(data){
    const chain = obj[data.chain];
    const exchangeInfo = chain['exchanges'][data.dex];
    const routerAddress = exchangeInfo['routerAddress'];
    const provider = new ethers.providers.WebSocketProvider(data.websocket);
    const wallet = new ethers.Wallet(data.privateKey, provider);
    const tokenInstance = new Contract(data.tokenTobuy, erc20, wallet);
    const maxNumber = BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    const approveTx = await tokenInstance.approve(routerAddress, maxNumber,{gasPrice:parseUnits('5',9),gasLimit:3000000});
    return {txHash:approveTx.hash};
}
async function sell(data){
    const chain = obj[data.chain];
    const mainToken = chain['token'];
    const exchangeInfo = chain['exchanges'][data.dex];
    const routerAddress = exchangeInfo['routerAddress'];
    const provider = new ethers.providers.WebSocketProvider(data.websocket);
    const wallet = new ethers.Wallet(data.privateKey, provider);
    const signer = wallet.address;
    const routerInstance = new Contract(routerAddress, router, wallet);
    const balance = await getTokenBalance(data.tokenTobuy,wallet,signer);
    const sellTx = await routerInstance.swapExactTokensForETHSupportingFeeOnTransferTokens(balance, 0, [data.tokenTobuy, mainToken], signer, deadline, { gasPrice: parseUnits(data.gasPrice, 9), gasLimit: 3000000 });
    return {txHash:sellTx.hash};
}

async function getTokenBalance(token,wallet,signer) {
    let tokenInstance = new Contract(token, erc20, wallet);
    let balacne = await tokenInstance.balanceOf(signer);
    return balacne;
}
async function getTokenName(data){
    const provider = new ethers.providers.WebSocketProvider(data.websocket);
    const wallet = new ethers.Wallet(data.privateKey, provider);
    let tokenInstance = new Contract(data.tokenTobuy, erc20, wallet);
    return await tokenInstance.name();
}
function getPairAddress(factoryAddress,pairCodeHash,token0, token1) {
    const [sortedToken0, sortedToken1] = token0 < token1 ? [token0, token1] : [token1, token0];
    const salt = solidityKeccak256(["address", "address"], [sortedToken0, sortedToken1]);
    return getCreate2Address(factoryAddress, salt, pairCodeHash);
}

async function buy(data){
    const chain = obj[data.chain];
    const mainToken = chain['token'];
    const exchangeInfo = chain['exchanges'][data.dex];
    const routerAddress = exchangeInfo['routerAddress'];
    const provider = new ethers.providers.WebSocketProvider(data.websocket);
    const wallet = new ethers.Wallet(data.privateKey, provider);
    const signer = wallet.address;
    const routerInstance = new Contract(routerAddress, router, wallet);
    const buyTx = await routerInstance.swapExactETHForTokensSupportingFeeOnTransferTokens(0, [mainToken, data.tokenTobuy], signer, deadline, { gasPrice: parseUnits(data.gasPrice,9), gasLimit: 3000000, value: parseUnits(data.amountToBuy, 18) });
    return {txHash:buyTx.hash};
}
async function getAmountsOut(routerInstance,amountIn, token0, token1) {
    return await routerInstance.getAmountsOut(amountIn, [token0, token1]);
}
async function startTrade(ws,data){
    const chain = obj[data.chain];
    const mainToken = chain['token'];
    const exchangeInfo = chain['exchanges'][data.dex];
    const factoryAddress = exchangeInfo['factoryAddress']
    const routerAddress = exchangeInfo['routerAddress'];
    const pairCodeHash = exchangeInfo['pairCodeHash'];
    const provider = new ethers.providers.WebSocketProvider(data.websocket);
    const wallet = new ethers.Wallet(data.privateKey, provider);
    const signer = wallet.address;
    const routerInstance = new Contract(routerAddress, router, wallet);
    ws.send("已成功建立链接")
    provider.on("pending", async txHash => {
        const tx = await provider.getTransaction(txHash)
        ws.send(`监听pendingPool的TxHash=====================>  ${txHash}`);
        if (tx != null) {
            const rawData = tx.data;
            const methodId = rawData.slice(0, 10);
            const etherValue = formatUnits(tx.value);
            const gasPrice = tx.gasPrice;
            const showGasPrice = formatUnits(gasPrice, 9);
            const callContractAddress = tx.to;
            if (methodId == '0xf305d719') {
                const token = '0x' + rawData.slice(34, 74);
                if (token.toUpperCase() == data.tokenTobuy.toUpperCase()) {
                    ws.send(`已找到LP添加hash: ${txHash}`);
                    const to = '0x' + rawData.slice(290, 330);
                    const pairAddress = getPairAddress(factoryAddress,pairCodeHash,mainToken, data.tokenTobuy);
                    const addLPInfo={
                        token,
                        etherValue,
                        gasPrice:showGasPrice,
                        to,
                        pairAddress
                    }
                    ws.send(JSON.stringify(addLPInfo))
                    if (tx.value.gte(parseUnits(data.liquidityMinValue, 18))) {
                        for (i = 0; i < data.tradeNum; i++) {
                            const swapTx = await routerInstance.swapExactETHForTokensSupportingFeeOnTransferTokens(0, [mainToken, data.tokenTobuy], signer, deadline, { gasPrice: gasPrice, gasLimit: 3000000, value: parseUnits(data.amountToBuy, 18) });
                            ws.send(`交易hash ${swapTx.hash}`)
                        }
                    }
                    else {
                        ws.send(`交易池大小不足`)
                    }
                }
            }
            else if (['0x02751cec', '0xded9382a', '0xaf2979eb', '0x5b0d5984'].indexOf(methodId) != -1) {
                const token = '0x' + rawData.slice(34, 74);
                if (token.toUpperCase() == data.tokenTobuy.toUpperCase()) {
                    ws.send(`项目方撤池子了,快跑路！！！！！！！！ 其hash为========》 ${txHash}`)
                    const balance = await getTokenBalance(data.tokenTobuy,wallet,signer);
                    const swapTx = await routerInstance.swapExactTokensForETHSupportingFeeOnTransferTokens(balance, 0, [data.tokenTobuy, mainToken], signer, deadline, { gasPrice: gasPrice.add(parseUnits('20', 9)), gasLimit: 3000000 });
                    ws.send(`跑路成功 ${swapTx.hash}`);
                }
            } else if (['0xe27ad5eb', '0xc49b9a80','0xe01af92c'].indexOf(methodId) != -1 && callContractAddress.toUpperCase() == data.tokenTobuy.toUpperCase()) {
                const enabled = rawData.slice(73, 74);
                if (enabled == '0') {
                    ws.send(`项目方撤池子了,快跑路！！！！！！！！ 其hash为========》 ${txHash}`)
                    const balance = await getTokenBalance(data.tokenTobuy,wallet,signer);
                    const swapTx = await routerInstance.swapExactTokensForETHSupportingFeeOnTransferTokens(balance, 0, [data.tokenTobuy, mainToken], signer, deadline, { gasPrice: gasPrice.add(parseUnits('20', 9)), gasLimit: 3000000 });
                    ws.send(`跑路成功 ${swapTx.hash}`);
                }
            }
        }  
    })
    setInterval(async() => {
        try{
        const balance=await getTokenBalance(data.tokenTobuy,wallet,signer);
        const amountsOut=await getAmountsOut(routerInstance,balance,data.tokenTobuy,mainToken)
        const earn=formatUnits(amountsOut[1])-data.amountToBuy*data.tradeNum;
        ws.send(`盈利金额为===============》 ${earn}`)
        }catch(err){
        ws.send(`盈利金额为===============》 0`)
        }
    }, 100);
    ws.on('close',e=>{
        console.log("链接已关闭");
    })
}
module.exports={getBlockNumber,getUserInfo,approve,buy,sell,startTrade,getTokenName,getDEXS}