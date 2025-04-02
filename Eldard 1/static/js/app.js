// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentMarket = 'R_100';
    let isLoggedIn = false;
    let isTrading = false;
    let isPaused = false;
    let breakAfterWin = false;
    let onlineTimer = null;
    let onlineSeconds = 0;
    let digitHistory = [];
    let lastDigitCount = {};
    
    // Initialize counters
    for (let i = 0; i < 10; i++) {
        lastDigitCount[i] = 0;
    }
    
    // Elements
    const apiTokenInput = document.getElementById('api-token');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const executeTradeBtn = document.getElementById('execute-trade-btn');
    const marketButtons = document.querySelectorAll('.market-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const breakBtn = document.getElementById('break-btn');
    
    // Account information elements
    const startBalanceEl = document.getElementById('start-balance');
    const currentBalanceEl = document.getElementById('current-balance');
    const profitLossEl = document.getElementById('profit-loss');
    const tradeStatsEl = document.getElementById('trade-stats');
    const serverTimeEl = document.getElementById('server-time');
    const onlineTimeEl = document.getElementById('online-time');
    
    // Trade configuration elements
    const contractTypeSelect = document.getElementById('contract-type');
    const stakeAmountInput = document.getElementById('stake-amount');
    const targetProfitInput = document.getElementById('target-profit');
    const stopLossInput = document.getElementById('stop-loss');
    const martingaleStartInput = document.getElementById('martingale-start');
    const maxMartingaleInput = document.getElementById('max-martingale');
    
    // Digit analysis elements
    const digitIndicatorEl = document.getElementById('digit-indicator');
    const digitCounterEl = document.getElementById('digit-counter');
    const lastDigitHistoryEl = document.getElementById('last-digit-history');
    
    // Event listeners
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    executeTradeBtn.addEventListener('click', handleExecuteTrade);
    pauseBtn.addEventListener('click', handlePauseResume);
    breakBtn.addEventListener('click', handleBreakAfterWin);
    
    // Backtesting event listeners
    const runBacktestBtn = document.getElementById('run-backtest-btn');
    runBacktestBtn.addEventListener('click', handleRunBacktest);
    
    // Add event listeners to market buttons
    marketButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectMarket(btn.getAttribute('data-market'));
        });
    });
    
    // Initialize server time
    updateServerTime();
    setInterval(updateServerTime, 1000);
    
    // Function to update server time
    function updateServerTime() {
        const now = new Date();
        const formattedTime = now.toISOString().replace('T', ' ').substring(0, 19);
        serverTimeEl.textContent = formattedTime;
        
        if (isLoggedIn) {
            onlineSeconds++;
            updateOnlineTime();
        }
    }
    
    // Function to update online time
    function updateOnlineTime() {
        const days = Math.floor(onlineSeconds / (24 * 3600));
        const hours = Math.floor((onlineSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((onlineSeconds % 3600) / 60);
        const seconds = onlineSeconds % 60;
        
        onlineTimeEl.textContent = `${padZero(days)} ${padZero(hours)}:${padZero(minutes)}m ${padZero(seconds)}s`;
    }
    
    // Function to pad with zero
    function padZero(num) {
        return num < 10 ? `0${num}` : num;
    }
    
    // Function to handle login
    async function handleLogin() {
        const apiToken = apiTokenInput.value.trim();
        
        if (!apiToken) {
            showMessage('API token is required');
            return;
        }
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ api_token: apiToken })
            });
            
            const result = await response.json();
            
            if (result.success) {
                isLoggedIn = true;
                onlineSeconds = 0;
                getAccountInfo();
                selectMarket('R_100');
                
                // Update UI for logged in state
                apiTokenInput.disabled = true;
                loginBtn.disabled = true;
                logoutBtn.disabled = false;
                executeTradeBtn.disabled = false;
                
                showMessage(result.message);
            } else {
                showMessage(result.message);
            }
        } catch (error) {
            showMessage(`Error: ${error.message}`);
        }
    }
    
    // Function to handle logout
    async function handleLogout() {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}
            });
            
            const result = await response.json();
            
            if (result.success) {
                isLoggedIn = false;
                isTrading = false;
                isPaused = false;
                
                // Update UI for logged out state
                apiTokenInput.disabled = false;
                loginBtn.disabled = false;
                logoutBtn.disabled = true;
                executeTradeBtn.disabled = true;
                pauseBtn.textContent = 'Pause';
                
                // Reset displayed values
                startBalanceEl.textContent = '0.00';
                currentBalanceEl.textContent = '0.00';
                profitLossEl.textContent = '0.00';
                tradeStatsEl.textContent = '0 Wins / 0 Losses';
                digitIndicatorEl.textContent = '- - | - | - | - | - | - | -';
                digitCounterEl.textContent = '- - | - | - | - | - | - | -';
                lastDigitHistoryEl.innerHTML = '';
                
                showMessage(result.message);
            } else {
                showMessage(result.message);
            }
        } catch (error) {
            showMessage(`Error: ${error.message}`);
        }
    }
    
    // Function to handle market selection
    async function selectMarket(market) {
        if (!isLoggedIn) {
            showMessage('Please login first');
            return;
        }
        
        try {
            currentMarket = market;
            
            // Highlight the selected market button
            marketButtons.forEach(btn => {
                if (btn.getAttribute('data-market') === market) {
                    btn.style.backgroundColor = '#ff4a3d';
                } else {
                    btn.style.backgroundColor = '#ff6f61';
                }
            });
            
            // Get market data
            const response = await fetch('/market_data', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ market })
            });
            
            const result = await response.json();
            
            if (result.success) {
                updateDigitAnalysis(result.data, result.digit_frequency);
            } else {
                showMessage(result.message);
            }
        } catch (error) {
            showMessage(`Error: ${error.message}`);
        }
    }
    
    // Function to handle trade execution
    async function handleExecuteTrade() {
        if (!isLoggedIn) {
            showMessage('Please login first');
            return;
        }
        
        try {
            const contractType = contractTypeSelect.value;
            const stakeAmount = parseFloat(stakeAmountInput.value);
            const targetProfit = parseFloat(targetProfitInput.value);
            const stopLoss = parseFloat(stopLossInput.value);
            const martingaleStart = parseFloat(martingaleStartInput.value);
            const maxMartingale = parseFloat(maxMartingaleInput.value);
            
            // Validate inputs
            if (isNaN(stakeAmount) || stakeAmount <= 0) {
                showMessage('Stake amount must be a positive number');
                return;
            }
            
            if (isNaN(targetProfit) || targetProfit <= 0) {
                showMessage('Target profit must be a positive number');
                return;
            }
            
            if (isNaN(stopLoss) || stopLoss <= 0) {
                showMessage('Stop loss must be a positive number');
                return;
            }
            
            // Execute the trade
            executeTradeBtn.disabled = true;
            isTrading = true;
            
            const response = await fetch('/execute_trade', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    contract_type: contractType,
                    stake_amount: stakeAmount,
                    target_profit: targetProfit,
                    stop_loss: stopLoss,
                    martingale_start: martingaleStart,
                    max_martingale: maxMartingale,
                    market: currentMarket
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showMessage(`Trade executed: ${result.result.is_win ? 'WIN' : 'LOSS'}, Profit: ${result.result.profit.toFixed(2)}`);
                getAccountInfo();
            } else {
                showMessage(result.message);
            }
            
            executeTradeBtn.disabled = false;
        } catch (error) {
            showMessage(`Error: ${error.message}`);
            executeTradeBtn.disabled = false;
        }
    }
    
    // Function to handle pause/resume
    async function handlePauseResume() {
        if (!isLoggedIn) {
            showMessage('Please login first');
            return;
        }
        
        try {
            if (isPaused) {
                // Resume trading
                const response = await fetch('/resume_trading', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'}
                });
                
                const result = await response.json();
                
                if (result.success) {
                    isPaused = false;
                    pauseBtn.textContent = 'Pause';
                    showMessage('Trading resumed');
                } else {
                    showMessage(result.message);
                }
            } else {
                // Pause trading
                const response = await fetch('/pause_trading', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'}
                });
                
                const result = await response.json();
                
                if (result.success) {
                    isPaused = true;
                    pauseBtn.textContent = 'Resume';
                    showMessage('Trading paused');
                } else {
                    showMessage(result.message);
                }
            }
        } catch (error) {
            showMessage(`Error: ${error.message}`);
        }
    }
    
    // Function to handle break after win
    async function handleBreakAfterWin() {
        if (!isLoggedIn) {
            showMessage('Please login first');
            return;
        }
        
        try {
            const response = await fetch('/break_after_win', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}
            });
            
            const result = await response.json();
            
            if (result.success) {
                breakAfterWin = true;
                breakBtn.style.backgroundColor = '#ff4a3d';
                showMessage('Bot will break after win');
            } else {
                showMessage(result.message);
            }
        } catch (error) {
            showMessage(`Error: ${error.message}`);
        }
    }
    
    // Function to get account information
    async function getAccountInfo() {
        if (!isLoggedIn) return;
        
        try {
            const response = await fetch('/account_info', {
                method: 'GET',
                headers: {'Content-Type': 'application/json'}
            });
            
            const result = await response.json();
            
            if (result.success) {
                const data = result.data;
                
                // Update account info
                startBalanceEl.textContent = parseFloat(data.initial_balance || 0).toFixed(2);
                currentBalanceEl.textContent = parseFloat(data.balance || 0).toFixed(2);
                profitLossEl.textContent = parseFloat(data.profit_loss || 0).toFixed(2);
                tradeStatsEl.textContent = `${data.wins || 0} Wins / ${data.losses || 0} Losses`;
                
                // Color the profit/loss
                const profitLoss = parseFloat(data.profit_loss || 0);
                profitLossEl.style.color = profitLoss >= 0 ? '#4CAF50' : '#F44336';
            }
        } catch (error) {
            console.error('Error getting account info:', error);
        }
    }
    
    // Function to update digit analysis display
    function updateDigitAnalysis(data, frequency) {
        // Update digit history
        if (data.last_digits) {
            digitHistory = data.last_digits;
            updateLastDigitHistory();
        }
        
        // Update digit frequency counter
        for (let i = 0; i < 10; i++) {
            lastDigitCount[i] = frequency[i] || 0;
        }
        
        // Update digit indicator display
        updateDigitIndicator();
        
        // Update digit counter display
        updateDigitCounter();
    }
    
    // Function to update digit indicator display
    function updateDigitIndicator() {
        if (digitHistory.length === 0) {
            digitIndicatorEl.textContent = '- - | - | - | - | - | - | -';
            return;
        }
        
        // Get the last 7 digits, padded with placeholders if needed
        const lastSeven = Array(7).fill('-');
        for (let i = 0; i < Math.min(7, digitHistory.length); i++) {
            lastSeven[6 - i] = digitHistory[digitHistory.length - 1 - i];
        }
        
        // Format the display: "A B | C | D | E | F | G | H"
        digitIndicatorEl.textContent = `${lastSeven[0]} ${lastSeven[1]} | ${lastSeven[2]} | ${lastSeven[3]} | ${lastSeven[4]} | ${lastSeven[5]} | ${lastSeven[6]} `;
    }
    
    // Function to update digit counter display
    function updateDigitCounter() {
        // Find the most frequent digits
        const sortedDigits = Object.entries(lastDigitCount)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
        
        // Display top 7 digits
        const topSeven = sortedDigits.slice(0, 7);
        // Pad with placeholders if needed
        while (topSeven.length < 7) {
            topSeven.push('-');
        }
        
        // Format the display: "A B | C | D | E | F | G | H"
        digitCounterEl.textContent = `${topSeven[0]} ${topSeven[1]} | ${topSeven[2]} | ${topSeven[3]} | ${topSeven[4]} | ${topSeven[5]} | ${topSeven[6]} `;
    }
    
    // Function to update last digit history
    function updateLastDigitHistory() {
        lastDigitHistoryEl.innerHTML = '';
        
        // Display last 10 digits
        const lastTen = digitHistory.slice(-10);
        
        for (const digit of lastTen) {
            const li = document.createElement('li');
            li.textContent = digit;
            
            // Color code the digit
            if (digit >= 0 && digit <= 9) {
                // Use a color gradient based on the digit value
                const hue = Math.floor(digit * 36); // 0-9 maps to 0-324 degrees
                li.style.backgroundColor = `hsl(${hue}, 70%, 30%)`;
            }
            
            lastDigitHistoryEl.appendChild(li);
        }
    }
    
    // Function to show messages to the user
    function showMessage(message) {
        console.log(message);
        // You could implement a toast or notification system here
        alert(message);
    }
    
    // Function to handle running a backtest
    async function handleRunBacktest() {
        if (!isLoggedIn) {
            showMessage('Please login first');
            return;
        }
        
        try {
            // Get backtest configuration from UI
            const contractType = document.getElementById('backtest-contract-type').value;
            const stakeAmount = parseFloat(document.getElementById('backtest-stake-amount').value);
            const martingaleEnabled = document.getElementById('backtest-martingale-enabled').checked;
            const martingaleStart = parseInt(document.getElementById('backtest-martingale-start').value);
            const maxMartingale = parseInt(document.getElementById('backtest-max-martingale').value);
            const minConfidence = parseFloat(document.getElementById('backtest-min-confidence').value);
            const windowSize = parseInt(document.getElementById('backtest-window-size').value);
            const market = document.getElementById('backtest-market').value;
            const dataPoints = parseInt(document.getElementById('backtest-data-points').value);
            
            // Validate inputs
            if (isNaN(stakeAmount) || stakeAmount <= 0) {
                showMessage('Stake amount must be a positive number');
                return;
            }
            
            // Disable run button during backtest
            const runBacktestBtn = document.getElementById('run-backtest-btn');
            runBacktestBtn.disabled = true;
            runBacktestBtn.textContent = 'Running...';
            
            // Send backtest request to server
            const response = await fetch('/backtest', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    contract_type: contractType,
                    stake_amount: stakeAmount,
                    martingale_enabled: martingaleEnabled,
                    martingale_start: martingaleStart,
                    max_martingale: maxMartingale,
                    min_confidence: minConfidence,
                    window_size: windowSize,
                    market: market,
                    data_points: dataPoints
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                displayBacktestResults(result.results);
                showMessage('Backtest completed successfully');
            } else {
                showMessage(result.message || 'Error running backtest');
            }
            
            // Re-enable run button
            runBacktestBtn.disabled = false;
            runBacktestBtn.textContent = 'Run Backtest';
        } catch (error) {
            showMessage(`Error: ${error.message}`);
            document.getElementById('run-backtest-btn').disabled = false;
            document.getElementById('run-backtest-btn').textContent = 'Run Backtest';
        }
    }
    
    // Function to display backtest results
    function displayBacktestResults(results) {
        // Update summary stats
        document.getElementById('backtest-total-trades').textContent = results.total_trades;
        document.getElementById('backtest-win-rate').textContent = `${(results.win_rate * 100).toFixed(2)}%`;
        document.getElementById('backtest-profit-loss').textContent = results.profit_loss.toFixed(2);
        document.getElementById('backtest-max-cons-wins').textContent = results.max_consecutive_wins;
        document.getElementById('backtest-max-cons-losses').textContent = results.max_consecutive_losses;
        document.getElementById('backtest-max-drawdown').textContent = results.max_drawdown.toFixed(2);
        document.getElementById('backtest-profit-factor').textContent = results.profit_factor.toFixed(2);
        document.getElementById('backtest-avg-win').textContent = results.avg_win.toFixed(2);
        document.getElementById('backtest-avg-loss').textContent = results.avg_loss.toFixed(2);
        
        // Color the profit/loss
        const profitLossEl = document.getElementById('backtest-profit-loss');
        profitLossEl.style.color = results.profit_loss >= 0 ? '#4CAF50' : '#F44336';
        
        // Display trade details in the table
        const tableBody = document.getElementById('backtest-trades-body');
        tableBody.innerHTML = '';
        
        results.trades.forEach((trade, index) => {
            const row = document.createElement('tr');
            
            // Add cells
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${trade.prediction}</td>
                <td>${trade.actual}</td>
                <td style="color: ${trade.result === 'win' ? '#4CAF50' : '#F44336'}">${trade.result}</td>
                <td>${trade.stake.toFixed(2)}</td>
                <td style="color: ${trade.profit_loss >= 0 ? '#4CAF50' : '#F44336'}">${trade.profit_loss.toFixed(2)}</td>
                <td>${trade.balance.toFixed(2)}</td>
                <td>${trade.confidence.toFixed(2)}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Create equity curve chart
        createEquityCurve(results.trades);
    }
    
    // Function to create equity curve chart
    function createEquityCurve(trades) {
        // Extract cumulative balance from trades
        const balances = trades.map(trade => trade.balance);
        const tradeNumbers = trades.map((_, index) => index + 1);
        
        // Create the chart using Plotly
        const data = [{
            x: tradeNumbers,
            y: balances,
            type: 'scatter',
            mode: 'lines',
            name: 'Account Balance',
            line: {
                color: '#ff6f61',
                width: 2
            }
        }];
        
        const layout = {
            title: 'Equity Curve',
            xaxis: {
                title: 'Trade Number'
            },
            yaxis: {
                title: 'Balance'
            },
            plot_bgcolor: '#1e1e1e',
            paper_bgcolor: '#1e1e1e',
            font: {
                color: '#ffffff'
            }
        };
        
        Plotly.newPlot('equity-curve-chart', data, layout);
    }
    
    // Function to update all UI elements periodically
    async function updateUI() {
        if (isLoggedIn) {
            await getAccountInfo();
            
            if (!isPaused) {
                await selectMarket(currentMarket);
            }
        }
    }
    
    // Set up periodic UI updates
    setInterval(updateUI, 5000);
});
