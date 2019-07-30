import Caver from "caver-js";
import {Spinner} from "spin.js";
const keccak256 = require('keccak256');

const config={
  rpcURL: 'https://api.baobab.klaytn.net:8651'
}
const cav = new Caver(config.rpcURL);
const mdContract = new cav.klay.Contract(DEPLOYED_ABI, DEPLOYED_ADDRESS);
const App = {

  state:{
    cnt: 0,
  },

  
  TestLogout:async function(){
    sessionStorage.removeItem('walletInstance');
    location.reload();
  },

  start: async function () {
    this.state.cnt = sessionStorage.getItem('cnt');
    const walletFromSession = sessionStorage.getItem('walletInstance');

    if(walletFromSession){
      try{
        cav.klay.accounts.wallet.add(JSON.parse(walletFromSession));
        this.changeUI(JSON.parse(walletFromSession));
      }catch(e){
        sessionStorage.removeItem('walletInstance');
      }
    }
  },

  reading: async function(num){
    this.state.cnt++;
    sessionStorage.setItem('cnt',this.state.cnt);
    var spinner = this.showSpinner();
    sessionStorage.removeItem('latestTx');
    mdContract.methods.reading(num).send({
      type:'SMART_CONTRACT_EXECUTION',
      from: JSON.parse(sessionStorage.getItem('walletInstance')).address ,
      gas: '250000',
      data: '0x11321241241212412414251'
    }).then(function(receipt){
      if(receipt.status){
        spinner.stop();
        alert(JSON.parse(sessionStorage.getItem('walletInstance')).address + "계정 "+num+"개 열람"); 
        sessionStorage.setItem('tx'+sessionStorage.getItem('cnt')%10,JSON.stringify(receipt));
        location.reload();
      }
    }).on('error',function(error){
      document.getElementById("test").textContent=error;
    })
  },

  setInit: async function(){
    document.getElementById("myAddress").style.visibility='visible';
    for(var i=0;i<=sessionStorage.getItem('cnt');i++)
        sessionStorage.removeItem('tx'+i);
    sessionStorage.setItem('cnt',0);
  },

  testing: async function(){
    return await mdContract.methods.test().call();
   },

  callOwner: async function () {
    return await mdContract.methods.owner().call();
  },

  callContractBalance: async function () {
    return await mdContract.methods.getBalance().call();
  },

  callUserCount: async function(){
    return await mdContract.methods.getCount(this.getWallet().address).call();
  },

  callLoginCount: async function(){
    return await mdContract.methods.getLoginCount(this.getWallet().address).call();
  },

  callCompnayName: async function(){
    return await mdContract.methods.getCompany(this.getWallet().address).call();
  },
  
  getWallet: function () {
    return JSON.parse(sessionStorage.getItem('walletInstance'));
  },

  TestLogin: async function (id,privateKey) {
    this.setInit();
    var spinner = this.showSpinner();
    try{
      this.integrateWallet(id,privateKey);
    }catch(e){
      document.getElementById("look_cnt").textContent= "";
      document.getElementById("login_cnt").textContent="";
     }
      mdContract.methods.login(id).send({
        type:'SMART_CONTRACT_EXECUTION',
        from: JSON.parse(sessionStorage.getItem('walletInstance')).address ,
        gas: '250000'
      }).then(function(receipt){
        if(receipt.status){
          spinner.stop();
          alert(JSON.parse(sessionStorage.getItem('walletInstance')).address + "로그인 성공");
          location.reload();       
         }
      })
  },

  integrateWallet: function (id,privateKey) {
    console.log('로그인 오류');    
    const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
    cav.klay.accounts.wallet.add(walletInstance);
    document.getElementById("test").textContent=5;
    sessionStorage.setItem('walletInstance',JSON.stringify(walletInstance));
  },

  findUsers: async function(add){
    var a = await mdContract.methods.findUsers(add).call({from: this.getWallet().address});
    a=JSON.stringify(a);
    document.getElementById("finduser").textContent= "회사명: "+JSON.parse(a).company +"  열람횟수: "+JSON.parse(a).look +"  접속횟수: "+JSON.parse(a).connect;
  },

  transactionList: async function(Tx){
    $('#TxTable > tbody:last').
    append('<tr><td>'+JSON.parse(Tx).type+'</td>'+
    '<td>'+JSON.parse(Tx).blockNumber+'</td>'+
    '<td>'+JSON.parse(Tx).from+'</td>'+
    '<td>'+JSON.parse(Tx).to+'</td>'+
    '<td>'+parseInt(JSON.parse(Tx).gas,16)+'</td>'+
    '<td>'+parseInt(JSON.parse(Tx).gasPrice,16)+'</td>'+
    '<td>'+parseInt(JSON.parse(Tx).input)+'</td>'+
    '<td>'+`<p><a href='https://baobab.scope.klaytn.com/tx/${JSON.parse(Tx).transactionHash}'
    target='_blank'>check</a></p>`+'</td>'+
    '</td></tr>');
  },

  changeUI: async function (walletInstance) {
    document.getElementById("myAddress").textContent="내 주소: "+walletInstance.address;
    document.getElementById("look_cnt").textContent= "내 열람 횟수: " +await this.callUserCount()+"회";
    document.getElementById("login_cnt").textContent= "내 접속 횟수: " +await this.callLoginCount()+"회";
    document.getElementById("company").textContent=await this.callCompnayName();
    document.getElementById("tx_cnt").textContent="TX 횟수: "+this.state.cnt;

     for(var i=this.state.cnt;i>=0;i--)
     {
        this.transactionList(sessionStorage.getItem('tx'+i));
     }
    if((await this.callOwner()).toLowerCase() === walletInstance.address){
      document.getElementById("test1").style.visibility='visible';
      document.getElementById("test2").style.visibility='visible';
      document.getElementById("myAddress").style.visibility='hidden';
      document.getElementById("look_cnt").style.visibility='hidden';
      document.getElementById("login_cnt").style.visibility='hidden';
      document.getElementById("company").style.visibility='hidden';
      document.getElementById("tx_cnt").style.visibility='hidden';
      document.getElementById("TxTable").style.visibility='hidden';
      document.getElementById("mode").textContent="관리자 모드";
    }
    else{
      document.getElementById("test1").style.visibility='hidden';
      document.getElementById("test2").style.visibility='hidden';
      document.getElementById("myAddress").style.visibility='visible';
      document.getElementById("look_cnt").style.visibility='visible';
      document.getElementById("login_cnt").style.visibility='visible';
      document.getElementById("company").style.visibility='visible';
      document.getElementById("tx_cnt").style.visibility='visible';
      document.getElementById("TxTable").style.visibility='visible';
      document.getElementById("mode").textContent="유저 모드";
    }
  },

  showSpinner: function () {
    var target = document.getElementById("spin");
    return new Spinner(opts).spin(target);
  },

};

window.App = App;

window.addEventListener("load", function () {
  App.start();
});

var opts = {
  lines: 10, // The number of lines to draw
  length: 30, // The length of each line
  width: 17, // The line thickness
  radius: 45, // The radius of the inner circle
  scale: 1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  color: '#5bc0de', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: 'spinner', // The CSS class to assign to the spinner
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  position: 'absolute' // Element positioning
};

