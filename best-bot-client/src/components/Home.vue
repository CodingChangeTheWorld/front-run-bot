<template>
  <el-container class="home_container">
    <el-header>
      <span style="color: black; text-align: center"
        ><strong
          ><i>
            声明:本软件尽可能提高用户盈利可能性，但不保证百分百获利，用户应自行合理评估投资风险。
            <el-link
              href="https://t.me/CoinRisker"
              type="primary"
              target="_blank"
              style="font-size: 100%"
              >官方Telegram链接</el-link
            ></i
          ></strong
        ></span
      >
    </el-header>
    <el-container>
      <el-main>
        <div class="main_box">
          <h1>CoinRisker抢币机器人1.0</h1>
          <el-form
            ref="form"
            label-width="80px"
            :label-position="labelPosition"
          >
            <el-row>
              <el-form-item style="width: 100%">
                <div class="textBox">
                  <span style="margin-right: 20px">平台选择</span>
                </div>
                <el-cascader
                  v-model="platform.selectedChainAndExchange"
                  :options="platform.chainAndExchanges"
                  :props="platform.props"
                  @focus="getDEXS"
                  style="width: 100%"
                ></el-cascader>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item style="width: 100%">
                <div class="textBox">
                  <span>WSS节点地址</span>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="默认是公共节点,用户可以填写私有节点"
                    placement="top"
                  >
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
                <el-input v-model="mainRpc"></el-input>
                <el-button
                  class="key_btn"
                  type="success"
                  @click="getBlockNumber"
                  >节点校验</el-button
                >
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item style="width: 100%">
                <div class="textBox">
                  <span>私钥</span>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="客户端本地运行,私钥不进行保存,用户可放心使用"
                    placement="top"
                  >
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
                <el-input type="text" v-model="privateKey"></el-input>
                <el-button class="key_btn" type="success" @click="getUserInfo"
                  >私钥校验</el-button
                >
              </el-form-item>
            </el-row>
            <el-row
              style="display: flex; justify-content: space-between"
              v-if="userInfo === true"
            >
              <el-form-item style="width: 60%">
                <div class="textBox">
                  <span>账户地址</span>
                </div>
                <el-input v-model="userAddress"></el-input>
              </el-form-item>
              <el-form-item style="width: 20%">
                <div class="textBox">
                  <span>账户余额</span>
                </div>
                <el-input v-model="userBalance"></el-input>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item style="width: 100%">
                <div class="textBox">
                  <span>购买token地址</span>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="用USDT购买BTC,填写USDT的tokenTobuy地址.如果是平台币,则无需填写.如BNB,HT,ETH等.校验功能可以辅助检测代币名称"
                    placement="top"
                  >
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
                <el-input v-model="tokenTobuy"></el-input>
                <el-button
                  type="success"
                  class="approve_btn"
                  @click="approveToken"
                >
                  提前授权
                </el-button>
                <el-button type="success" class="key_btn" @click="getTokenName">
                  token校验
                </el-button>
              </el-form-item>
            </el-row>
            <el-row style="display: flex; justify-content: space-between">
              <el-form-item style="width: 20%">
                <div class="textBox">
                  <span>购买数量</span>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="用BNB兑换USDT,对应BNB的数量"
                    placement="top"
                  >
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
                <el-input v-model="amountToBuy"></el-input>
              </el-form-item>
              <el-form-item style="width: 20%">
                <div class="textBox">
                  <span>buyGasPrice</span>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="gasPrice"
                    placement="top"
                  >
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
                <el-input v-model="buyGasPrice"></el-input>
              </el-form-item>
              <el-form-item style="width: 20%">
                <div class="textBox">
                  <span>sellGasPrice</span>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="gasPrice"
                    placement="top"
                  >
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
                <el-input v-model="sellGasPrice"></el-input>
              </el-form-item>
            </el-row>
            <el-row style="display: flex; justify-content: space-between">
              <el-form-item style="width: 30%">
                <div class="textBox">
                  <span>交易流动池的最小值</span>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="用BNB交换USDT,池子里面BNB的数量要大于最小值，才能触发交易。0表示不进行限制"
                    placement="top"
                  >
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
                <el-input v-model="liquidityMinValue"></el-input>
              </el-form-item>
             <el-form-item style="width: 30%">
                <div class="textBox">
                  <span>交易次数</span>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="交易次数"
                    placement="top"
                  >
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
                <el-input v-model="tradeNum"></el-input>
             </el-form-item>
            </el-row>
            <el-row style="display: flex; justify-content: space-between">
              <el-form-item style="width: 30%">
                <div class="textBox">
                  <span>自动交易</span>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="开启自动交易后,根据策略自动进行售卖.固定时间间隔和预测盈利只会有一个生效,默认固定时间间隔进行生效,要开启预测盈利,则固定时间间隔不填写"
                    placement="top"
                  >
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
                <el-switch
                  v-model="autoTrade"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                >
                </el-switch>
              </el-form-item>
              <el-form-item style="width: 30%">
                <div class="textBox">
                  <span>固定间隔时间售卖</span>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="以BNB兑换BTC为例,在BNB买进BTC后,在指定时间间隔后将BTC进行售卖,默认30s;"
                    placement="top"
                  >
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
                <el-input v-model="fixDelay" :disabled="!autoTrade"></el-input>
              </el-form-item>
              <el-form-item style="width: 30%">
                <div class="textBox">
                  <span>达到预测盈利数量售卖</span>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="以BNB兑换BTC为例,买进BTC后,预测BTC卖出兑换的BNB数量比初始投资的BNB数量多盈利多少"
                    placement="top"
                  >
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
                <el-input
                  v-model="gainAmount"
                  :disabled="!autoTrade"
                ></el-input>
              </el-form-item>
            </el-row>
            <el-row
              style="margin-top: 40px; display: flex; justify-content: center"
            >
              <el-form-item>
                <el-button
                  type="danger"
                  style="font-size: 150%"
                  round
                  @click="startTrade"
                  :loading="isRun"
                  >开始交易</el-button
                >
                <el-button
                  type="danger"
                  style="font-size: 150%"
                  round
                  @click="stop"
                  >停止交易</el-button
                >
                <el-button
                  type="danger"
                  style="font-size: 150%"
                  round
                  @click="buy"
                  :loading="isBuy"
                  >直接购买</el-button
                >
                <el-button
                  type="danger"
                  style="font-size: 150%"
                  round
                  @click="forceSell"
                  :loading="isSell"
                  >强行卖出</el-button
                >
              </el-form-item>
            </el-row>
          </el-form>

          <el-row
            style="margin-top: 20px; display: flex; justify-content: center"
          >
            <div class="memoryPollText"></div>
            <div class="earn"></div>
            <div class="text">祝老板帅气逼人,多发大财<br /></div>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import axios from "axios";
import { ElMessage } from "element-plus";
axios.defaults.baseURL = "http://localhost:3000/home";
function dateFormat(fmt, date) {
  let ret;
  const opt = {
    "y+": date.getFullYear().toString(),
    "M+": (date.getMonth() + 1).toString(),
    "d+": date.getDate().toString(),
    "H+": date.getHours().toString(),
    "m+": date.getMinutes().toString(),
    "s+": date.getSeconds().toString(),
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
      );
    }
  }
  return fmt;
}
function printEarn(msg){
    const date = new Date();
  const out = document.querySelector(".earn");
  out.innerHTML = msg;
}
function printListenHash(msg) {
  const date = new Date();
  const out = document.querySelector(".memoryPollText");
  out.innerHTML = msg;
}
function printInfo(msg) {
  const date = new Date();
  const out = document.querySelector(".text");
  out.innerHTML += `${dateFormat("yyyy-MM-dd HH:mm:ss", date)} ${msg}<br/>`;
  out.scrollTop = out.scrollHeight;
}
var ws;
const obj = {
  data() {
    return {
      labelPosition: "top",
      platform: {
        props: { expandTrigger: "hover" },
        selectedChainAndExchange: ["bsc"],
        chainAndExchanges: [],
      },
      mainRpc:
        "wss://bsc.getblock.io/mainnet/?api_key=59781869-08f6-4efd-84ff-404e335c2870",
      privateKey:
        "f4247283ff23af55660612b04ee2e732a7b4d328ced623d4b2f45b97617e26bf",
      buyGasPrice: "5",
      sellGasPrice: "10",
      amountToBuy: "0.1",
      liquidityMinValue: "2",
      tradeNum:"2",
      tokenTobuy: "",
      isRun: false,
      isBuy: false,
      isSell: false,
      userInfo: false,
      userAddress: "",
      userBalance: "",
    };
  },

  methods: {
    async getDEXS() {
      const res = await axios.get("/getDEXS");
      if (res.status == 200) {
        this.platform.chainAndExchanges = res.data;
      }
    },
    async getBlockNumber() {
      const res = await axios.get(`/getBlockNumber?websocket=${this.mainRpc}`);
      if (res.status == 200) {
        ElMessage.success(`当前最新区块号为 ${res.data}`);
      } else {
        ElMessage.error("rpc有误");
      }
    },
    async getUserInfo() {
      const res = await axios.post("/getUserInfo", {
        websocket: this.mainRpc,
        privateKey: this.privateKey,
      });
      if (res.status == 200) {
        this.userAddress = res.data.userAddress;
        this.userBalance = res.data.userBalance;
        this.userInfo = true;
      } else {
        ElMessage.error("私钥有误");
      }
    },
    async approveToken() {
      printInfo(
        "开始授权 加油  今天一定能赚钱   fighting~~~~~~~~~~~~~~~~~~~~~~~~~"
      );
      const res = await axios.post("/approve", {
        websocket: this.mainRpc,
        privateKey: this.privateKey,
        chain: this.platform.selectedChainAndExchange[0],
        dex: this.platform.selectedChainAndExchange[1],
        tokenTobuy: this.tokenTobuy,
      });
      if (res.status == 200) {
        printInfo(`授权成功,hash地址为 ============> ${res.data.txHash}`);
      }
    },
    async getTokenName() {
      const res = await axios.post("/getTokenName", {
        websocket: this.mainRpc,
        privateKey: this.privateKey,
        tokenTobuy: this.tokenTobuy,
      });
      if (res.status == 200) {
        ElMessage.success(`token名称为 ${res.data}`);
      } else {
        ElMessage.error("token有误");
      }
    },
    async buy() {
      printInfo("购买中...............");
      this.isBuy = true;
      const res = await axios.post("/buy", {
        websocket: this.mainRpc,
        privateKey: this.privateKey,
        tokenTobuy: this.tokenTobuy,
        chain: this.platform.selectedChainAndExchange[0],
        dex: this.platform.selectedChainAndExchange[1],
        gasPrice: this.buyGasPrice,
        amountToBuy: this.amountToBuy,
      });
      if (res.status == 200) {
        printInfo(`交易成功,hash地址为 ============> ${res.data.txHash}`);
      }
      this.isBuy = false;
    },
    async forceSell() {
      printInfo("强制售出...........");
      this.isSell = true;
      const res = await axios.post("/forceSell", {
        websocket: this.mainRpc,
        privateKey: this.privateKey,
        tokenTobuy: this.tokenTobuy,
        chain: this.platform.selectedChainAndExchange[0],
        dex: this.platform.selectedChainAndExchange[1],
        gasPrice: this.sellGasPrice,
      });
      if (res.status == 200) {
        printInfo(`交易成功,hash地址为 ============> ${res.data.txHash}`);
      }
      this.isSell = false;
    },
    startTrade() {
      this.isRun = true;
      ws = new WebSocket("ws://localhost:3000/home/startTrade");
      const params = {
        websocket: this.mainRpc,
        privateKey: this.privateKey,
        tokenTobuy: this.tokenTobuy,
        chain: this.platform.selectedChainAndExchange[0],
        dex: this.platform.selectedChainAndExchange[1],
        gasPrice: this.buyGasPrice,
        amountToBuy: this.amountToBuy,
        liquidityMinValue: this.liquidityMinValue,
        tradeNum:this.tradeNum
      };
      ws.onopen = function () {
        ws.send(JSON.stringify(params));
      };
      ws.onmessage = (m) => {
        const data = m.data;
        if (data.startsWith("监听")) {
          printListenHash(data);
        }else if(data.startsWith("盈利")){
          printEarn(data);
        }
         else {
          printInfo(data);
        }
      };
    },
    stop() {
      this.isRun = false;
      ws.close();
      ws = null;
      printInfo("关闭链接..............");
    },

    // getUrl(hash) {
    //   const chain = this.platform.selectedChainAndExchange[0];
    //   let urlPrefix;
    //   if (chain == "bsc") {
    //     urlPrefix = "https://www.bscscan.com/tx/";
    //   } else if (chain == "eth") {
    //     urlPrefix = "https://etherscan.io/tx/";
    //   } else if (chain == "matic") {
    //     urlPrefix = "https://polygonscan.com/tx/";
    //   } else if (chain == "ht") {
    //     urlPrefix = "https://hecoinfo.com/tx/";
    //   }
    //   const txScan = "";
    //   return `<a href="${urlPrefix}${hash}" target="_blank"  style="font-size:120%;color:yellow">恭喜老板~~点击这里可以查看详细交易信息~</a>`;
    // },
  },
};

export default obj;
</script>
<style lang="less" scoped>
.el-header {
  border-radius: 10px;
  height: 50px;
  box-shadow: 5px 5px 10px black;
  text-align: center;
  line-height: 60px;
  font-size: 120%;
  margin-bottom: 10px;
}
.home_container {
  height: 100%;
}
.el-main {
  background-color: black;
}
.main_box {
  height: 100%;
  margin: 0 auto;
  width: 60%;
  h1 {
    font-size: 40px;
    text-align: center;
    margin-top: 10px;
    margin-bottom: 30px;
    color: sandybrown;
  }
}
.textBox {
  font-size: 20px;
  margin: 14px 0 8px 0;
  line-height: 24px;
  color: white;
}
/deep/ .el-input__inner {
  background: rgba(43, 44, 63, 0.9);
  color: #fff;
  border: 1px solid black;
  font-size: 120%;
}
/deep/ .el-form-item {
  margin-bottom: 0;
}
.key_btn {
  position: absolute;
  height: 40px;
  right: 0px;
  width: 120px;
  font-size: 120%;
  border-radius: 5px;
  // background-color: yellowgreen;
  color: black;
}
.approve_btn {
  position: absolute;
  height: 40px;
  right: 125px;
  width: 120px;
  font-size: 120%;
  border-radius: 5px;
  // background-color: yellowgreen;
  color: black;
}
.earn {
  color: white;
  background-color: rgba(43, 44, 63, 0.9);
  font-size: 80%;
  width: 100%;
  height: 25px;
  border: 1px solid white;
  padding: 10px;
}
.memoryPollText {
  color: white;
  background-color: rgba(43, 44, 63, 0.9);
  font-size: 80%;
  width: 100%;
  height: 25px;
  border: 1px solid white;
  padding: 10px;
}
.text {
  color: white;
  background-color: rgba(43, 44, 63, 0.9);
  font-size: 80%;
  width: 100%;
  height: 400px;
  overflow: hidden auto;
  border: 1px solid white;
  padding: 10px;
  word-wrap: break-word;
}
</style>
