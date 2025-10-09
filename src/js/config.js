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
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#1f2937',
                font: {
                    size: 12,
                    family: 'Inter, sans-serif'
                }
            }
        },
        tooltip: {
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card').trim() || '#ffffff',
            titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#1f2937',
            bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#1f2937',
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#e5e7eb',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('nb-NO', {
                            style: 'currency',
                            currency: 'NOK',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(context.parsed.y);
                    }
                    return label;
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--grid').trim() || '#e5e7eb'
            },
            ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#6b7280',
                font: {
                    size: 11,
                    family: 'Inter, sans-serif'
                },
                callback: function(value) {
                    if (value >= 1000000000) {
                        return (value / 1000000000).toFixed(1) + ' Mrd';
                    } else if (value >= 1000000) {
                        return (value / 1000000).toFixed(1) + ' Mill';
                    }
                    return value.toLocaleString('nb-NO');
                }
            }
        },
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#6b7280',
                font: {
                    size: 11,
                    family: 'Inter, sans-serif'
                }
            }
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

