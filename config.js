// API Configuration
// IMPORTANT: Replace with your actual OpenWeatherMap API key
// Get your API key from: https://openweathermap.org/api
// Sign up at: https://home.openweathermap.org/users/sign_up
const config = {
    OPENWEATHER_API_KEY: "05ee2fa2f012b05e42b698786021cec2" // Your actual API key for live deployment
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} 