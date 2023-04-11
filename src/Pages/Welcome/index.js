import React, { useState } from "react";
import { ProfileIcon, ArrowBackIcon } from "../../assets";
import ConnectWallet from "../../components/ConnectWallet";
import Modal1 from "../../components/Modal1";
import { setUserToken } from "../../store/reducers/authReducer";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { cont_address, cont_abi, tokenABI, Token_address } from "../../../src/components/config";
import { useLocation } from "react-router-dom";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";

const Welcome = (props) => {
  const [tab, setTab] = useState("1");
  const [selectedType, setSelectedType] = useState("");
  const [registerType, setRegisterType] = useState("");
  const [openWallet, setOpenWallet] = useState(false);
  const [uplinerID, set_uplinerId] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isWalletConnected, set_isWalletConnected] = useState(false);

  const [address, set_address] = useState(null);
  const [viewAddress, set_viewAddress] = useState(null);

  const [option, set_choosed_option] = useState("");

  const [web3, set_web3] = useState(null);
  const [provider, set_provider] = useState(null);

  const [balance, set_balance] = useState(null);
  const [matic, set_matic] = useState(null);

  const [contract, set_contract] = useState(null);
  const [contract1, set_contract1] = useState(null);

  const [ref, set_ref] = useState(null);
  const [refId, set_refId] = useState("");
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  async function Connect_Wallet(id) {
    let provider;
    let web3;
    let accounts;



    const NETWORK_ID = "137";
    const NETWORK_ID_hex = "0x89";




    if (id == "1") {
      //metmask
      provider = window.ethereum;
      // alert(provider._metamask);
      console.log(provider.isMetaMask);
      web3 = new Web3(provider);
      const networkId = await web3.eth.net.getId();
      setOpenWallet(false);

      if (networkId == NETWORK_ID) 
      {
        accounts = await provider.request({ method: "eth_requestAccounts" });
        set_address(accounts[0]);
        
        const contract = new web3.eth.Contract(cont_abi, cont_address);
        const contract1 = new web3.eth.Contract(tokenABI, Token_address);
        let balance = await contract1.methods.balanceOf(accounts[0]).call();
        
        let matic = await web3.eth.getBalance(accounts[0]);
        balance = web3.utils.fromWei(balance, "ether");
        matic = web3.utils.fromWei(matic, "ether");


        console.log("meta and trust provider ");
        set_balance(balance)
        set_matic(matic)
        set_provider(provider)
        set_web3(web3);
        set_contract(contract)
        set_contract1(contract1)

        set_isWalletConnected(true)

        if(option==0) // Already a Member
        {
          const fee_paid = await contract.methods.is_paid(accounts[0]).call();


          if(fee_paid)
          { 
            props.set_user(accounts[0], web3, provider, balance, matic,false);            
            dispatch(setUserToken(true));

            navigate("/home");
          }
          else{
            alert("You are not a register member")
            return
          }


        }
        else if(option==1) // New Member
        { 
          let _ref;
          const fee_paid = await contract.methods.is_paid(accounts[0]).call();
          console.log("13");


          if(fee_paid)
          { 
            props.set_user(accounts[0], web3, provider, balance, matic,false);            
            dispatch(setUserToken(true));

            navigate("/home");
            return;
          }
          else if(uplinerID!=null && uplinerID!=""){

            console.log("hello this it");
            let address = await contract.methods.idtoAddress(uplinerID).call();
              set_ref(address)

              console.log("this is is given ref address: "+address);
              _ref = address.toString();
            

          }
          const total_inv = await contract.methods.total_investors().call();

          let reg_fee = 6;
          let val=Number(total_inv)+1
          const newId = "cntr89"+val;
           
          console.log("this is newid " + newId+" ref "+ _ref);
          if (_ref == null) {
            _ref = "0x0000000000000000000000000000000000000000";
          }
          try 
          {
            console.log("this is newid " + newId+" ref "+ balance);

            if (Number(reg_fee) > Number(balance))
            {

              alert("You dont have enough DAI");
              return;
            }

            reg_fee = reg_fee * 10 ** 18;
            console.log(typeof reg_fee + "   " + reg_fee);
            console.log("this is ref1 " + _ref);

            await contract1.methods
              .approve(cont_address, reg_fee.toString())
              .send({ from: accounts[0] });
            const result = await contract.methods
              .registration(_ref,newId.toString())
              .send({ from: accounts[0] });
            if (result) {
              props.set_user(accounts[0], web3, provider, balance, matic,false);            
              dispatch(setUserToken(true));

              navigate("/home");
            }
          } catch (error) {
            // Catch any errors for any of the above operations.

            console.error(error);
          }

        }
       



      } 
      else 
      {
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: NETWORK_ID_hex }],
          });
          Connect_Wallet(id);
        } catch {}
      }
    } else if (id == "2" || id == "3") {
      //trust 1Wallet
      provider = new WalletConnectProvider({
        rpc: {
          137:"https://polygon-mainnet.g.alchemy.com/v2/bf3cnZO2AQyu_Kv4eBx6uI0Slhs5GhMv"
        },
        chainId: 137,
      });

      console.log("trust wallet");

      console.log(provider);
      console.log(provider.wc.peerMeta);
      await provider.enable();

      console.log("this is provider");
      console.log(provider.wc.peerMeta.name);

      web3 = new Web3(provider);
      setOpenWallet(false);

      const networkId = await web3.eth.net.getId();
      console.log("yguygy7 " + networkId);
      if (networkId == NETWORK_ID) {
        accounts = await web3.eth.getAccounts();        
        set_address(accounts[0]);
        const contract = new web3.eth.Contract(cont_abi, cont_address);
        const contract1 = new web3.eth.Contract(tokenABI, Token_address);
        let balance = await contract1.methods.balanceOf(accounts[0]).call();
 

        let matic = await web3.eth.getBalance(accounts[0]);
        balance = web3.utils.fromWei(balance, "ether");
        matic = web3.utils.fromWei(matic, "ether");


        set_isWalletConnected(true)
        set_balance(balance)
        set_matic(matic)
        set_provider(provider)
        set_web3(web3);
        set_contract(contract)
        set_contract1(contract1)

        if(option==0) //fetch account
        {

          const fee_paid = await contract.methods.is_paid(accounts[0]).call();


          if(fee_paid)
          { 
            props.set_user(accounts[0], web3, provider, balance, matic,false);            
            dispatch(setUserToken(true));

            navigate("/home");
          }
          else{
            await provider.disconnect();

            alert("You are not a register member")
            return
          }


        }
        else if(option==1) //register
        { 
          let _ref;
          const fee_paid = await contract.methods.is_paid(accounts[0]).call();
          console.log("13");


          if(fee_paid)
          { 
            props.set_user(accounts[0], web3, provider, balance, matic,false);            
            dispatch(setUserToken(true));

            navigate("/home");
            return;
          }
          else if(params.get("ref")!=null)
          {
              console.log("hello this it");
            let address=await contract.methods.idtoAddress(params.get("ref")).call();
              set_ref(address)

              console.log("this is is given ref address: "+address);
              _ref = address.toString();
            

          }
          const total_inv = await contract.methods.total_investors().call();

          let reg_fee = 20;
          let val=Number(total_inv)+1;
          const newId = "cntr89"+val;
           
          console.log("this is newid " + newId);
          if (_ref == null) {
            _ref = "0x0000000000000000000000000000000000000000";
          }
          try 
          {

          if (Number(reg_fee) > Number(balance))
           {
            await provider.disconnect();

              alert("You dont have enough DAI");
              return;
            }

            reg_fee = reg_fee * 10 ** 18;
            console.log(typeof reg_fee + "   " + reg_fee);
            console.log("this is ref1 " + _ref);

            await contract1.methods
              .approve(cont_address, reg_fee.toString())
              .send({ from: accounts[0] });
            const result = await contract.methods
              .registration(_ref,newId.toString())
              .send({ from: accounts[0] });
            if (result) {
              props.set_user(accounts[0], web3, provider, balance, matic,false);            
              dispatch(setUserToken(true));

              navigate("/home");
            }
          } catch (error) {
            await provider.disconnect();
            console.error(error);
          }

        }
       



      }else {
        if (provider.wc.peerMeta.name == "MetaMask") {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: NETWORK_ID_hex }],
          });
          Connect_Wallet(id);
        } else {
          setOpenWallet(false);

          await provider.disconnect();
          alert("Kindly change your network to Polygon");
        }
      }
    } 

  }

  async function handleLogin(val) {
    // localStorage.setItem("token", true);

    
      setOpenWallet(true);
      set_choosed_option(val);
    



 
    // navigate("/home");
  }














  return (
    <div className="welcome-page flex flex-col items-center justify-center bg-black1">
      <div className="wrap warpWidth flex items-center justify-center">
        {tab === "1" ? (
          <div className="wrap-box flex flex-col">
            <div className="box-title">Welcome To Connectors</div>
            <div className="box-desc">
              Do you already have a profile with us?
            </div>
            <div className="wrap-block">
              <div
                className={`option-box flex flex-col justify-center items-center ${
                  selectedType === "oldUser" ? "active" : ""
                }`}
                onClick={(e) => {
                  setSelectedType("oldUser");
                  setTab("1");
                }}
              >
                <div className="icon flex items-center justify-center">
                  <ProfileIcon />
                </div>
                <div className="box-title">Already A Member</div>
              </div>
              <div
                className={`option-box flex flex-col justify-center items-center ${
                  selectedType === "newUser" ? "active" : ""
                }`}
                onClick={(e) => {
                  setSelectedType("newUser");
                  setTab("2");
                }}
              >
                <div className="icon flex items-center justify-center">
                  <ProfileIcon />
                </div>
                <div className="box-title">New Member</div>
              </div>
            </div>
            {selectedType === "oldUser" && (
              <div className="action flex items-center justify-center">
                {/* <Link to="/home"> */}
                  <button className="btn-connect button w-full"
                  onClick={(e) => handleLogin(0)}>

                    Connect Wallet To Sign Up Now
                  </button>
                {/* </Link> */}
              </div>
            )}
          </div>
        ) : tab === "2" ? (
          <div className="wrap-box flex flex-col">
            <div className="back-action flex items-center">
              <div
                className="back-icon flex items-center justify-center cursor-pointer"
                onClick={(e) => setTab("1")}
              >
                <ArrowBackIcon />
              </div>
            </div>
            <div className="box-title">Registering For Connectors</div>
            <div className="box-desc">Do you already have an Upline?</div>
            <div className="wrap-block">
              <div
                className={`option-box flex flex-col justify-center items-center ${
                  registerType === "yes" ? "active" : ""
                }`}
                onClick={(e) => setRegisterType("yes")}
              >
                <div className="icon flex items-center justify-center">
                  <ProfileIcon />
                </div>
                <div className="box-title">Yes, I do</div>
              </div>
              <div
                className={`option-box flex flex-col justify-center items-center ${
                  registerType === "no" ? "active" : ""
                }`}
                onClick={(e) => setRegisterType("no")}
              >
                <div className="icon flex items-center justify-center">
                  <ProfileIcon />
                </div>
                <div className="box-title">No, I don’t</div>
              </div>
            </div>
            {registerType === "yes" ? (
              <div className="action flex flex-col items-center justify-center">
                <div className="action-title">
                  Enter the ForceID of your Upline
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="txt cleanbtn w-full"
                  value={uplinerID}
                  onChange={(e) => {
                  set_uplinerId(e.target.value);
                  }}
                />
                {/* <Link to="/home"> */}
                  <button className="btn-connect button w-full"
                    onClick={(e) =>{ 
                      if(uplinerID!=null && uplinerID!="")
                      {
                        handleLogin(1)
                        
                      }
                      else{
                        alert("enter your upliner id")
                      }
                        }}>

                    Connect Wallet To Sign Up Now
                  </button>
                {/* </Link> */}
              </div>
            ) : registerType === "no" ? (
              <div className="action flex items-center justify-center">
                {/* <Link to="/home"> */}
                  <button className="btn-connect button w-full"               
                  onClick={(e) => handleLogin(1)}>

                    Connect Wallet To Sign Up Now

                  </button>
                {/* </Link> */}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <Modal1 open={openWallet} onClose={() => setOpenWallet(false)}>
        <ConnectWallet setOpenWallet={setOpenWallet} Connect_Wallet={Connect_Wallet}/>
      </Modal1>
    </div>
  );
};

export default Welcome;
