This application will be interacting with the Confirmd Platform API, using Auth JWT:
To retrieve ACCESS Token
URL: https://manager.credence.ng/realms/confirmd-bench/protocol/openid-connect/token

import axios from "axios";

const options = {
method: 'POST',
url: 'https://manager.credence.ng/realms/confirmd-bench/protocol/openid-connect/token',
headers: {'Content-Type': 'application/x-www-form-urlencoded'},
data: {
grant_type: 'client_credentials',
client_id: '8c788bea-287b-4604-9af9-209c0aa832f4',
client_secret: 'MZK2J4PjRxQSgQjEWUjxpX49qfqWuE0L'
}
};

axios.request(options).then(function (response) {
console.log(response.data);
}).catch(function (error) {
console.error(error);
});

Response:

{"access_token":"eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJSRDA0V1Z5NDF0clVGZEJoR0F5Zk9RQjlGazdRZ1h3dE1MbWgxUTVIaENFIn0.eyJleHAiOjE3NjE5MzkwNjUsImlhdCI6MTc2MTkzODE2NSwianRpIjoidHJydGNjOjhjZTQ0MTE1LTZhNGMtNDQ3Yy04Y2JkLTIyOTY0MDk3YWQ5OSIsImlzcyI6Imh0dHBzOi8vbWFuYWdlci5jcmVkZW5jZS5uZy9yZWFsbXMvY29uZmlybWQtYmVuY2giLCJzdWIiOiJlM2NlYjg1Ny0yYTI0LTQ1NDctOWZmZC1kYjc3MTFlOWEzMmIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiI4Yzc4OGJlYS0yODdiLTQ2MDQtOWFmOS0yMDljMGFhODMyZjQiLCJhY3IiOiIxIiwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwiY2xpZW50SG9zdCI6IjE4NC4xNDYuMTg5LjYyIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtOGM3ODhiZWEtMjg3Yi00NjA0LTlhZjktMjA5YzBhYTgzMmY0IiwiY2xpZW50QWRkcmVzcyI6IjE4NC4xNDYuMTg5LjYyIiwiY2xpZW50X2lkIjoiOGM3ODhiZWEtMjg3Yi00NjA0LTlhZjktMjA5YzBhYTgzMmY0In0.fmDMxV3kpz_4mkz1QbfKVAb-mPRHtQXM9Nq7m7elGeCv9DnZSCQYGrp7BOJm_ZW-8fD5DHPKTo-ODaeNXHXJOl4Q2e5Y9svzvgXCUHHfXrl8hSdc46jFUaBpo3x3aEEap2KX08sNMY7Aqm5w-m_qkImFzTIPyzDi3vkapptMOUtwuP1P8Xm80ds6TZQc3Xv7jMCSXMLC7p4NT-s08vJrdwsN63PsKeMJaTg2_D2aRI6nkPLIzJLQAOKWihHDwz3XiQjW-IpH5UO0QuHu19SpRLxn0swzG_bcYvM-h5sxFyEP6-JAKqg8WuJt7sPOZU7UvXjAPfGM35BP8oZQRpQtKQ","expires_in":900,"refresh_expires_in":0,"token_type":"Bearer","not-before-policy":0,"scope":"profile email"}

The access_token is used for other requests to the platform
