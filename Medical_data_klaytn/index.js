import Caver from "caver-js";
import {Spinner} from "spin.js";

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

  start: async function () {
    await this.dbGetFilename();
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

  logout: async function(){
    sessionStorage.removeItem('walletInstance');
    document.getElementById("user0").style.visibility='visible';
    document.getElementById("user1").style.visibility='visible';
    document.getElementById("user2").style.visibility='visible';
    document.getElementById("user3").style.visibility='visible';
    document.getElementById("user4").style.visibility='visible';
    document.getElementById("user5").style.visibility='visible';
    location.reload();
  },

  login: async function (id,privateKey) {
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
          await App.dbSetTxinfo(
            await App.callCompnayName(), //name
            await App.blocktime(JSON.stringify(receipt)), //time
            "로그인",
            " ",
            0,
            JSON.stringify(receipt.transactionHash),
            )  
            location.reload();
         }
      })
  },

  integrateWallet: function (id,privateKey) {
    const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
    cav.klay.accounts.wallet.add(walletInstance);
    sessionStorage.setItem('walletInstance',JSON.stringify(walletInstance));
  },

  download: async function(num,filename){
    var spinner = this.showSpinner();
    mdContract.methods.Download(num,filename).send({
      type:'SMART_CONTRACT_EXECUTION',
      from: JSON.parse(sessionStorage.getItem('walletInstance')).address ,
      gas: '250000',
    }).then(async function(receipt){
      if(receipt.status){
        spinner.stop();
        alert(JSON.parse(sessionStorage.getItem('walletInstance')).address + "계정 "+filename+'.csv파일에서 '+num+"ROW 데이터 다운로드"); 
        await App.dbSetTxinfo(
          await App.callCompnayName(), //name
          await App.blocktime(JSON.stringify(receipt)), //time
          "다운로드",
          filename,
          num,
          JSON.stringify(receipt.transactionHash),
        )
        location.reload();
      }
    })
  },

  reading: async function(num,filename){
    var spinner = this.showSpinner();
    mdContract.methods.reading(num,filename).send({
      type:'SMART_CONTRACT_EXECUTION',
      from: JSON.parse(sessionStorage.getItem('walletInstance')).address ,
      gas: '250000',
    }).then(async function(receipt){
      if(receipt.status){
        spinner.stop();
        alert(JSON.parse(sessionStorage.getItem('walletInstance')).address + "계정 "+num+"개 데이터 조회"); 
        await App.dbSetTxinfo(
          await App.callCompnayName(), //name
          await App.blocktime(JSON.stringify(receipt)), //time
          "데이터 조회",
          filename,
          num,
          JSON.stringify(receipt.transactionHash),
        )  
        var content =await App.dbGetTxinfo(await App.callCompnayName());
        $('#TxTable>tbody').empty();
        for(var i=content.length-1;i>=content.length-10;i--)
        {
          if(content[i])
          await App.transactionList(content[i]);
        }
        $('#UserDataTable>tbody').empty();
        await App.userDataList();
      }
    })
  },

  callOwner: async function () {
    return await mdContract.methods.owner().call();
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

  findUsers: async function(add){
    $('#TxTable>tbody').empty();
    $('#UserTable>tbody').empty();
    $('#UserDataTable>tbody').empty();
    var str = await mdContract.methods.getCompany(add).call();
    var content = await this.dbGetTxinfo(str);
    var content_cnt = content.length;
    $('#UserTable > tbody:last')
    .append('<tr><td>'+str+'</td>'
    +'<td>'+await mdContract.methods.getLoginCount(add).call()+'</td>'
    +'<td>'+content_cnt+'</td></tr>');
    var filename=await this.dbGetFilename();
    for(var i=0;i<filename.length;i++)
    {
      $('#UserDataTable > tbody:last')
      .append('<tr><td>'+filename[i].name+'.csv'+'</td>'
      +'<td>'+ await mdContract.methods.getLookCount(add,filename[i].name).call()+' Row'+'</td>'
      +'<td>'+await mdContract.methods.getDownloadCount(add,filename[i].name).call()+' Row'+'</td></tr>');
    }
    for(var i=content_cnt-1;i>=content_cnt-10;i--)
    {
      if(content[i])
       await this.transactionList(content[i]);
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
  
  blocktime: async function(Tx)
  {
    var block;
    await cav.klay.getBlock(JSON.parse(Tx).blockNumber).then(function(receipt){
      block=JSON.stringify(receipt);
    });
    return this.timeConverter(parseInt(JSON.parse(block).timestamp,16))
  },

  transactionList: async function(Info){
    var name = "";
    if(Info.filename!=" ")
      name = Info.filename+'.csv';
    $('#TxTable > tbody:last')
    .append('<tr><td>'+Info.time+'</td>'+
    '<td>'+Info.txinfo+'</td>'+
    '<td>'+name+'</td>'+
    '<td>'+Info.data+" Row"+'</td>'+
    '<td>'+`<p><a href='https://baobab.scope.klaytn.com/tx/${Info.txnum.replace(/["]+/g,'')}'
    target='_blank'>check</a></p>`+'</td>'+
    '</td></tr>');
  },

  userInfoList: async function(cnt){
    $('#UserTable > tbody:last')
    .append('<tr><td>'+await this.callCompnayName()+'</td>'
    +'<td>'+await this.callLoginCount()+'</td>'
    +'<td>'+cnt+'</td></tr>');
  },

  userDataList: async function(){
    var filename=await this.dbGetFilename();
    for(var i=0;i<filename.length;i++)
    {
      $('#UserDataTable > tbody:last')
      .append('<tr><td>'+filename[i].name+'.csv'+'</td>'
      +'<td>'+await this.callLookCount(filename[i].name)+" Row"+'</td>'
      +'<td>'+await this.callDownloadCount(filename[i].name)+" Row"+'</td></tr>');
    }
  },

  dbSetTxinfo: async function(_name,_time,_txinfo,_filename,_data,_txnum){
    let datas ={
      id: 0,
      name: _name,
      time: _time,
      txinfo: _txinfo,
      filename: _filename,
      data: _data,
      txnum: _txnum
    }
    var request = await new Request('/api/setData', {
        method: 'POST', 
        body:JSON.stringify(datas), 
        headers: new Headers( {'Content-Type': 'application/json'
      })
    });
    fetch(request).then(function(){
    console.log("ok");})
    .catch(function(){
    console.log(error); });
  },

  dbGetTxinfo : async function(_name){
    var request = await new Request('/api/getData', {
        method: 'POST', 
        body: JSON.stringify({name:_name}), 
        headers: new Headers( {'Content-Type': 'application/json'
      })
    });
    const rawResponse = await fetch(request);
    const content = await rawResponse.json();
    return content;
  },

  dbGetFile : async function(_name){
    sessionStorage.setItem('filename',_name);
    var request = await new Request('/api/getFile', {
        method: 'POST', 
        body: JSON.stringify({name:_name}), 
        headers: new Headers( {'Content-Type': 'application/json'
      })
    });
    const rawResponse = await fetch(request);
    const content = await rawResponse.json();
    var ks = Object.keys(content[1]);
    $('#OutputTable>tbody').empty();
    $('#OutputTable>thead').empty();

    $('#OutputTable > thead:last')
    .append('<th><input type="checkbox" id="checkAll" onclick="App.check_all()"></th>');
    for(ks in content[1]) {
      $('#OutputTable > thead:last').append('<th>'+ks+'</th>')
    }
    for(var j = 1; j<content.length; j++){
      $('#OutputTable > tbody:last')
      .append(`<td><input type="checkbox" name=${_name}></td>`);
      for(ks in content[j]) {
        $('#OutputTable > tbody:last').append('<td>'+content[j][ks]+'</td>');
      }
      $('#OutputTable > tbody:last').append('<tr>');
    }
    await App.reading(content.length-1,_name);
    document.getElementById("DBbutton").style.visibility='visible';
  },

  dbGetFilename : async function(){
    var request = await new Request('/api/getFilename', {
        method: 'POST', 
        headers: new Headers( {'Content-Type': 'application/json'
      })
    });
    const rawResponse = await fetch(request);
    const content = await rawResponse.json();
    return content;
  },
  
  changeUI: async function (walletInstance) {
    document.getElementById("myAddress").textContent="내 주소: "+walletInstance.address;
    document.getElementById("DBbutton").style.visibility='hidden';

    if((await this.callOwner()).toLowerCase() === walletInstance.address){
      document.getElementById("test1").style.visibility='visible';
      document.getElementById("test2").style.visibility='visible';
      document.getElementById("test3").style.visibility='visible';
      document.getElementById("test4").style.visibility='visible';
      document.getElementById("test5").style.visibility='visible';
      document.getElementById("myAddress").style.visibility='hidden';
      document.getElementById("look_cnt").style.visibility='hidden';
      document.getElementById("login_cnt").style.visibility='hidden';
      document.getElementById("company").style.visibility='hidden';
      document.getElementById("tx_cnt").style.visibility='hidden';
      document.getElementById("TxTable").style.visibility='visible';
      document.getElementById("DBbutton").style.visibility='hidden';
      document.getElementById("OutputTable").style.visibility='hidden';
      document.getElementById("dbfile").style.visibility='hidden';
      document.getElementById("mode").textContent="관리자 모드";
    }
    else{
      document.getElementById("test1").style.visibility='hidden';
      document.getElementById("test2").style.visibility='hidden';
      document.getElementById("test3").style.visibility='hidden';
      document.getElementById("test4").style.visibility='hidden';
      document.getElementById("test5").style.visibility='hidden';
      document.getElementById("myAddress").style.visibility='visible';
      document.getElementById("look_cnt").style.visibility='visible';
      document.getElementById("login_cnt").style.visibility='visible';
      document.getElementById("company").style.visibility='visible';
      document.getElementById("tx_cnt").style.visibility='visible';
      document.getElementById("TxTable").style.visibility='visible';
      document.getElementById("OutputTable").style.visibility='visible';
      document.getElementById("dbfile").style.visibility='visible';
      document.getElementById("mode").textContent="유저 모드";
      var content = await this.dbGetTxinfo(await this.callCompnayName());
      for(var i=content.length-1;i>=content.length-10;i--)
      {
        if(content[i])
         this.transactionList(content[i]);
      }
      this.userInfoList(content.length);
      this.userDataList();
    }
  },

  sendCheck: function(){
    var filename = sessionStorage.getItem('filename');
    var count =0;
    var box = document.getElementsByName(filename);
    for(var i=0; i<box.length; i++) {
        if(box[i].checked == true) {
            count++;
        }
    }
    if(count)
    this.download(count,filename);
  },

  check_all: function(){
    var filename = sessionStorage.getItem('filename');
    var box = document.getElementsByName(filename);
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

