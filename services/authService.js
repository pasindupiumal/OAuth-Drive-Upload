const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const config = require('../config');

const tokenPath = config.TOKEN_PATH;
const SCOPES = config.SCOPES;


const AuthService = function() {

    this.authorize = (code) => {

        return new Promise((resolve, reject) => {

            this.getCredentials().then(credentials => {

                const {client_secret, client_id, redirect_uris} = credentials.data.web;
                const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

                fs.readFile(tokenPath, (error, token) => {

                    if(error){

                        const authUrl = oAuth2Client.generateAuthUrl({
                            access_type: 'offline',
                            scope: SCOPES,
                        });

                        oAuth2Client.getToken(code, (error, token) => {

                            if(error){
                                reject({status:500, message: 'Error retreving access token. : ' + error});
                            }

                            oAuth2Client.setCredentials(token);

                            fs.writeFile(tokenPath, JSON.stringify(token), (error) => {

                                if(error){

                                    reject({status:500, message: 'Error writing token data to token file. : ' + error});
                                }

                                resolve({status: 200, message: 'New token obtained. Token file updated successfully', data: null});
                           
                            });
                    
                        });
                    }
                    else{

                        oAuth2Client.setCredentials(JSON.parse(token));
                        resolve({status:200, messaeg: 'Token found. Setting credentials', data: null});
                    }
                   
             
                });


            }).catch(error => {

                reject({status: error.status, message:error.message});
            });

        });
    }

    this.getCredentials = () => {

        return new Promise((resolve, reject) => {

            fs.readFile('credentials.json', (error, content) => {

                if (error){

                    reject({status: 500, message: 'Error loading credentials file - ' + error});
                }

                resolve({status: 200, message: 'Credentials retrieved', data: JSON.parse(content)});


            });

        });
    }

    this.getAuthenticationUrl = () => {

        return new Promise((resolve, reject) => {

            this.getCredentials().then(credentials => {

                const {client_secret, client_id, redirect_uris} = credentials.data.web;
                const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

                const authUrl = oAuth2Client.generateAuthUrl({
                    access_type: 'offline',
                    scope: SCOPES,
                });

                resolve({status: 200, message: 'Authentication url obtained', data: authUrl});

            }).catch(error => {

                reject({status: 500, message:error.message});
            });

        });
    }

}

module.exports = new AuthService();