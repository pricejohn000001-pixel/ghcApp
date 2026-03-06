/**
 * Judges Portfolio Mapper
 * Maps judges with their portfolio assignments
 */

// Portfolio assignments for judges (static data - update as needed)
const judgesPortfolios = {
    ashutosh_kumar: {
        portfolios: [
            'Administrative Committee',
            'Judicial Committee',
            'Library Committee'
        ],
        designation: 'Chief Justice',
        currentlyServing: true
    },
    michael_zothankhuma: {
        portfolios: [
            'Roster Committee',
            'Rules Committee'
        ],
        designation: 'Senior Judge',
        currentlyServing: true
    },
    kalyan_rai_surana: {
        portfolios: [
            'Infrastructure Committee',
            'IT Committee'
        ],
        designation: 'Judge',
        currentlyServing: true
    },
    // Add more judge portfolio mappings here
};

/**
 * Get portfolio information for a specific judge
 * @param {string} judgeId - The unique ID of the judge
 * @returns {object} Portfolio information
 */
export const getJudgePortfolio = (judgeId) => {
    return judgesPortfolios[judgeId] || {
        portfolios: [],
        designation: '',
        currentlyServing: false
    };
};

/**
 * Get all judges with their portfolio assignments
 * @param {array} judges - Array of judge objects from data.js
 * @returns {array} Judges with portfolio information
 */
export const getJudgesWithPortfolios = (judges) => {
    return judges.map(judge => ({
        ...judge,
        portfolio: getJudgePortfolio(judge.id)
    }));
};

/**
 * Filter judges by portfolio type
 * @param {array} judges - Array of judge objects
 * @param {string} portfolioType - Type of portfolio to filter by
 * @returns {array} Filtered judges
 */
export const getJudgesByPortfolio = (judges, portfolioType) => {
    const judgesWithPortfolios = getJudgesWithPortfolios(judges);
    return judgesWithPortfolios.filter(judge =>
        judge.portfolio.portfolios.includes(portfolioType)
    );
};

/**
 * Get currently serving judges
 * @param {array} judges - Array of judge objects
 * @returns {array} Currently serving judges
 */
export const getCurrentlyServingJudges = (judges) => {
    const judgesWithPortfolios = getJudgesWithPortfolios(judges);
    return judgesWithPortfolios.filter(judge =>
        judge.portfolio.currentlyServing
    );
};

/**
 * Update portfolio assignment for a judge
 * This would typically be done by an admin/content manager
 * @param {string} judgeId - Judge ID
 * @param {array} portfolios - Array of portfolio assignments
 */
export const updateJudgePortfolio = (judgeId, portfolios) => {
    if (judgesPortfolios[judgeId]) {
        judgesPortfolios[judgeId].portfolios = portfolios;
    } else {
        judgesPortfolios[judgeId] = {
            portfolios,
            designation: '',
            currentlyServing: true
        };
    }
};

export default {
    getJudgePortfolio,
    getJudgesWithPortfolios,
    getJudgesByPortfolio,
    getCurrentlyServingJudges,
    updateJudgePortfolio
};
