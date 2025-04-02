// Charts and visualization for the trading bot
class DigitAnalysisCharts {
    constructor() {
        this.digitFrequencyChart = null;
        this.lastDigitsChart = null;
        this.probabilityChart = null;
    }

    // Initialize charts
    initCharts() {
        this.initDigitFrequencyChart();
        this.initLastDigitsChart();
        this.initProbabilityChart();
    }

    // Create the digit frequency chart
    initDigitFrequencyChart() {
        const digitFrequencyData = {
            x: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            y: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            type: 'bar',
            marker: {
                color: 'rgba(255, 111, 97, 0.7)'
            }
        };

        const layout = {
            title: 'Digit Frequency',
            paper_bgcolor: '#2a2a40',
            plot_bgcolor: '#2a2a40',
            font: {
                color: '#ffffff'
            },
            margin: {
                l: 40,
                r: 20,
                t: 40,
                b: 40
            },
            xaxis: {
                title: 'Digit',
                tickfont: {
                    color: '#ffffff'
                }
            },
            yaxis: {
                title: 'Frequency',
                tickfont: {
                    color: '#ffffff'
                }
            }
        };

        const config = {
            responsive: true
        };

        // Create the chart if container exists
        const container = document.getElementById('digit-frequency-chart');
        if (container) {
            this.digitFrequencyChart = Plotly.newPlot(container, [digitFrequencyData], layout, config);
        }
    }

    // Create the last digits chart
    initLastDigitsChart() {
        const lastDigitsData = {
            y: [],
            mode: 'lines+markers',
            line: {
                color: 'rgba(255, 111, 97, 1)',
                width: 2
            },
            marker: {
                color: 'rgba(255, 111, 97, 1)',
                size: 8
            }
        };

        const layout = {
            title: 'Last Digits Trend',
            paper_bgcolor: '#2a2a40',
            plot_bgcolor: '#2a2a40',
            font: {
                color: '#ffffff'
            },
            margin: {
                l: 40,
                r: 20,
                t: 40,
                b: 40
            },
            xaxis: {
                title: 'Tick',
                tickfont: {
                    color: '#ffffff'
                }
            },
            yaxis: {
                title: 'Digit',
                tickfont: {
                    color: '#ffffff'
                },
                range: [-0.5, 9.5],
                tickvals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            }
        };

        const config = {
            responsive: true
        };

        // Create the chart if container exists
        const container = document.getElementById('last-digits-chart');
        if (container) {
            this.lastDigitsChart = Plotly.newPlot(container, [lastDigitsData], layout, config);
        }
    }

    // Create the probability chart
    initProbabilityChart() {
        const probabilityData = {
            x: ['Matches', 'Differs', 'Over', 'Under', 'Even', 'Odd'],
            y: [0, 0, 0, 0, 0, 0],
            type: 'bar',
            marker: {
                color: ['#ff6f61', '#61a0ff', '#61ffb4', '#ffb461', '#a361ff', '#ff61b4']
            }
        };

        const layout = {
            title: 'Contract Probabilities',
            paper_bgcolor: '#2a2a40',
            plot_bgcolor: '#2a2a40',
            font: {
                color: '#ffffff'
            },
            margin: {
                l: 40,
                r: 20,
                t: 40,
                b: 40
            },
            xaxis: {
                tickfont: {
                    color: '#ffffff'
                }
            },
            yaxis: {
                title: 'Probability',
                tickfont: {
                    color: '#ffffff'
                },
                range: [0, 1]
            }
        };

        const config = {
            responsive: true
        };

        // Create the chart if container exists
        const container = document.getElementById('probability-chart');
        if (container) {
            this.probabilityChart = Plotly.newPlot(container, [probabilityData], layout, config);
        }
    }

    // Update the digit frequency chart
    updateDigitFrequencyChart(frequency) {
        if (!this.digitFrequencyChart) {
            this.initDigitFrequencyChart();
        }

        const container = document.getElementById('digit-frequency-chart');
        if (!container) return;

        const yValues = [];
        for (let i = 0; i < 10; i++) {
            yValues.push(frequency[i] || 0);
        }

        Plotly.update(container, {
            y: [yValues]
        });
    }

    // Update the last digits chart
    updateLastDigitsChart(digits) {
        if (!this.lastDigitsChart) {
            this.initLastDigitsChart();
        }

        const container = document.getElementById('last-digits-chart');
        if (!container) return;

        Plotly.update(container, {
            y: [digits]
        });
    }

    // Update the probability chart
    updateProbabilityChart(probabilities) {
        if (!this.probabilityChart) {
            this.initProbabilityChart();
        }

        const container = document.getElementById('probability-chart');
        if (!container) return;

        const yValues = [
            probabilities.matches || 0,
            probabilities.differs || 0,
            probabilities.over || 0,
            probabilities.under || 0,
            probabilities.even || 0,
            probabilities.odd || 0
        ];

        Plotly.update(container, {
            y: [yValues]
        });
    }
}

// Initialize charts when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if Plotly is available
    if (typeof Plotly !== 'undefined') {
        const charts = new DigitAnalysisCharts();
        charts.initCharts();
        
        // Make charts available globally
        window.digitCharts = charts;
    }
});
