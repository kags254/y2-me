// WebSocket client for real-time data
class BinaryWebSocket {
    constructor(apiToken) {
        this.apiUrl = 'wss://ws.binaryws.com/websockets/v3';
        this.apiToken = apiToken;
        this.socket = null;
        this.connected = false;
        this.subscribers = {
            tick: [],
            balance: [],
            transaction: [],
            proposal: [],
            contract: []
        };
    }

    // Connect to the WebSocket API
    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(this.apiUrl);
                
                this.socket.onopen = () => {
                    console.log('WebSocket connected');
                    
                    // Authorize with the API token
                    this.send({
                        authorize: this.apiToken
                    });
                };
                
                this.socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                    
                    // Resolve the promise once we're authorized
                    if (data.msg_type === 'authorize' && !data.error) {
                        this.connected = true;
                        resolve(data.authorize);
                    } else if (data.error) {
                        reject(data.error);
                    }
                };
                
                this.socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };
                
                this.socket.onclose = () => {
                    console.log('WebSocket closed');
                    this.connected = false;
                    
                    // Try to reconnect
                    setTimeout(() => {
                        if (!this.connected) {
                            this.connect();
                        }
                    }, 5000);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // Send a message to the API
    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.error('WebSocket not connected');
        }
    }

    // Handle incoming messages
    handleMessage(data) {
        const msgType = data.msg_type;
        
        // Dispatch to appropriate subscribers
        if (msgType === 'tick' && this.subscribers.tick.length) {
            this.subscribers.tick.forEach(callback => callback(data.tick));
        } else if (msgType === 'balance' && this.subscribers.balance.length) {
            this.subscribers.balance.forEach(callback => callback(data.balance));
        } else if (msgType === 'transaction' && this.subscribers.transaction.length) {
            this.subscribers.transaction.forEach(callback => callback(data.transaction));
        } else if (msgType === 'proposal' && this.subscribers.proposal.length) {
            this.subscribers.proposal.forEach(callback => callback(data.proposal));
        } else if (msgType === 'proposal_open_contract' && this.subscribers.contract.length) {
            this.subscribers.contract.forEach(callback => callback(data.proposal_open_contract));
        }
    }

    // Subscribe to tick data for a market
    subscribeTicks(market, callback) {
        if (typeof callback === 'function') {
            this.subscribers.tick.push(callback);
        }
        
        this.send({
            ticks: market,
            subscribe: 1
        });
    }

    // Subscribe to balance updates
    subscribeBalance(callback) {
        if (typeof callback === 'function') {
            this.subscribers.balance.push(callback);
        }
        
        this.send({
            balance: 1,
            subscribe: 1
        });
    }

    // Subscribe to transaction updates
    subscribeTransactions(callback) {
        if (typeof callback === 'function') {
            this.subscribers.transaction.push(callback);
        }
        
        this.send({
            transaction: 1,
            subscribe: 1
        });
    }

    // Request a price proposal
    requestProposal(params, callback) {
        if (typeof callback === 'function') {
            this.subscribers.proposal.push(callback);
        }
        
        this.send({
            proposal: 1,
            ...params
        });
    }

    // Buy a contract
    buyContract(proposal_id, price, callback) {
        if (typeof callback === 'function') {
            this.subscribers.contract.push(callback);
        }
        
        this.send({
            buy: proposal_id,
            price: price
        });
    }

    // Track a contract
    trackContract(contract_id, callback) {
        if (typeof callback === 'function') {
            this.subscribers.contract.push(callback);
        }
        
        this.send({
            proposal_open_contract: 1,
            contract_id: contract_id,
            subscribe: 1
        });
    }

    // Fetch historical tick data
    fetchHistory(market, count = 100) {
        return new Promise((resolve, reject) => {
            // Create a one-time handler for the history response
            const handler = (event) => {
                const data = JSON.parse(event.data);
                
                if (data.msg_type === 'history' && !data.error) {
                    this.socket.removeEventListener('message', handler);
                    resolve(data.history);
                } else if (data.error) {
                    this.socket.removeEventListener('message', handler);
                    reject(data.error);
                }
            };
            
            // Add the temporary handler
            this.socket.addEventListener('message', handler);
            
            // Send the history request
            this.send({
                ticks_history: market,
                count: count,
                end: 'latest',
                style: 'ticks'
            });
        });
    }

    // Close the connection
    close() {
        if (this.socket) {
            this.socket.close();
            this.connected = false;
        }
    }
}
