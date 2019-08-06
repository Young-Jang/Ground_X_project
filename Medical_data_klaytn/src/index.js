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

  txInfo:{
    tag: "",
    file: "",
    cnt: 0,
  },

  UserReset: async function(){
    this.setInit();
    location.reload();
  },

  TestLogout: async function(){
    sessionStorage.removeItem('walletInstance');
    location.reload();
  },

  start: async function () {
    const walletFromSession = sessionStorage.getItem('walletInstance');
    this.state.cnt = sessionStorage.getItem(await this.callCompnayName()+'cnt');
  if(walletFromSession){
      try{
        cav.klay.accounts.wallet.add(JSON.parse(walletFromSession));
        this.changeUI(JSON.parse(walletFromSession));
      }catch(e){
        sessionStorage.removeItem('walletInstance');
      }
    }
  },

  Download: async function(num){
    this.state.cnt++;
    sessionStorage.setItem(await this.callCompnayName()+'cnt',this.state.cnt);
    var spinner = this.showSpinner();
    //file수정
    mdContract.methods.Download(num,"patient").send({
      type:'SMART_CONTRACT_EXECUTION',
      from: JSON.parse(sessionStorage.getItem('walletInstance')).address ,
      gas: '250000',
    }).then(async function(receipt){
      if(receipt.status){
        spinner.stop();
        alert(JSON.parse(sessionStorage.getItem('walletInstance')).address + "계정 "+num+"개 데이터 다운로드"); 
        var str = await App.callCompnayName();
        sessionStorage.setItem(str+'tx'+sessionStorage.getItem(str+'cnt'),JSON.stringify(receipt));
        App.txInfo.tag="다운로드";
        App.txInfo.file="patient";
        App.txInfo.cnt=num;    
        sessionStorage.setItem(str+'Info'+sessionStorage.getItem(str+'cnt'),JSON.stringify(App.txInfo));
        location.reload();
      }
    }).on('error',function(error){
      document.getElementById("test").textContent=error;
    })
  },

  reading: async function(num){
    this.state.cnt++;
    sessionStorage.setItem(await this.callCompnayName()+'cnt',this.state.cnt);
    var spinner = this.showSpinner();
    //file수정
    mdContract.methods.reading(num,"patient").send({
      type:'SMART_CONTRACT_EXECUTION',
      from: JSON.parse(sessionStorage.getItem('walletInstance')).address ,
      gas: '250000',
    }).then(async function(receipt){
      if(receipt.status){
        spinner.stop();
        alert(JSON.parse(sessionStorage.getItem('walletInstance')).address + "계정 "+num+"개 데이터 조회"); 
        var str = await App.callCompnayName();
        var cnts = sessionStorage.getItem(str+'cnt');
        sessionStorage.setItem(str+'tx'+cnts,JSON.stringify(receipt));
        App.txInfo.tag="데이터 조회";
        App.txInfo.file="patient";
        App.txInfo.cnt=num;     
        sessionStorage.setItem(str+'Info'+cnts,JSON.stringify(App.txInfo));
        App.transactionList(sessionStorage.getItem(str+'tx'+cnts),sessionStorage.getItem(str+'Info'+cnts));    
      }
    }).on('error',function(error){
    })
  },

  setInit: async function(){
    var str = await this.callCompnayName();
    for(var i=0;i<=sessionStorage.getItem(str+'cnt');i++)
        sessionStorage.removeItem(str+'tx'+i);
    sessionStorage.setItem(str+'cnt',0);
  },

  callOwner: async function () {
    return await mdContract.methods.owner().call();
  },

  callContractBalance: async function () {
    return await mdContract.methods.getBalance().call();
  },

  callLookCount: async function(filename){
    return await mdContract.methods.getLookCount(this.getWallet().address,filename).call();
  },

  callDownloadCount: async function(filename){
    return await mdContract.methods.getDownloadCount(this.getWallet().address,filename).call();
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
    var spinner = this.showSpinner();
    try{
     await this.integrateWallet(id,privateKey);
    }catch(e){
      document.getElementById("look_cnt").textContent= "";
      document.getElementById("login_cnt").textContent="";
     }
     mdContract.methods.login(id).send({
        type:'SMART_CONTRACT_EXECUTION',
        from: JSON.parse(sessionStorage.getItem('walletInstance')).address ,
        gas: '250000'
      }).then(async function(receipt){
        if(receipt.status){
          spinner.stop();
          alert(JSON.parse(sessionStorage.getItem('walletInstance')).address + "로그인 성공");
          var str = await App.callCompnayName();
          sessionStorage.setItem(str+'cnt',Number(sessionStorage.getItem(str+'cnt'))+1);
          sessionStorage.setItem(str+'tx'+sessionStorage.getItem(str+'cnt'),JSON.stringify(receipt));
          App.txInfo.tag="로그인";
          App.txInfo.file="";
          App.txInfo.cnt=0;
          sessionStorage.setItem(str+'Info'+sessionStorage.getItem(str+'cnt'),JSON.stringify(App.txInfo));   
          location.reload();
         }
      })
  },

  integrateWallet: function (id,privateKey) {
    const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
    cav.klay.accounts.wallet.add(walletInstance);
    sessionStorage.setItem('walletInstance',JSON.stringify(walletInstance));
  },

  findUsers: async function(add){
    $('#TxTable>tbody').empty();
    $('#UserTable>tbody').empty();
    $('#UserDataTable>tbody').empty();
    var str = await mdContract.methods.getCompany(add).call();
   
    $('#UserTable > tbody:last')
    .append('<tr><td>'+await this.callCompnayName()+'</td>'
    +'<td>'+await this.callLoginCount()+'</td>'
    +'<td>'+this.state.cnt+'</td></tr>');

    for(var i=0;i<10;i++)
    {
      //file수정
      var filename = "patient";
      var temp = await mdContract.methods.findDataAccess(add,filename).call({from: this.getWallet().address});
      temp = JSON.stringify(temp);
      $('#UserDataTable > tbody:last')
      .append('<tr><td>'+filename+'</td>'
      +'<td>'+JSON.parse(temp).Look+'</td>'
      +'<td>'+JSON.parse(temp).Download+'</td></tr>');
    }
    for(var i=sessionStorage.getItem(str+'cnt');i>=0;i--)
    {
       this.transactionList(sessionStorage.getItem(str+'tx'+i),sessionStorage.getItem(str+'Info'+i));
    }
  },

  timeConverter: function(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = year + '.' + a.getMonth() + '.' + date + ' / ' + hour + ':' + min + ':' + sec ;
    return time;
  },

  transactionList: async function(Tx,Info){
    var block;
    await cav.klay.getBlock(JSON.parse(Tx).blockNumber).then(function(receipt){
      block=JSON.stringify(receipt);
    });
    $('#TxTable > tbody:last')
    .append('<tr><td>'+ this.timeConverter(parseInt(JSON.parse(block).timestamp,16))+'</td>'+
    '<td>'+JSON.parse(Info).tag+'</td>'+
    '<td>'+JSON.parse(Info).file+'</td>'+
    '<td>'+JSON.parse(Info).cnt+" Row"+'</td>'+
    '<td>'+`<p><a href='https://baobab.scope.klaytn.com/tx/${JSON.parse(Tx).transactionHash}'
    target='_blank'>check</a></p>`+'</td>'+
    '</td></tr>');
  },

  userInfoList: async function(){
    $('#UserTable > tbody:last')
    .append('<tr><td>'+await this.callCompnayName()+'</td>'
    +'<td>'+await this.callLoginCount()+'</td>'
    +'<td>'+this.state.cnt+'</td></tr>');
  },

  userDataList: async function(){
    for(var i=0;i<10;i++)
    {
      //file수정
      var filename = "patient";
      $('#UserDataTable > tbody:last')
      .append('<tr><td>'+filename+'</td>'
      +'<td>'+await this.callLookCount(filename)+'</td>'
      +'<td>'+await this.callDownloadCount(filename)+'</td></tr>');
    }
  },
  
  changeUI: async function (walletInstance) {
    document.getElementById("myAddress").textContent="내 주소: "+walletInstance.address;

    if((await this.callOwner()).toLowerCase() === walletInstance.address){
      document.getElementById("test1").style.visibility='visible';
      document.getElementById("test2").style.visibility='visible';
      document.getElementById("myAddress").style.visibility='hidden';
      document.getElementById("look_cnt").style.visibility='hidden';
      document.getElementById("login_cnt").style.visibility='hidden';
      document.getElementById("company").style.visibility='hidden';
      document.getElementById("tx_cnt").style.visibility='hidden';
      document.getElementById("TxTable").style.visibility='visible';
      document.getElementById("DBbutton").style.visibility='hidden';
      document.getElementById("files").style.visibility='hidden';
      document.getElementById("OutputTable").style.visibility='hidden';
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
      document.getElementById("DBbutton").style.visibility='visible';
      document.getElementById("files").style.visibility='visible';
      document.getElementById("OutputTable").style.visibility='visible';
      document.getElementById("mode").textContent="유저 모드";
      for(var i=this.state.cnt;i>=this.state.cnt-10;i--)
      {
         this.transactionList(
          sessionStorage.getItem(await this.callCompnayName()+'tx'+i)
         ,sessionStorage.getItem(await this.callCompnayName()+'Info'+i)
         );
      }
      this.userInfoList();
      this.userDataList();
    }
  },
  sendCheck: function(){
    var count =0;
    var box = document.getElementsByName("patient");
    for(var i=0; i<box.length; i++) {
        if(box[i].checked == true) {
            count++;
        }
    }
    this.Download(count);
  },

  check_all: function(){
    var box = document.getElementsByName("patient");
    var allcheck = document.getElementById("checkAll");
    if(!allcheck.checked)
    { 
      for(var i=0; i<box.length; i++) {
        box[i].checked=false;
      }
    }
    else{
      for(var i=0; i<box.length; i++) {
        box[i].checked=true;
      }
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

