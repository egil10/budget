// config.js - Configuration for Budget Dashboard

// Department colors
export const DEPARTMENT_COLORS = {
    'Statsministerens kontor': '#BA0C2F', // deep Norwegian red (flag-inspired)
    'Arbeids- og inkluderingsdepartementet': '#1E40AF', // work & inclusion – trustworthy navy blue
    'Finansdepartementet': '#166534', // finance – dark green, stability
    'Forsvarsdepartementet': '#7F1D1D', // defense – dark red/burgundy, discipline
    'Helse- og omsorgsdepartementet': '#F59E0B', // health – warm amber, energy
    'Justis- og beredskapsdepartementet': '#4338CA', // justice – royal blue, authority
    'Klima- og miljødepartementet': '#15803D', // climate – forest green
    'Kommunal- og distriktsdepartementet': '#0E7490', // local govt – fjord teal
    'Kulturdepartementet': '#BE185D', // culture – vibrant magenta, creativity
    'Kunnskapsdepartementet': '#C2410C', // education – burnt orange, curiosity
    'Landbruks- og matdepartementet': '#65A30D', // agriculture – earthy green
    'Nærings- og fiskeridepartementet': '#2563EB', // trade & fisheries – sea blue
    'Olje- og energidepartementet': '#EAB308', // oil & energy – gold/yellow
    'Samferdselsdepartementet': '#0891B2', // transport – clean turquoise, motion
    'Utenriksdepartementet': '#6D28D9' // foreign affairs – royal purple, diplomacy
};

// Chart configuration
export const CHART_CONFIG = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Disable animations to prevent resizing issues
    interaction: {
        intersect: false,
        mode: 'index'
    },
    plugins: {
        legend: {
            display: false // Hide legend for small charts
        },
        tooltip: {
            enabled: false // Disable tooltips for small charts
        }
    },
    scales: {
        y: {
            beginAtZero: false,
            display: false, // Hide Y axis for small charts
            grid: {
                display: false
            }
        },
        x: {
            display: false, // Hide X axis for small charts
            grid: {
                display: false
            }
        }
    },
    elements: {
        point: {
            radius: 0,
            hoverRadius: 0
        },
        line: {
            tension: 0.1,
            borderWidth: 3
        }
    }
};

// Format amount as Norwegian currency
export function formatAmount(amount) {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    
    return new Intl.NumberFormat('nb-NO', {
        style: 'currency',
        currency: 'NOK',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format large numbers with abbreviations
export function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + ' mrd';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + ' mill';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + ' k';
    }
    return num.toString();
}

