import './App.css';
import { ethers } from 'ethers';
import { abi } from './abi';
import { useState, useRef } from 'react';
import SocialLogin from "@biconomy/web3-auth";
import "@biconomy/web3-auth/dist/src/style.css"
import { ChainId } from "@biconomy/core-types";
import SmartAccount from "@biconomy/smart-account";
const web3 = require('web3');

function App() {

  const [smartAccount, setSmartAccount] = useState(null);
  const sdkRef =  useRef(null);
  const [text, setText] = useState('');
  const [add, setadd] = useState('');
  const [mintAdd, setmintAdd] = useState('');
  
  let provider;

  async function logIn() {
    
    if(!sdkRef.current){
      const socialLoginSDK = new SocialLogin();
      const signature1 = await socialLoginSDK.whitelistUrl('http://127.0.0.1:3000/')
      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.GOERLI).toString(),
        network: "GOERLI",
        whitelistUrls: {
          'http://127.0.0.1:5173/': signature1,
        }
      });
      sdkRef.current = socialLoginSDK;
    }
    
    if(!sdkRef.current.provider){
      sdkRef.current.showWallet();
    }
    else {
      initSmartWallet();
    }
  }

  async function initSmartWallet() {

    if(!sdkRef?.current.provider) return;
    sdkRef.current.hideWallet();
    provider = new ethers.providers.Web3Provider(
      sdkRef.current.provider,
    );

    let options = {
      activeNetworkId: ChainId.GOERLI,
      supportedNetworksIds: [ChainId.GOERLI],
      networkConfig: [
        {
          chainId: ChainId.GOERLI,
          dappAPIKey: "9IC7fp3_x.1d161661-fbf2-4391-8b45-91b8e244741d",
          providerUrl: "https://ethereum-goerli.publicnode.com"
        }
      ]
    };

    let smartAccount = new SmartAccount(provider, options);
    smartAccount = await smartAccount.init();
    setSmartAccount(smartAccount);
    console.log("Smart wallet address biconomy: ", smartAccount.address);


  }
  async function transferETH() {
    
    let CONT = new ethers.Contract("0x11C20f0E0038C009CDf38271c429f0DdD85B0475", abi, provider);
    const tx1 = await CONT.populateTransaction.safeMint("0x0E6e696bD0b94fF07a2A33620B33892bFea1b2b4", "xxx");

    const txs = [];
    txs.push(tx1);
    txs.push(tx1);

    console.log("txs: ", txs)
    const txResponse = await smartAccount.sendTransactionBatch({ transactions: txs });
    console.log('UserOp hash', txResponse.hash);
    const txReciept = await txResponse.wait();
    console.log('Tx Hash', txReciept.transactionHash);
  }


  return (
    <>
        <button  id='btn' className="btn" onClick={logIn}>Connect Wallet</button>
        {
          smartAccount == null ? 
          <></>
          :
          <>
          <h3>Smart Wallet Address</h3>
          <h3>{smartAccount.address}</h3>
          </>
        }
      
      <div className='st'>
        <button className='button1' onClick={transferETH}>MINT NFT BATCH</button>
      </div>
    </>
  );
}

export default App;