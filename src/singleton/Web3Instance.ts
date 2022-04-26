import Web3 from "web3";

let web3Instance = (() => {
    let instance: any;
    function initialize() {
        const web3 = new Web3();
        web3.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
        return web3;
    };
    return {
        getInstance: () => {
            if(!instance) {
                instance = initialize()
            }
            return instance;
        }
    }
})();

export = web3Instance.getInstance();