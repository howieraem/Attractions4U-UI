import { CognitoUserPool } from 'amazon-cognito-identity-js';

var config = require('./config');

export default new CognitoUserPool(config.cognitoPoolData);