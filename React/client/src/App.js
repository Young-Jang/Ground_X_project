import React, { Component } from "react";
import MedicalData from "./contracts/MedicalData.json"; // 추가
import getWeb3 from "./utils/getWeb3";

import "./App.css";
// import { runInThisContext } from "vm";

class Subject extends Component {
  render() {
    return(
      <header>
        <h1><a href = "/" onClick={function(ev){
          ev.preventDefault();
        }.bind(this)}>{this.props.title}</a></h1>
        {this.props.desc}
      </header>
    );
  }
}

class Content extends Component {
  render() {
    return (
      <article>
        <h2>{this.props.data.title}</h2>
        {this.props.data.desc}
        {this.props.data.count}
      </article>
    )
  }
}

class TOC extends Component {
  render() {
    var list = [];
    var i = 0;
    while (i <this.props.data.length){
      var data = this.props.data[i];
      list.push(
        <li key={data.id}>
          <a href={data.id + '.html'} onClick={function(id, ev){
            ev.preventDefault();
            this.props.onSelect(id);
          }.bind(this, data.id)}>
          {data.title}
          </a>
        </li>
      );
      i = i+1;
    }
    return (
      <nav>
        <ol>
          {list}
        </ol>
      </nav>
    )
  }
}

class App extends Component {
  state = { 
      storageValue: 0, 
      web3: null, 
      accounts: null, 
      contract: null,
      users : ['A','B','C','D','E','F','G','H','I'],
      manager : ['M'] ,
      number : 0,
      account_balance : 0,
      R2 : null,
      DA : null,
      selected_content_id : 1,
      mode : 'read',
      contents : [
        {id:1, title: 'first' , desc : 'first table', count : 5},
        {id:2, title: 'second', desc : 'second table', count : 4},
        {id:3, title: 'third' , desc : 'third table', count : 9}
      ]
    }
  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const balance = await web3.eth.getBalance(accounts[0]);
      const networkId = await web3.eth.net.getId();
      //추가
      const deployedNetwork_2 = MedicalData.networks[networkId];
      const instance = new web3.eth.Contract(
        MedicalData.abi,
        deployedNetwork_2 && deployedNetwork_2.address,
      );
      // Set web3, accounts, and contract to the state, and then proceed with an example of interacting with the contract's methods.
      // contract_2 추가 
      this.setState({ web3, myaccount:accounts[0], accounts, contract : instance, account_balance : balance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state; //contract_2 추가
    // await contract_2.methods.getBalance; 추가 const response_2 = await contract_2.methods.getBalance().call();
    const web3 = await getWeb3();
    const response_2 = await web3.eth.getBalance(accounts);
    const response_2_2 = await contract.methods.deposit().call();
    // Update state with the result. balance 추가
    this.setState({ R2: response_2, DA: response_2_2});
  };

  _deposit = async () => {
    const { contract, myaccount } = this.state;
    const deposit_amount = await contract.methods.deposit().send(
      {
        from : this.state.myaccount,
        to : '0xaB23AD6AA94b4Fe679614CcD2f317E80170AF77f',
        value : this.state.web3.utils.toWei('100000000000', 'wei'),
        gas : 900000
      }
    );
    // console.log(10);
    // this.deposit();
  }

  _owner = async () => {
    const {contract_2} = this.state;
    const owner = contract_2.owner;
    console.log(owner);
  }

  _getbalance = async () => {
    const { contract } = this.state;
    // 여기서 숫자만 나오게 하는건 어떻게 하지?
    const balance_amount = contract.methods.getBalance();
    // const balance_amount = await contract.methods.getBalance(this.state.accounts[0])
    console.log(1);
    console.log(balance_amount);
  }

  _plusCount = async () => {
    await this.setState({number : this.state.number + 1});
    console.log(this.state.number);
  }

  _minusCount = async() => {
    this.setState({number : this.state.number - 1});
    console.log(this.state.number);
  }

  getSelectedContent() {
    var i = 0;
    while(i < this.state.contents.length){
      var data = this.state.contents[i];
      if(this.state.selected_content_id === data.id){
        return data;
      }
      i=i+1;
    }
  }

  getContentComponent() {
    if(this.state.mode === 'read'){
      return <Content data = {this.getSelectedContent()}></Content>
    } else if (this.state.mode === 'welcome') {
      return <Content data = {{
        title : 'Welcome',
        desc : 'Hello, React'
      }}></Content>
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (

      <div className="App">
        <header className="App-header">
          <h4>The address is: {this.state.accounts[0]}</h4>
          <div>The stored value value is: {this.state.account_balance}</div>
            <button id = "getbalance" onClick = {this._getbalance}> Balance </button>
            <button id = "depositamount" onClick = {this._deposit}> Deposit </button>
            <button id = "depositamount2" onClick = {this.state.DA}> Deposit2   </button>
            <button id = "plus" onClick={this._plusCount}>+</button>
            <button id = "minus" onClick={this._minusCount}>-</button>
            <p id ="number" > {this.state.number} </p>
          <input name="amount" placeholder="amount"/> 
          {/* 어떻게 하면 이거를 바로 기부하는 형식으로 구현해 낼 수 있을까? */}
        </header>

        <div className="App2">
          <h1>Step 2</h1>
          <input type="checkbox" onClick={function(ev){
            ev.preventDefault();
            console.log(1)
          }}/> 
            <TOC onSelect={function(id){
              this.setState({
                selected_content_id:id,
                mode : 'read'
              });
            }.bind(this)} data={this.state.contents}></TOC>
            {this.getContentComponent()}
        </div>
      </div>

    );
  }
}

export default App;
