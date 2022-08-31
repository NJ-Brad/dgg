 import { CommandProcessor } from './CommandProcessor';

    console.log('DC - Dependency Chart Creator');

    var cp : CommandProcessor = new CommandProcessor();
    cp.process(process.argv.slice(2));
