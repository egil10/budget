/**
 * Configuration file for Statsbudsjettet application
 * Contains all configurable settings and constants
 */

const CONFIG = {
    // Data sources
    DATA_SOURCES: {
        '2024': './data/json/gul_bok_2024_datagrunnlag.json',
        '2025': './data/json/20241002_gulbok_data_til_publ.json',
        '2026': './data/json/2026_gulbok_datagrunnlag.json'
    },

    // Chart settings
    CHART: {
        WIDTH: 300,
        HEIGHT: 100,
        PADDING: 10,
        BOTTOM_PADDING: 15,
        LINE_WIDTH: 2,
        COLORS: {
            INCREASE: '#2E7D32',
            DECREASE: '#C62828',
            GRID: '#e5e5e5',
            TEXT: '#333333',
            TEXT_SECONDARY: '#666666'
        }
    },

    // Department abbreviations
    DEPARTMENT_ABBREVIATIONS: {
        'Arbeids- og inkluderingsdepartementet': 'AID',
        'Barne- og familiedepartementet': 'BFD',
        'Digitaliserings- og forvaltningsdepartementet': 'DFD',
        'Energidepartementet': 'ED',
        'Finansdepartementet': 'FIN',
        'Forsvarsdepartementet': 'FD',
        'Helse- og omsorgsdepartementet': 'HOD',
        'Justis- og beredskapsdepartementet': 'JD',
        'Klima- og miljødepartementet': 'KLD',
        'Kommunal- og distriktsdepartementet': 'KDD',
        'Kultur- og likestillingsdepartementet': 'KUD',
        'Kunnskapsdepartementet': 'KD',
        'Landbruks- og matdepartementet': 'LMD',
        'Nærings- og fiskeridepartementet': 'NFD',
        'Samferdselsdepartementet': 'SD',
        'Utenriksdepartementet': 'UD',
        'Ymse': 'YMSE'
    },

    // UI settings
    UI: {
        MOBILE_BREAKPOINT: 768,
        CARD_MIN_HEIGHT: 220,
        CARD_MOBILE_MIN_HEIGHT: 280,
        CHART_HEIGHT: 200,
        CHART_MOBILE_HEIGHT: 240
    },

    // Download settings
    DOWNLOAD: {
        CHART_HEIGHT: '38vh',
        CHART_MIN_HEIGHT: '260px',
        CARD_MIN_HEIGHT: '60vh',
        CARD_PADDING: '30px'
    },

    // Animation settings
    ANIMATION: {
        SCROLL_BEHAVIOR: 'smooth',
        CHART_DELAY: 100,
        COMPARISON_DELAY: 100
    },

    // Debug settings
    DEBUG: {
        ENABLED: false,
        LOG_LEVEL: 'info' // 'debug', 'info', 'warn', 'error'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}