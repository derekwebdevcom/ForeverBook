import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import ForeverBook from '../abis/ForeverBook.json'
import Navbar from './Navbar'
import Main from './Main'
import { FOREVER_BOOK_ABI, FOREVER_BOOK_ADDRESS } from './config'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545")
    const network = await web3.eth.net.getNetworkType()
    console.log("network:", network)
    // Load account
    const accounts = await web3.eth.getAccounts()
    
    this.setState({ account: accounts[0] })
      const foreverBook = web3.eth.Contract(FOREVER_BOOK_ABI, FOREVER_BOOK_ADDRESS)
      
      this.setState({ foreverBook })
      const postCount = await foreverBook.methods.postCount().call()
      this.setState({ postCount })
      // Load Posts
      for (var i = 1; i <= postCount; i++) {
        const post = await foreverBook.methods.posts(i).call()
        this.setState({
          posts: [...this.state.posts, post]
        })
      }
      // Sort posts. Show highest tipped posts first
      this.setState({
        posts: this.state.posts.sort((a,b) => b.tipAmount - a.tipAmount )
      })
      this.setState({ loading: false})
     
  }

  createPost(content) {
    this.setState({ loading: true })
    this.state.foreverBook.methods.createPost(content).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  tipPost(id, tipAmount) {
    this.setState({ loading: true })
    this.state.foreverBook.methods.tipPost(id).send({ from: this.state.account, value: tipAmount })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      foreverBook: null,
      postCount: 0,
      posts: [],
      loading: true
    }

    this.createPost = this.createPost.bind(this)
    this.tipPost = this.tipPost.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              posts={this.state.posts}
              createPost={this.createPost}
              tipPost={this.tipPost}
            />
        }
      </div>
    );
  }
}

export default App;
