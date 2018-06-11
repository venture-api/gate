const plan = require('flightplan');


plan.target('development', {
    host: '192.168.0.106',
    username: 'fa',
    agent: process.env.SSH_AUTH_SOCK
}, {
    dir: 'gate'
});

plan.local(function(local) {
    local.silent();
    local.log('uploading updates...');
    const filesToCopy = local.exec('git ls-files', {
        silent: true
    });
    local.transfer(filesToCopy, plan.runtime.options.dir);
    local.transfer('pm2.json', plan.runtime.options.dir);
});

plan.remote(function(remote) {

    remote["with"]("cd " + plan.runtime.options.dir, () => {
        remote.log('installing dependencies...');
        remote.exec('npm i');
        // remote.log('pruning dependencies...');
        remote.exec('npm prune');
        // remote.exec('npm test');
        remote.log('reloading process...');
        remote.exec('pm2 reload pm2.json --env development');
    });
});
