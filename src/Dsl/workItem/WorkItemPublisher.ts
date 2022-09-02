import { WorkItem } from "./WorkItem";
import { WorkItemWorkspace } from "./WorkItemWorkspace";
import { LineParser } from "../LineParser";
import { StringBuilder } from "../../Stringbuilder";

export class WorkItemPublisher {

    public publish(workspace: WorkItemWorkspace): string {

        var rtnVal: string = "";
        rtnVal = this.publishMermaid(workspace);

        return rtnVal;
    }

    private publishMermaid(workspace: WorkItemWorkspace): string {
        var sb: StringBuilder = new StringBuilder();

        sb.append(this.mermaidHeader(workspace));

        for (var item of workspace.items) {
            sb.append(this.mermaidItem(item));
        }

        return sb.text;
    }

    private isInList(lookFor: string, lookIn: string[]): boolean {
        var rtnVal: boolean = false;

        for (var lookInItem of lookIn) {
            if (this.ciEquals(lookFor, lookInItem)) {
                rtnVal = true;
            }
        }

        return rtnVal;
    }

    private mermaidHeader(workspace: WorkItemWorkspace): string {
        var sb: StringBuilder = new StringBuilder();
//        sb.append("flowchart TB");
//        sb.append("\r\n");
        // classDef borderless stroke-width:0px
        // classDef darkBlue fill:#00008B, color:#fff
        // classDef brightBlue fill:#6082B6, color:#fff
        // classDef gray fill:#62524F, color:#fff
        // classDef gray2 fill:#4F625B, color:#fff

        // ");

        sb.appendLine("gantt");
        // gantt
        sb.appendLine("     dateFormat  YYYY-MM-DD");
        sb.appendLine(`     title       {workspace.title}`);
        //     excludes    weekends
        //     %% (`excludes` accepts specific dates in YYYY-MM-DD format, days of the week ("sunday") or "weekends", but not the word "weekdays".)

//        sb.appendLine(`C4${diagramType}`);


        return sb.text;
    }

    private buildIndentation(level: number) {
        var rtnVal: string = "";

        for (var i = 0; i < (4 * level); i++) {
            rtnVal = rtnVal + " ";
        }
        return rtnVal;
    }

    private mermaidItem(item: WorkItem, indent: number = 1): string {
        var sb: StringBuilder = new StringBuilder();

        var indentation: string = this.buildIndentation(indent);
        var displayType: string = item.itemType;
        var goDeeper: boolean = true;

        switch (item.itemType) {
            case "PERSON":
                if (item.external) {
                    displayType = "External Person";
                }
                else {
                    displayType = "Person";
                }
                break;
            case "SYSTEM":
                if (item.external) {
                    displayType = "External System";
                }
                else {
                    if (this.ciEquals(this.diagramType, "Context")) {
                        goDeeper = false;
                        displayType = "System";
                    }
                    else if (item.items.length === 0) {
                        displayType = "System";
                    }
                    else {
                        displayType = "System Boundary";
                    }
                }
                break;
            case "CONTAINER":
                if (item.external) {
                    displayType = "External Container";
                }
                else {
                    if (this.ciEquals(this.diagramType, "Container")) {
                        goDeeper = false;
                        displayType = "Container";
                    }
                    else if (item.items.length === 0) {
                        displayType = "Container";
                    }
                    else {
                        displayType = "Container Boundary";
                    }
                }
                break;
            case "DATABASE":
                if (item.external) {
                    displayType = "External Database";
                }
                else {
                    if (this.ciEquals(this.diagramType, "Container")) {
                        goDeeper = false;
                        displayType = "Database";
                    }
                    else if (item.items.length === 0) {
                        displayType = "Database";
                    }
                    else {
                        displayType = "Database Boundary";
                    }
                }
                break;
        }

        var displayLabel: string = `\"<strong><u>${item.label}</u></strong>`;
        var brokenDescription: string = item.description.replace("`", "<br/>");

        if (item.description.length !== 0) {
            displayLabel = displayLabel + `<br/>${brokenDescription}`;
        }

        displayLabel += `<br/>&#171;${displayType}&#187;\"`;

        if (!goDeeper || (item.items.length === 0)) {
            sb.append(`${indentation}${item.id}[${displayLabel}]`);
            sb.append("\r\n");
        }
        else {
            sb.append(`${indentation}subgraph ${item.id}[${displayLabel}]`);
            sb.append("\r\n");
            indent++;

            var item2: C4Item;
            for (var itmNum = 0; itmNum < item.items.length; itmNum++) {
                item2 = item.items[itmNum];
                sb.append(this.mermaidItem(item2, indent).trimEnd());
                sb.append("\r\n");
            }
            sb.append(`${indentation}end`);
            sb.append("\r\n");
        }

        return sb.text;
    }

    public label: string = "";
    public description: string = "";
    public external: boolean = false;
    public technology: string = "";
    public database: boolean = false;
    private _id: string = "";


    private formatPlantItem(command: string, item: C4Item): string {
        var sb: StringBuilder = new StringBuilder();

        sb.append(command);

        if (item.database) {
            sb.append("Db");
        }
        if (item.external) {
            sb.append("_Ext");
        }

        sb.append("(");

        sb.append(item.id);

        if (item.label !== "") {
            sb.append(`, \"${item.label}\"`);

            if (item.description !== "") {
                sb.append(`, \"${item.description}\"`);

                if (item.technology !== "") {
                    sb.append(`, \"${item.technology}\"`);
                }
            }
        }

        sb.append(")");

        return sb.text;
    }

    // https://stackoverflow.com/questions/2140627/how-to-do-case-insensitive-string-comparison
    ciEquals(a: string, b: string) {
        return typeof a === 'string' && typeof b === 'string'
            ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
            : a === b;
    }
}