/* 
* Create and export configuration variables
*/

// Container for all the enviroments
var environments = {};

// Staging (Default) enviorment
environments.staging = {
	'httpPort' : 1313,
	'httpsPort' : 3001,
	'envName' : 'staging'
};

// Production enviorments
environments.production = {
	'httpPort' : 5000,
	'httpsPort' : 5001,
	'envName' : 'production'
};

// Determine which enviorment was passed as a command line
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current enviroment is one of them
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;