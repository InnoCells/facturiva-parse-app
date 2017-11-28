module.exports = {
  server: {
    appId: 'facturiva-parse-dev',
    masterKey: 'a2226c86-5508-4008-bdcb-a078637ca731',
    databaseURI:
      'mongodb://facturivaparsedevdb-parse:aUXkxvqqxSfcVrSqVVYI8gzvOzTBsgDgk2EmuMb7rkAEeQQjt632PArGiiFe2fSrDpy7CD379Tl7YveqbslJ6g==@facturivaparsedevdb-parse.documents.azure.com:10250/parse?ssl=true',
    serverURL: 'http://localhost:1337/parse'
  },
  dashboard: {
    apps: [
      {
        appId: 'facturiva-parse-dev',
        serverURL: 'http://localhost:1337/parse',
        masterKey: 'a2226c86-5508-4008-bdcb-a078637ca731',
        appName: 'Facturiva'
      }
    ],
    users: [
      {
        user: 'parse',
        pass:
          'aUXkxvqqxSfcVrSqVVYI8gzvOzTBsgDgk2EmuMb7rkAEeQQjt632PArGiiFe2fSrDpy7CD379Tl7YveqbslJ6g=='
      }
    ]
  }
};

//mongodb://facturivaparsedevdb-parse:aUXkxvqqxSfcVrSqVVYI8gzvOzTBsgDgk2EmuMb7rkAEeQQjt632PArGiiFe2fSrDpy7CD379Tl7YveqbslJ6g==@facturivaparsedevdb-parse.documents.azure.com:10250/parse?ssl=true
