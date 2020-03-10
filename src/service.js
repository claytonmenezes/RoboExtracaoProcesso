var Service = require('node-windows').Service

var svc = new Service({
    name:'Robo Extração Processo',
    description: '',
    script: __dirname + '/index.js'
})

svc.on('install',function(){
    svc.start()
});

svc.install()