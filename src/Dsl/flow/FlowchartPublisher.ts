import { Block } from "../Block";
import { FlowchartItem } from "./FlowchartItem";
import { FlowchartRelationship } from "./FlowchartRelationship";
import { FlowchartWorkspace } from "./FlowchartWorkspace";
import { LineParser } from "../LineParser";
import { StringBuilder } from "../../Stringbuilder";

export class FlowchartPublisher {
    public publish(workspace: FlowchartWorkspace, format: string): string {

        var rtnVal: string = "";
        switch (format) {
            case "MERMAID":
                rtnVal = this.publishMermaid(workspace);
                break;
            case "PLANT":
                break;
        }

        return rtnVal;
    }

    private publishMermaid(workspace: FlowchartWorkspace): string {
        var sb: StringBuilder = new StringBuilder();

        sb.append(this.mermaidHeader(workspace));

        for (var item of workspace.items) {
            //item = workspace.items[itmNum];
            sb.append(this.mermaidItem(item));
        }

        for (var rel of workspace.relationships) {
            sb.append(this.mermaidConnection(rel));
        }

        return sb.text;
    }

    private mermaidHeader(workspace: FlowchartWorkspace): string {
        var sb: StringBuilder = new StringBuilder();
        sb.append("flowchart TB");
        sb.append("\r\n");
        // classDef borderless stroke-width:0px
        // classDef darkBlue fill:#00008B, color:#fff
        // classDef brightBlue fill:#6082B6, color:#fff
        // classDef gray fill:#62524F, color:#fff
        // classDef gray2 fill:#4F625B, color:#fff

        // ");

        return sb.text;
    }

    private buildIndentation(level: number) {
        var rtnVal: string = "";

        for (var i = 0; i < (4 * level); i++) {
            rtnVal = rtnVal + " ";
        }
        return rtnVal;
    }

    private mermaidItem(item: FlowchartItem, indent: number = 1): string {
        var sb: StringBuilder = new StringBuilder();

        var indentation: string = this.buildIndentation(indent);

        // https://bobbyhadz.com/blog/javascript-typeerror-replaceall-is-not-a-function
        var brokenLabel: string = item.label.split('`').join('<br/>');

        brokenLabel = `\"${brokenLabel}\"`;

        switch (item.itemType) {
            case "BOUNDARY":
                if (item.items.length === 0) {
                    // a boundary with nothing in it, should not be displayed
                    // sb.appendLine(`${indentation}${item.id}[${item.label}]`);
                }
                else {
                    sb.appendLine(`${indentation}subgraph ${item.id}[${brokenLabel}]`);
                    indent++;

                    for (var item2 of item.items) {
                        sb.appendLine(this.mermaidItem(item2, indent).trimEnd());
                    }
                    sb.appendLine(`${indentation}end`);
                }
                break;
            case "ACTION":
                sb.appendLine(`${indentation}${item.id}[${brokenLabel}]`);
                break;
            case "DECISION":
                sb.appendLine(`${indentation}${item.id}{${brokenLabel}}`);
                break;
            case "START":
            case "END":
                sb.appendLine(`${indentation}${item.id}([${brokenLabel}])`);
                break;
            case "SUB":
                sb.appendLine(`${indentation}${item.id}[[${brokenLabel}]]`);
                break;
        }

        return sb.text;
    }

    private mermaidConnection(rel: FlowchartRelationship, indent: number = 1): string {
        var sb: StringBuilder = new StringBuilder();

        var indentation: string = this.buildIndentation(indent);

        var from: string = rel.from;
        var to: string = rel.to;

        sb.appendLine(`${indentation}${from}--\"${rel.label}\"-->${to}`);

        return sb.text;
    }

    // https://stackoverflow.com/questions/2140627/how-to-do-case-insensitive-string-comparison
    ciEquals(a: string, b: string) {
        return typeof a === 'string' && typeof b === 'string'
            ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
            : a === b;
    }

}