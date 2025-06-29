// API Configuration
// IMPORTANT: Replace with your actual OpenWeatherMap API key
// Get your API key from: https://openweathermap.org/api
// Sign up at: https://home.openweathermap.org/users/sign_up
const config = {
    OPENWEATHER_API_KEY: "YOUR_API_KEY_HERE" // Replace this with your actual API key
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} 