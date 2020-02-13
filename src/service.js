var Service = require('node-windows').Service

var svc = new Service({
    name:'Agilus ShortLink',
    description: 'Encurtador de Links',
    script: __dirname + '/index.js'
})

svc.on('install',function(){
    svc.start()
});

svc.install()