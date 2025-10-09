// config.js - Configuration for Budget Dashboard

// Department colors
export const DEPARTMENT_COLORS = {
    'Statsministerens kontor': '#E11926',
    'Arbeids- og inkluderingsdepartementet': '#3b82f6',
    'Finansdepartementet': '#22c55e',
    'Forsvarsdepartementet': '#ef4444',
    'Helse- og omsorgsdepartementet': '#f59e0b',
    'Justis- og beredskapsdepartementet': '#8b5cf6',
    'Klima- og miljødepartementet': '#10b981',
    'Kommunal- og distriktsdepartementet': '#06b6d4',
    'Kulturdepartementet': '#ec4899',
    'Kunnskapsdepartementet': '#f97316',
    'Landbruks- og matdepartementet': '#84cc16',
    'Nærings- og fiskeridepartementet': '#6366f1',
    'Olje- og energidepartementet': '#eab308',
    'Samferdselsdepartementet': '#14b8a6',
    'Utenriksdepartementet': '#a855f7'
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

