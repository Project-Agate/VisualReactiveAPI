var exec = require('child_process').exec

function build() {
  exec('tsc --module "commonjs" server.ts demo.ts',
    function (error, stdout, stderr) {
      console.log(stdout);
      if(stderr !== '')
        console.log('stderr: ' + stderr);
      if (error !== null)
        console.log('exec error: ' + error);
  });
}

build();
