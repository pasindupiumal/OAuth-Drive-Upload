const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const config = require('../config');
const multer = require('multer');
const { oauth2 } = require('googleapis/build/src/apis/oauth2');

const tokenPath = config.TOKEN_PATH;
const SCOPES = config.SCOPES;

var {client_secret, client_id, redirect_uris} = "";
var oAuth2Client = "";

const AuthService = function() {

    this.storage = multer.diskStorage({

        destination: function(req, file, callback) {
            callback(null, './public/files');
        },
        filename: function(req, file, callback) {
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        }
    });

    this.upload = multer({

        storage: this.storage,

    }).single('file');


    this.authorize = (code) => {

        return new Promise((resolve, reject) => {

            this.setOAuthClient().then(data => {

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

            this.setOAuthClient().then(data => {

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

    this.getUserInformation = () => {

        return new Promise((resolve, reject) => {

            this.setOAuthClient().then(data => {

                const oAuth2 = google.oauth2({

                    auth:oAuth2Client,
                    version: 'v2'
                });

                oAuth2.userinfo.get((error, response) => {

                    if(error){

                        reject({status:500, message: 'Error retrieving infomration of user - ' + error});
                    }
                    else{
                        resolve({status: 200, message: 'User information retrieved successfully', data: response});
                    }
                });

            }).catch(error => {

                reject({status: 500, message:error.message});
            });

        });
    }

    this.setOAuthClient = () => {

        return new Promise((resolve, reject) => {

            this.getCredentials().then(credentials => {

                if(credentials.data.web){
                    ({client_secret, client_id, redirect_uris} = credentials.data.web);
                }

                if( oAuth2Client === "" ){
                    console.log('Client has not been set. Setting up');
                    oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
                }

                resolve({status:200, message:'OAuth client set successfully', data: null});

            }).catch(error => {

                reject({status: 500, message:error.message});
            });

        });
    }

    this.uploadFile = (req, res) => {

        return new Promise((resolve, reject) => {

            this.upload(req, res, function(error) {

                if(error){ 

                    reject({status: 500, message: 'Multer error uploading file - '+ error});
                }
                else{

                    const gDrive = google.drive({
                        
                        version: 'v3',
                        auth: oAuth2Client
                    });

                    const filemetadata = {

                        name: req.file.filename
                    }

                    const media = {

                        mimeType: req.file.mimeType,
                        body: fs.createReadStream(req.file.path)
                    }

                    gDrive.files.create({

                        resource: filemetadata,
                        media: media,
                        fields: 'id'

                    }, (error, file) => {

                        if(error){
                            //Error during upload
                            reject({status: 500, message: 'Error uploading file to the google drive - ' + error});
                        }
                        else{

                            //Detele the file from the files folder
                            fs.unlinkSync(req.file.path);
                            resolve({status: 200, message: 'File successfully uploaded to google drive', data: file});
                        }

                    });

                    
                }
            });

        });
    }

    this.getFilesList = () => {

        return new Promise((resolve, reject) => {

            const gDrive = google.drive({

                version: 'v3',
                auth: oAuth2Client
            });

            gDrive.files.list({

                pageSize: 20,
                fields: 'nextPageToken, files(id, name, iconLink)',
            
            }, (error, result) => {

                if(error) {

                    reject({status: 500, message: 'Error retrieving files list from google drive - ' + error});
                }
                else{

                    const files = result.data.files;

                    if(files.length) {

                        console.log(files);
                        resolve({status: 200, message: 'Files retrieved successfully.', data: files});
                    }
                    else{

                        resolve({status: 200, message: 'No files found.', data: null});
                    }
                }
            })

        });
    }

    this.deleteFileById = (fileID) => {

        return new Promise((resolve, reject) => {

            const gDrive = google.drive({

                version: 'v3',
                auth: oAuth2Client
            });

            gDrive.files.delete({

                fileId: fileID

            }, (error, result) => {

                if(error){

                    reject({status: 500, message: 'Error removing file from google drive - ' + error});
                }
                else{

                    console.log(result);
                    resolve({status: 200, message: 'File removed successfully from google drive.', data: result});
                }
            })
        });
    }


}

module.exports = new AuthService();