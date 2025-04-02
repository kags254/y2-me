# YELLOW MAX POOL Trading Bot - Quick Start Guide

This guide will help you quickly set up and start using the YELLOW MAX POOL Trading Bot.

## Prerequisites

- Python 3.8 or higher
- PostgreSQL database
- Binary.com/Deriv.com API token (for live trading)

## Installation

1. **Clone or download the repository**

2. **Install dependencies**
   ```
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your database credentials and API token
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/tradingbot
   SESSION_SECRET=your_secure_random_string_here
   BINARY_API_TOKEN=your_api_token_here
   ```

4. **Initialize the database**
   - The application will automatically create the required tables on first run

## Running the Application

1. **Start the server**
   ```
   python main.py
   ```

2. **Access the web interface**
   - Open your browser and navigate to: `http://localhost:5000`

## First-Time Login

1. Enter your Binary.com/Deriv.com API token
2. The system will create a user account automatically based on your API information

## Basic Usage

1. **Select a market** from the dropdown menu
2. **Configure trading parameters**:
   - Contract type (matches/differs, even/odd, over/under)
   - Stake amount
   - Target profit
   - Stop loss
3. **Start trading** by clicking the "Start Auto Trading" button
4. **Monitor performance** in the dashboard

## Backtesting

1. Go to the "Backtest" tab
2. Select the market and date range
3. Configure strategy parameters
4. Click "Run Backtest" to see how your strategy would have performed

## Support

If you encounter any issues, please check the following:
- Ensure your API token is valid and has trading permissions
- Check the database connection details
- Review the application logs for error messages

For additional help, please create an issue on the project repository.

Happy trading!