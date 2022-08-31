

export class MermaidRunner {
    public run() {
        var spawn = require('child_process').spawn;
        var prc = spawn('npx', ['-p', '@mermaid-js/mermaid-cli', 'mmdc', '-h']);

        //noinspection JSUnresolvedFunction
        prc.stdout.setEncoding('utf8');
        prc.stdout.on('data', function (data: any) {
            var str = data.toString();
            var lines = str.split(/(\r?\n)/g);
            console.log(lines.join(""));
        });

        prc.on('close', function (code: any) {
            console.log('process exit code ' + code);
        });
    }

    public run2() {
        try {
            //https://www.codegrepper.com/code-examples/javascript/nodejs+execsync
            var execSync = require('child_process').execSync;
            var user = execSync('npx -p @mermaid-js/mermaid-cli mmdc -h').toString();
        } catch (e) {
            console.log(e);
        }
    }

    // https://stackoverflow.com/questions/30134236/use-child-process-execsync-but-keep-output-in-console
    public convert(inputFile: string, outputFile: string) {
        try {
            //https://www.codegrepper.com/code-examples/javascript/nodejs+execsync
            var execSync = require('child_process').execSync;
            var user = execSync(`npx -p @mermaid-js/mermaid-cli mmdc -i ${inputFile} -o ${outputFile}`).toString();
        } catch (e) {
            console.log(e);
        }
    }
}
