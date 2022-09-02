import * as fs from 'fs';
import * as path from 'path';
import { StringBuilder } from './Stringbuilder';
import * as Crypto from 'crypto';
import { tmpdir } from 'os';

import { StringStream } from "./dsl/StringStream";
import { MermaidRunner } from "./MermaidRunner";

import { Block } from './dsl/Block';
import { BlockParser } from './dsl/BlockParser';

import { BlockToC4Converter} from "./dsl/c4/BlockToC4Converter";
import { C4Workspace } from "./dsl/c4/C4Workspace";
import { C4Publisher } from "./dsl/c4/c4Publisher";

import { BlockToFlowchartConverter} from "./dsl/flow/BlockToFlowchartConverter";
import { FlowchartWorkspace } from "./dsl/flow/FlowchartWorkspace";
import { FlowchartPublisher } from "./dsl/flow/FlowchartPublisher";

import {BlockToWorkItemsConverter} from "./Dsl/workItem/BlockToWorkItemsConverter";
import {WorkItemWorkspace} from "./Dsl/workItem/WorkItemWorkspace";
import {WorkItemPublisher} from "./Dsl/workItem/WorkItemPublisher";

import * as mdConvert from "./MarkdownToHtml";

export class CommandProcessor {

    public process(myArgs: string[]) {
        console.log('myArgs: ', myArgs);

        this.processDependencies(myArgs);

        // switch (myArgs[0].toLowerCase()) {
        //     case 'new':
        //         this.processNewCommand(myArgs);
        //         break;
        //     case 'edit':
        //         this.processEditCommand(myArgs);
        //         break;
        //     case 'import':
        //         this.processImportCommand(myArgs);
        //         break;
        //     case 'bind':
        //         this.processBindCommand(myArgs);
        //         break;
        //     case 'funcgen':
        //         this.processFuncGenCommand(myArgs);
        //         break;
        //     default:
        //         console.log('Sorry, that is not something I know how to do.');
        //         break;
        // }
    }

    processDependencies(myArgs: string[]) {
        // create the directory
        //this.createDirectories(myArgs[2]);
        console.log(myArgs[0]);

        var sourceFileName : string = myArgs[0];
        var destinationFolder : string = myArgs[1];

        // bindC4DslFile(sourceFileName: string, destinationFolder: string, rootFolder: string, navTree:StringBuilder) {
            var filename = this.fileNameOnly(sourceFileName);
    
    //        navTree.appendLine(`				<li><a href="#" class="page" onClick="newSite(\`my%20space%20section/combined.html\`)">${filename}</a></li>`);
    
            const fullText = fs.readFileSync(sourceFileName).toString('utf-8');
    
            var stream: StringStream;
            stream = new StringStream(fullText);
            
            var bp: BlockParser = new BlockParser();
            
            var block: Block = new Block();
            bp.parse(block.children, stream, 0);
            
            var btd: BlockToWorkItemsConverter = new BlockToWorkItemsConverter();
            
            var ws: WorkItemWorkspace = btd.convert(block);
            
            var publisher: WorkItemPublisher = new WorkItemPublisher();
            
            var newText = "";
            // var path = require('path');
            // var dirName = path.dirname(myArgs[0]);
            var outName : string;
            var imgName : string;
            var testFileName : string;
            var rnr: MermaidRunner = new MermaidRunner();
    
            outName = this.getTempFileName();
            imgName = path.join(destinationFolder, filename)+"-Gannt.png";
            testFileName = path.join(destinationFolder, filename)+"-Gannt.txt";
            newText = publisher.publish(ws);
            fs.writeFileSync(outName, newText);
            fs.writeFileSync(testFileName, newText);
            rnr.convert(`\"${outName}\"`, `\"${imgName}\"`);
            console.log(`${sourceFileName} --> ${imgName}`);
//            fs.rmSync(`\"${outName}\"`);
            
            // outName = this.getTempFileName();
            // imgName = path.join(destinationFolder, filename)+"-container.png";
            // newText = publisher.publish(ws, "Container", "PLANT");
            // fs.writeFileSync(outName, newText);
            // rnr.convert(`\"${outName}\"`, `\"${imgName}\"`);
            // console.log(`${sourceFileName} --> ${imgName}`);
            
            // outName = this.getTempFileName();
            // imgName = path.join(destinationFolder, filename)+"-component.png";
            // newText = publisher.publish(ws, "Component", "PLANT");
            // fs.writeFileSync(outName, newText);
            // rnr.convert(`\"${outName}\"`, `\"${imgName}\"`);
            // console.log(`${sourceFileName} --> ${imgName}`);
    }


    processNewCommand(myArgs: string[]) {
        switch (myArgs[1].toLowerCase()) {
            case 'book':
                this.processNewBook(myArgs);
                break;
            case 'section':
                this.processNewSection(myArgs);
                break;
            case 'page':
                this.processNewPage(myArgs);
                break;
            default:
                console.log('Sorry, that is not something I know how to do.');
                break;
        }
    }

    processNewBook(myArgs: string[]) {
        // create the directory
        this.createDirectories(myArgs[2]);
    }

    processNewSection(myArgs: string[]) {
        // create the directory
        this.createDirectories2(myArgs[2], myArgs[3]);
    }

    processNewPage(myArgs: string[]) {
        this.createDirectories2(myArgs[2], myArgs[3]);

        var pageFileName: string;
        pageFileName = path.join(myArgs[2], myArgs[3], myArgs[4]);

        if (fs.existsSync(pageFileName)) {
            console.log(`Sorry, that page (${pageFileName}) already exists.`);
            return;
        }

        var newText: string;
        newText = "Hello Brad";

        var ext: string = this.fileExtension(pageFileName);

        switch (ext) {
            case 'md':
                newText = this.createDefaultMdFile();
                break;
            case 'C4DSL':
                newText = this.createDefaultC4DslFile();
                break;
        }

        fs.writeFileSync(pageFileName, newText);

        this.launchApplicationForFile(pageFileName);
    }

    processEditCommand(myArgs: string[]) {
        var pageFileName: string;
        pageFileName = path.join(myArgs[1], myArgs[2], myArgs[3]);

        if (!fs.existsSync(pageFileName)) {
            console.log(`Sorry, that page (${pageFileName}) does not exist.`);
            return;
        }

        this.launchApplicationForFile(pageFileName);
    }

    launchApplicationForFile(fileName: string){
        const exec = require('child_process').exec;
        const child1 = exec(`\"${fileName}\"`, [], (error: string, stdout: string, stderr: string) => {
            if (error) {
                console.error('stderr', stderr);
                throw error;
            }
            //console.log('stdout', stdout);
        });        
    }

    createDefaultMdFile(): string{
        var sb:StringBuilder = new StringBuilder();
        sb.appendLine("# Sample Markdown File  ");
        return sb.text;
    }

    createDefaultC4DslFile(): string{
        var sb:StringBuilder = new StringBuilder();
        sb.appendLine("workspace ");
        sb.appendLine("[");
        sb.appendLine("    items");
        sb.appendLine("    [");
        sb.appendLine("        external_person customer \"Customer\" (\"A customer of the bank,`with personal bank accounts\")");
        sb.appendLine("        enterprise e1 \"Big Co\"");
        sb.appendLine("        [");
        sb.appendLine("            system c1 \"Internet Banking\"");
        sb.appendLine("            [");
        sb.appendLine("                Container web_app \"Web Application\" utilizing \"Java, Spring MVC\" (\"Delivers the static content`and the Internet banking SPA\")");
        sb.appendLine("                Container backend_api \"API Application\" utilizing \"Java, Docker Container\" (\"Provides Internet banking`functionality via API\")");
        sb.appendLine("                Container spa \"Single-Page App\" utilizing \"JavaScript, Angular\" (\"Provides all the Internet banking`functionality to cutomers`via their web browser\")");
        sb.appendLine("                Container mobile_app \"Mobile App\" utilizing \"C#, Xamarin\" (\"Provides a limited subset`of the Internet banking`functionality to customers`via their mobile device\")");
        sb.appendLine("                Database database \"Database\" utilizing \"SQL Database\" (\"Stores user registration`information, hashed auth credentials,`access logs, etc.\")");
        sb.appendLine("                [");
        sb.appendLine("                    Table table1 \"Table 1\"");
        sb.appendLine("                    Table table2 \"Table 2\"");
        sb.appendLine("                    Table table3 \"Table 3\"");
        sb.appendLine("                ]");
        sb.appendLine("            ]");
        sb.appendLine("            system banking_system \"Mainframe Banking System\"  (\"Stores all of the core`banking information about`customers, accounts, transactions, etc.\")");
        sb.appendLine("        ]");
        sb.appendLine("        external_system email_system \"E-Mail System\" (\"The internal`Microsoft Exchange system\")");
        sb.appendLine("    ]");
        sb.appendLine("    ");
        sb.appendLine("    connections");
        sb.appendLine("    [");
        sb.appendLine("        customer Uses web_app utilizing \"HTTPS\"");
        sb.appendLine("        customer Uses spa utilizing \"HTTPS\"");
        sb.appendLine("        customer Uses mobile_app");
        sb.appendLine("        web_app Delivers spa");
        sb.appendLine("        spa Uses backend_api utilizing \"async, JSON/HTTPS\"");
        sb.appendLine("        mobile_app Uses backend_api utilizing \"async, JSON/HTTPS\"");
        sb.appendLine("        database \"Reads from and writes to\" backend_api utilizing \"sync, JDBC\"");
        sb.appendLine("        email_system \"Sends e-mails to\" customer ");
        sb.appendLine("        backend_api \"Sends e-mails using\" email_system utilizing \"sync, SMTP\"");
        sb.appendLine("        backend_api Uses banking_system utilizing \"sync/async, XML/HTTPS\"");
        sb.appendLine("    ]");
        sb.appendLine("]");
        return sb.text;
    }

    processFuncGenCommand(myArgs: string[]) {
        // copy file to selected book/section/page
//        this.createDirectories2(myArgs[1], myArgs[2]);
// 1 = input file
// 2 = output file
// 3 = function name

        const fs = require('fs');

        const fullText = fs.readFileSync(myArgs[1]).toString('utf-8');

        const arr = fullText.toString().replace(/\r\n/g,'\n').split('\n');

        var sb:StringBuilder = new StringBuilder();
        sb.appendLine(`${myArgs[3]}(): string{ `);
        sb.appendLine(`     var sb:StringBuilder = new StringBuilder();`);
    //     // content gets pasted here
    //     return sb.text;
    // }

        var tweakedText: string = "";

        for(let i of arr) {
            //console.log(i);
            tweakedText = i;

            sb.appendLine(`     sb.appendLine(\`${tweakedText}\`);`);
        }

        // fs.readFile(myArgs[1], function(err: any, data: any) {
        //     if(err){ throw err;}

        //     const arr = data.toString().replace(/\r\n/g,'\n').split('\n');

        //     for(let i of arr) {
        //         console.log(i);
        //     }
        // });

        sb.appendLine(`     return sb.text;`);
        sb.appendLine(`}`);

        fs.writeFileSync(myArgs[2], sb.text);
    }

    generateDefaultCssFile(): string{ 
        var sb:StringBuilder = new StringBuilder();
        sb.appendLine(`html, body {`);
        sb.appendLine(`    height: 100%;`);
        sb.appendLine(`    width: 100%;`);
        sb.appendLine(`    position: relative;`);
        sb.appendLine(`    margin: 0;`);
        sb.appendLine(`    padding: 0;`);
        sb.appendLine(`}`);
        sb.appendLine(`#frameContainer {`);
        sb.appendLine(`<!--    position: fixed; -->`);
        sb.appendLine(`    height: 100%;`);
        sb.appendLine(`    top:0px;`);
        sb.appendLine(`<!--    left: 160px; -->`);
        sb.appendLine(`    right:0px;`);
        sb.appendLine(`    bottom:0px;`);
        sb.appendLine(`    z-index:1;`);
        sb.appendLine(`	/* Take the remaining width */`);
        sb.appendLine(`	flex: 1;`);
        sb.appendLine(``);
        sb.appendLine(`	/* Misc */`);
        sb.appendLine(`	display: flex;`);
        sb.appendLine(`}`);
        sb.appendLine(`#main_iframe{`);
        sb.appendLine(`    height: 100%;`);
        sb.appendLine(`    width: 100%;`);
        sb.appendLine(`}`);
        sb.appendLine(`nav {`);
        sb.appendLine(`<!--	position:fixed; -->`);
        sb.appendLine(`    left:0px; `);
        sb.appendLine(`    top:0px; `);
        sb.appendLine(`    bottom:0px; `);
        sb.appendLine(`<!--    width:160px;  -->`);
        sb.appendLine(`    width: 20%;`);
        sb.appendLine(`    background:#333; `);
        sb.appendLine(`    color:#fff; `);
        sb.appendLine(`    z-index:2`);
        sb.appendLine(`                display: flex;`);
        sb.appendLine(`                justify-content: center;`);
        sb.appendLine(`}`);
        sb.appendLine(`a.page:link {`);
        sb.appendLine(`	color:#ffffff;`);
        sb.appendLine(`	text-decoration: none;`);
        sb.appendLine(`	}`);
        sb.appendLine(`a.page:visited {`);
        sb.appendLine(`	color:#ffffff;`);
        sb.appendLine(`    text-decoration: none;`);
        sb.appendLine(`	}`);
        sb.appendLine(`a.page:hover {`);
        sb.appendLine(`	color:#ffffff;`);
        sb.appendLine(`	text-decoration: underline;`);
        sb.appendLine(`	}`);
        sb.appendLine(`a.page:active {`);
        sb.appendLine(`	color:#ffffff;`);
        sb.appendLine(`	text-decoration: underline;`);
        sb.appendLine(`}`);
        sb.appendLine(``);
        sb.appendLine(` .container {`);
        sb.appendLine(`                display: flex;`);
        sb.appendLine(``);
        sb.appendLine(`                /* Misc */`);
        sb.appendLine(`                border: 1px solid #cbd5e0;`);
        sb.appendLine(`                /* height: 16rem; */`);
        sb.appendLine(`				height: 100%;`);
        sb.appendLine(`                width: 100%;`);
        sb.appendLine(`            }`);
        sb.appendLine(`            .container__left {`);
        sb.appendLine(`                /* Initially, the left takes 3/4 width */`);
        sb.appendLine(`                width: 75%;`);
        sb.appendLine(``);
        sb.appendLine(`                /* Misc */`);
        sb.appendLine(`                align-items: center;`);
        sb.appendLine(`                display: flex;`);
        sb.appendLine(`                justify-content: center;`);
        sb.appendLine(`            }`);
        sb.appendLine(`            .resizer {`);
        sb.appendLine(`                background-color: #cbd5e0;`);
        sb.appendLine(`                cursor: ew-resize;`);
        sb.appendLine(`                height: 100%;`);
        sb.appendLine(`                width: 5px;`);
        sb.appendLine(`            }`);
        sb.appendLine(`            .container__right {`);
        sb.appendLine(`                /* Take the remaining width */`);
        sb.appendLine(`                flex: 1;`);
        sb.appendLine(``);
        sb.appendLine(`                /* Misc */`);
        sb.appendLine(`                align-items: center;`);
        sb.appendLine(`                display: flex;`);
        sb.appendLine(`                justify-content: center;`);
        sb.appendLine(`            }`);
        sb.appendLine(`			`);
        return sb.text;
   }

   generateDefaultIndexFile(navTreeText: string): string{ 
    var sb:StringBuilder = new StringBuilder();
    sb.appendLine(`<html lang="en" xml:lang="en" xmlns= "http://www.w3.org/1999/xhtml">`);
    sb.appendLine(`<meta charset="UTF-8">`);
    sb.appendLine(`<meta name="google" content="notranslate">`);
    sb.appendLine(`<meta http-equiv="Content-Language" content="en">`);
    sb.appendLine(`<head>`);
    sb.appendLine(`<link rel="stylesheet" href="index.css">`);
    sb.appendLine(`</head>`);
    sb.appendLine(`<body>`);
    sb.appendLine(``);
    sb.appendLine(`<!-- resizing is from https://htmldom.dev/create-resizable-split-views/ -->`);
    sb.appendLine(`<!-- an alternate https://www.cssscript.com/tag/split-layout/ -->`);
    sb.appendLine(`<!-- an alternate https://code-boxx.com/css-collapsible-tree-menu/ -->`);
    sb.appendLine(``);
    sb.appendLine(`<script type="text/javascript">`);
    sb.appendLine(`function iframeDidLoad() {`);
    sb.appendLine(`    alert('Done');`);
    sb.appendLine(`}`);
    sb.appendLine(``);
    sb.appendLine(`function newSite(navPageUrl) {`);
    sb.appendLine(`<!-- function newSite(){ -->`);
    sb.appendLine(`    var sites = ['http://getprismatic.com',`);
    sb.appendLine(`                 'http://gizmodo.com/',`);
    sb.appendLine(`                 'http://lifehacker.com/']`);
    sb.appendLine(``);
    sb.appendLine(`<!--    document.getElementById('main_iframe').src = sites[Math.floor(Math.random() * sites.length)]; -->`);
    sb.appendLine(`	document.getElementById('main_iframe').src = navPageUrl;`);
    sb.appendLine(`}`);
    sb.appendLine(``);
    sb.appendLine(`</script>`);
    sb.appendLine(``);
    sb.appendLine(`<h1>Sample Document</h1>`);
    sb.appendLine(``);
    sb.appendLine(`<div class="container">`);
    sb.appendLine(``);
    sb.appendLine(`    <!-- Left element -->`);
    sb.appendLine(`<!--    <div class="container__left">Left</div> -->`);
    sb.appendLine(`<!-- <div class="container__left"> -->`);
    sb.appendLine(`<nav>`);
    sb.appendLine(`${navTreeText}`);
    // sb.appendLine(`	<ul>`);
    // sb.appendLine(`		<li>My Space Section</li>`);
    // sb.appendLine(`			<ul>`);
    // sb.appendLine(`				<li><a href="#" class="page" onClick="newSite(\`my%20space%20section/combined.html\`)">Combined</a></li>`);
    // sb.appendLine(`				<li>Images</li>`);
    // sb.appendLine(`				<ul>`);
    // sb.appendLine(`					<li><a href="#" class="page" onClick="newSite(\`my%20space%20section/My%20crazy%20idea-context.png\`)">Context Diagram</a></li>				`);
    // sb.appendLine(`				</ul>`);
    // sb.appendLine(`			</ul>`);
    // sb.appendLine(`        <li>Item2</li>`);
    // sb.appendLine(`	</ul>`);
    sb.appendLine(`</nav>`);
    sb.appendLine(`<!-- </div> -->`);
    sb.appendLine(``);
    sb.appendLine(`    <!-- The resizer -->`);
    sb.appendLine(`    <div class="resizer" id="dragMe"></div>`);
    sb.appendLine(``);
    sb.appendLine(`<!-- <input type="button" value="Change site" onClick="newSite()" /> -->`);
    sb.appendLine(`<!-- <iframe id="myIframe" src="http://getprismatic.com/" onLoad="iframeDidLoad();"></iframe>      -->`);
    sb.appendLine(``);
    sb.appendLine(`    <!-- Right element -->`);
    sb.appendLine(`<!--    <div class="container__right">Right</div> -->`);
    sb.appendLine(`<div id="frameContainer"  class="container__right">`);
    sb.appendLine(`  <iframe width="100%" height="100%" frameborder="0" name="product_iframe" id="main_iframe">Content should appear here</iframe>`);
    sb.appendLine(`</div>`);
    sb.appendLine(``);
    sb.appendLine(`</div>`);
    sb.appendLine(``);
    sb.appendLine(`<script>`);
    sb.appendLine(`document.addEventListener('DOMContentLoaded', function () {`);
    sb.appendLine(`                // Query the element`);
    sb.appendLine(`                const resizer = document.getElementById('dragMe');`);
    sb.appendLine(`                const leftSide = resizer.previousElementSibling;`);
    sb.appendLine(`                const rightSide = resizer.nextElementSibling;`);
    sb.appendLine(``);
    sb.appendLine(`                // The current position of mouse`);
    sb.appendLine(`                let x = 0;`);
    sb.appendLine(`                let y = 0;`);
    sb.appendLine(`                let leftWidth = 0;`);
    sb.appendLine(``);
    sb.appendLine(`                // Handle the mousedown event`);
    sb.appendLine(`                // that's triggered when user drags the resizer`);
    sb.appendLine(`                const mouseDownHandler = function (e) {`);
    sb.appendLine(`                    // Get the current mouse position`);
    sb.appendLine(`                    x = e.clientX;`);
    sb.appendLine(`                    y = e.clientY;`);
    sb.appendLine(`                    leftWidth = leftSide.getBoundingClientRect().width;`);
    sb.appendLine(``);
    sb.appendLine(`                    // Attach the listeners to \`document\``);
    sb.appendLine(`                    document.addEventListener('mousemove', mouseMoveHandler);`);
    sb.appendLine(`                    document.addEventListener('mouseup', mouseUpHandler);`);
    sb.appendLine(`                };`);
    sb.appendLine(``);
    sb.appendLine(`                const mouseMoveHandler = function (e) {`);
    sb.appendLine(`                    // How far the mouse has been moved`);
    sb.appendLine(`                    const dx = e.clientX - x;`);
    sb.appendLine(`                    const dy = e.clientY - y;`);
    sb.appendLine(``);
    sb.appendLine(`                    const newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;`);
    sb.appendLine(`                    leftSide.style.width = \`\${newLeftWidth}%\`;`);
    sb.appendLine(``);
    sb.appendLine(`                    resizer.style.cursor = 'col-resize';`);
    sb.appendLine(`                    document.body.style.cursor = 'col-resize';`);
    sb.appendLine(``);
    sb.appendLine(`                    leftSide.style.userSelect = 'none';`);
    sb.appendLine(`                    leftSide.style.pointerEvents = 'none';`);
    sb.appendLine(``);
    sb.appendLine(`                    rightSide.style.userSelect = 'none';`);
    sb.appendLine(`                    rightSide.style.pointerEvents = 'none';`);
    sb.appendLine(`                };`);
    sb.appendLine(``);
    sb.appendLine(`                const mouseUpHandler = function () {`);
    sb.appendLine(`                    resizer.style.removeProperty('cursor');`);
    sb.appendLine(`                    document.body.style.removeProperty('cursor');`);
    sb.appendLine(``);
    sb.appendLine(`                    leftSide.style.removeProperty('user-select');`);
    sb.appendLine(`                    leftSide.style.removeProperty('pointer-events');`);
    sb.appendLine(``);
    sb.appendLine(`                    rightSide.style.removeProperty('user-select');`);
    sb.appendLine(`                    rightSide.style.removeProperty('pointer-events');`);
    sb.appendLine(``);
    sb.appendLine(`                    // Remove the handlers of \`mousemove\` and \`mouseup\``);
    sb.appendLine(`                    document.removeEventListener('mousemove', mouseMoveHandler);`);
    sb.appendLine(`                    document.removeEventListener('mouseup', mouseUpHandler);`);
    sb.appendLine(`                };`);
    sb.appendLine(``);
    sb.appendLine(`                // Attach the handler`);
    sb.appendLine(`                resizer.addEventListener('mousedown', mouseDownHandler);`);
    sb.appendLine(`            });`);
    sb.appendLine(`</script>`);
    sb.appendLine(`  `);
    sb.appendLine(`</body>`);
    sb.appendLine(`</html>`);
    sb.appendLine(``);
    return sb.text;
}

    processImportCommand(myArgs: string[]) {
        // copy file to selected book/section/page
        this.createDirectories2(myArgs[1], myArgs[2]);

        var pageFileName: string;
        pageFileName = path.join(myArgs[1], myArgs[2], myArgs[3]);

        if (fs.existsSync(pageFileName)) {
            console.log(`Sorry, that page (${pageFileName}) already exists.`);
            return;
        }

//        fs.writeFileSync(pageFileName, newText);
        fs.copyFileSync(myArgs[4], pageFileName);

        this.launchApplicationForFile(pageFileName);
    }

    processBindCommand(myArgs: string[]) {
        // book is myArgs[1]

        var fullName: string = path.join(myArgs[2], "index.css");

        fs.writeFileSync(fullName, this.generateDefaultCssFile());

        var navTree: StringBuilder = new StringBuilder();

        this.bindFolder(myArgs[1], myArgs[2], myArgs[2], navTree);

        console.log('Navigation: ', navTree.text);

        fullName = path.join(myArgs[2], "index.html");
        fs.writeFileSync(fullName, this.generateDefaultIndexFile(navTree.text));
    }


    // sb.appendLine(`		<li>My Space Section</li>`);
    // sb.appendLine(`			<ul>`);
    // sb.appendLine(`				<li><a href="#" class="page" onClick="newSite(\`my%20space%20section/combined.html\`)">Combined</a></li>`);
    // sb.appendLine(`				<li>Images</li>`);
    // sb.appendLine(`				<ul>`);
    // sb.appendLine(`					<li><a href="#" class="page" onClick="newSite(\`my%20space%20section/My%20crazy%20idea-context.png\`)">Context Diagram</a></li>				`);
    // sb.appendLine(`				</ul>`);
    // sb.appendLine(`			</ul>`);
    // sb.appendLine(`        <li>Item2</li>`);


    bindFolder(sourceFolder: string, destinationFolder: string, rootFolder: string, navTree:StringBuilder) {
        this.createDirectories(destinationFolder);

        var filename = this.fileNameOnly(sourceFolder);

        // don't include the parent folder as a part of the navigation
        if(navTree.text.length > 0){
            navTree.appendLine(`<li>${filename}</li>`);
        }
        navTree.appendLine(`<ul>`);

        var fileNames: string[];

        fileNames = fs.readdirSync(sourceFolder, {withFileTypes: true})
        .filter(item => !item.isDirectory())
        .map(item => item.name);

        for (var val of fileNames) {
            var fullName: string = path.join(sourceFolder, val);

            this.bindFile(fullName, destinationFolder, rootFolder, navTree);
        }

        var directoryNames: string[];

        directoryNames = fs.readdirSync(sourceFolder, {withFileTypes: true})
        .filter(item => item.isDirectory())
        .map(item => item.name);

        // https://www.tutorialsteacher.com/typescript/for-loop
        for (var val of directoryNames) {
            var fullName: string = path.join(sourceFolder, val);
            var fullTargetName: string = path.join(destinationFolder, val);

            console.log(`${fullName} --> ${fullTargetName}`);

            this.bindFolder(fullName, fullTargetName, rootFolder, navTree);
        }
        navTree.appendLine(`</ul>`);
    }

    bindFile(sourceFileName: string, destinationFolder: string, rootFolder: string, navTree:StringBuilder) {

        var ext = this.fileExtension(sourceFileName);
        console.log(`Bind file with extension = ${ext}`);

        switch(ext)
        {
            case "c4dsl":
                this.bindC4DslFile(sourceFileName, destinationFolder, rootFolder, navTree);
                break;
            case "flow":
                this.bindFlowDslFile(sourceFileName, destinationFolder, rootFolder, navTree);
                break;
            case "md":
                this.bindMarkdownFile(sourceFileName, destinationFolder, rootFolder, navTree);
                break;
            }

//         var filename = this.fileNameOnly(sourceFileName);

//         var fullTargetName: string = path.join(destinationFolder, filename);

//         var tmpFile = this.getTempFileName();

// //        console.log(`${sourceFileName} --> ${fullTargetName}`);

    }

    bindC4DslFile(sourceFileName: string, destinationFolder: string, rootFolder: string, navTree:StringBuilder) {
        var filename = this.fileNameOnly(sourceFileName);

//        navTree.appendLine(`				<li><a href="#" class="page" onClick="newSite(\`my%20space%20section/combined.html\`)">${filename}</a></li>`);

        const fullText = fs.readFileSync(sourceFileName).toString('utf-8');

        var stream: StringStream;
        stream = new StringStream(fullText);
        
        var bp: BlockParser = new BlockParser();
        
        var block: Block = new Block();
        bp.parse(block.children, stream, 0);
        
        var btc4: BlockToC4Converter = new BlockToC4Converter();
        
        var ws: C4Workspace = btc4.convert(block);
        
        var publisher: C4Publisher = new C4Publisher();
        
        var newText = "";
        // var path = require('path');
        // var dirName = path.dirname(myArgs[0]);
        var outName : string;
        var imgName : string;
        var rnr: MermaidRunner = new MermaidRunner();

        outName = this.getTempFileName();
        imgName = path.join(destinationFolder, filename)+"-context.png";
        newText = publisher.publish(ws, "Context", "PLANT");
        fs.writeFileSync(outName, newText);
        rnr.convert(`\"${outName}\"`, `\"${imgName}\"`);
        console.log(`${sourceFileName} --> ${imgName}`);
        
        outName = this.getTempFileName();
        imgName = path.join(destinationFolder, filename)+"-container.png";
        newText = publisher.publish(ws, "Container", "PLANT");
        fs.writeFileSync(outName, newText);
        rnr.convert(`\"${outName}\"`, `\"${imgName}\"`);
        console.log(`${sourceFileName} --> ${imgName}`);
        
        outName = this.getTempFileName();
        imgName = path.join(destinationFolder, filename)+"-component.png";
        newText = publisher.publish(ws, "Component", "PLANT");
        fs.writeFileSync(outName, newText);
        rnr.convert(`\"${outName}\"`, `\"${imgName}\"`);
        console.log(`${sourceFileName} --> ${imgName}`);
    }

    bindFlowDslFile(sourceFileName: string, destinationFolder: string, rootFolder: string, navTree:StringBuilder) {
        var filename = this.fileNameOnly(sourceFileName);

//        navTree.appendLine(`				<li><a href="#" class="page" onClick="newSite(\`my%20space%20section/combined.html\`)">${filename}</a></li>`);

        const fullText = fs.readFileSync(sourceFileName).toString('utf-8');

        var stream: StringStream;
        stream = new StringStream(fullText);
        
        var bp: BlockParser = new BlockParser();
        
        var block: Block = new Block();
        bp.parse(block.children, stream, 0);
        
        var btc4: BlockToFlowchartConverter = new BlockToFlowchartConverter();
        
        var ws: FlowchartWorkspace = btc4.convert(block);
        
        var publisher: FlowchartPublisher = new FlowchartPublisher();
        
        var newText = "";
        // var path = require('path');
        // var dirName = path.dirname(myArgs[0]);
        var outName : string;
        var imgName : string;
        var rnr: MermaidRunner = new MermaidRunner();

        outName = this.getTempFileName();
        imgName = path.join(destinationFolder, filename)+".png";
        newText = publisher.publish(ws, "MERMAID");
        fs.writeFileSync(outName, newText);
        rnr.convert(`\"${outName}\"`, `\"${imgName}\"`);
        console.log(`${sourceFileName} --> ${imgName}`);
    }

    bindMarkdownFile(sourceFileName: string, destinationFolder: string, rootFolder: string, navTree:StringBuilder) {
        var filename = this.fileNameOnly(sourceFileName);

        const fullText = fs.readFileSync(sourceFileName).toString('utf-8');

        var newText = "";
        var htmlName : string;

        htmlName = path.join(destinationFolder, filename)+".html";
        newText = mdConvert.markdownToHtml (fullText);

        fs.writeFileSync(htmlName, newText);

        var urlPath = htmlName.substring(rootFolder.length + 1);
        urlPath = this.fixPathName(urlPath);

        navTree.appendLine(`				<li><a href="#" class="page" onClick="newSite(\`${urlPath}\`)">${filename}</a></li>`);

        console.log(`${sourceFileName} --> ${htmlName}`);
    }

    //https://stackoverflow.com/questions/7055061/nodejs-temporary-file-name    
    getTempFileName(extension: string = "tmp") :string{
        // Starting with dc. to indicate that the files come from this application.  Easier to identify when cleaninug up garbage.  (Being a good citizen)
        return path.join(tmpdir(),`dc.${Crypto.randomBytes(6).readUIntLE(0,6).toString(36)}.${extension}`);
    }    

    createDirectories(book: string) {
       const dirName = path.resolve();
       book = book.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, ''); // Remove leading directory markers, and remove ending /file-name.extension
       fs.mkdir(path.resolve(dirName, book), { recursive: true }, e => {
           if (e) {
               console.error(e);
           } else {
               console.log('Success');
           }
        });
    }    

    createDirectories2(book: string, section: string) {
        const dirName = path.resolve();
        book = book.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, ''); // Remove leading directory markers, and remove ending /file-name.extension
        //book = path.join(book, section);
//        fs.mkdir(path.resolve(`\"${dirName}\"`, `\"${book}\"`), { recursive: true }, e => {
//            fs.mkdir(`\"${book}\"`, { recursive: true }, e => {    
        fs.mkdirSync(path.resolve(book, section), { recursive: true });

        // fs.mkdir(path.resolve(dirName, `\"${book}\"`), { recursive: true }, e => {
        // if (e) {
        //         console.error(e);
        //     } else {
        //         console.log('Success');
        //     }
        //  });
     }    

     fileExtension(fileName:string) : string{
        // https://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript
        var fileExt: string = fileName.split('.').pop()!;
        if(fileExt === fileName){
            fileExt = "";
        }
        return fileExt.toLowerCase();
     }

     fileNameOnly(fileName:string) : string{
        // https://www.w3schools.com/nodejs/met_path_basename.asp
        var noPath = path.basename(fileName);
        var ext = this.fileExtension(noPath);
        var nameOnly = noPath.substring(0, noPath.length - ext.length);

        // remove the trailing period if necessary
        if(nameOnly.endsWith('.')){
            nameOnly = nameOnly.substring(0, nameOnly.length - 1);
        }

        return nameOnly;
     }

     getFolderName(fileName:string) : string{
        // https://www.w3schools.com/nodejs/met_path_basename.asp
        var pathOnly = path.dirname(fileName);
        return pathOnly;
     }
     
     fixPathName(pathName: string): string{
        var rtnVal:string = pathName;

        rtnVal = rtnVal.split(' ').join('%20');
        rtnVal = rtnVal.split('\\').join('/');
        return rtnVal;
     }
}