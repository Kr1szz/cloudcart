const { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  InitiateAuthCommand, 
  GetUserCommand 
} = require("@aws-sdk/client-cognito-identity-provider");
const logger = require("../utils/logger");

const region = process.env.AWS_REGION || 'us-east-1';
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;

let cognitoClient = null;

// Initialize cognito client if credentials and IDs are present
if (userPoolId && clientId && clientId !== 'xxxxxxxxxxxxxxxxxxxxxxxxxx') {
  try {
    const config = { region };
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'YOUR_AWS_ACCESS_KEY_ID') {
      config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      };
    }
    cognitoClient = new CognitoIdentityProviderClient(config);
    logger.info("Cognito Identity Provider client initialized.");
  } catch (error) {
    logger.warn("Failed to initialize AWS Cognito client, using local DB authentication fallback:", error.message);
  }
} else {
  logger.warn("Cognito environment variables missing or default. Falling back to local JWT auth.");
}

/**
 * Register a user on Cognito User Pool
 */
const cognitoRegister = async (username, email, password) => {
  if (!cognitoClient) {
    logger.debug("Cognito not configured. Skipping remote registration.");
    return null;
  }

  try {
    const command = new SignUpCommand({
      ClientId: clientId,
      Username: username,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email }
      ]
    });
    
    const response = await cognitoClient.send(command);
    logger.info("User registered in Cognito successfully", { username, userSub: response.UserSub });
    return response.UserSub;
  } catch (error) {
    logger.error("Cognito registration error", { error: error.message });
    throw error;
  }
};

/**
 * Login a user on Cognito User Pool
 */
const cognitoLogin = async (username, password) => {
  if (!cognitoClient) {
    logger.debug("Cognito not configured. Skipping remote login.");
    return null;
  }

  try {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    });

    const response = await cognitoClient.send(command);
    logger.info("Cognito authentication successful", { username });
    
    return {
      accessToken: response.AuthenticationResult.AccessToken,
      idToken: response.AuthenticationResult.IdToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      expiresIn: response.AuthenticationResult.ExpiresIn
    };
  } catch (error) {
    logger.error("Cognito login error", { error: error.message });
    throw error;
  }
};

/**
 * Validate JWT Token via Cognito (by fetching User info)
 */
const cognitoValidateToken = async (accessToken) => {
  if (!cognitoClient) {
    return null;
  }

  try {
    const command = new GetUserCommand({
      AccessToken: accessToken
    });
    const response = await cognitoClient.send(command);
    return response;
  } catch (error) {
    logger.error("Cognito token validation failed", { error: error.message });
    throw error;
  }
};

module.exports = {
  cognitoClient,
  cognitoRegister,
  cognitoLogin,
  cognitoValidateToken
};
