module.exports = {
  server: {
    appId: '53509fcc-be66-4f8c-9da1-79dfa9e3a030',
    masterKey: '1c11ca6f-c6b7-437a-9e42-366e88a3bf79',
    databaseURI: 'mongodb://localhost:27017/facturiva',
    serverURL: 'http://localhost:1337/parse'
  },
  dashboard: {
    apps: [
      {
        appId: '53509fcc-be66-4f8c-9da1-79dfa9e3a030',
        serverURL: 'http://localhost:1337/parse',
        masterKey: '1c11ca6f-c6b7-437a-9e42-366e88a3bf79',
        appName: 'Facturiva'
      }
    ],
    users: [
      {
        user: '53509fcc-be66-4f8c-9da1-79dfa9e3a030',
        pass: '1c11ca6f-c6b7-437a-9e42-366e88a3bf79'
      }
    ]
  }
};
