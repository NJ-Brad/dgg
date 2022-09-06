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
        sb.appendLine("    dateFormat  YYYY-MM-DD");
        sb.appendLine(`    title       ${workspace.title}`);
        sb.appendLine("    excludes    weekends");
//        sb.appendLine(`    %% (`excludes` accepts specific dates in YYYY-MM-DD format, days of the week ("sunday") or "weekends", but not the word "weekdays".)`);
        sb.appendLine(`    Start : milestone, start, ${workspace.startDate}, 0min`);

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
        //var displayType: string = item.itemType;
        var goDeeper: boolean = true;


        var deps : StringBuilder = new StringBuilder();

        deps.append("start");

        for (var dependency of item.dependencies) {
            if(dependency.dependencyType === "StartDate")
            {
                deps.append(` ${dependency.startDate}`);
            }
            else
            {
                deps.append(` ${dependency.id}`);
            }
        }
        
        // if(firstItem)
        // {
        //     const start: Date = new Date();
        //     var datePart = this.toIsoString(start);
        //     sb.appendLine(`${item.label} : ${datePart}, 1d`);
        // }
        // else{
            sb.append(`${item.label} :${item.id} `);

            if(deps.text.length > 0){
                sb.append(`, after ${deps.text}`);
            }

            if(item.duration.length > 0){
                sb.append(`, ${item.duration}d`);
            }

            sb.appendLine("");
//        }

        // switch (item.itemType) {
        //     case "PERSON":
        //         if (item.external) {
        //             displayType = "External Person";
        //         }
        //         else {
        //             displayType = "Person";
        //         }
        //         break;
        //     case "SYSTEM":
        //         if (item.external) {
        //             displayType = "External System";
        //         }
        //         else {
        //             if (this.ciEquals(this.diagramType, "Context")) {
        //                 goDeeper = false;
        //                 displayType = "System";
        //             }
        //             else if (item.items.length === 0) {
        //                 displayType = "System";
        //             }
        //             else {
        //                 displayType = "System Boundary";
        //             }
        //         }
        //         break;
        //     case "CONTAINER":
        //         if (item.external) {
        //             displayType = "External Container";
        //         }
        //         else {
        //             if (this.ciEquals(this.diagramType, "Container")) {
        //                 goDeeper = false;
        //                 displayType = "Container";
        //             }
        //             else if (item.items.length === 0) {
        //                 displayType = "Container";
        //             }
        //             else {
        //                 displayType = "Container Boundary";
        //             }
        //         }
        //         break;
        //     case "DATABASE":
        //         if (item.external) {
        //             displayType = "External Database";
        //         }
        //         else {
        //             if (this.ciEquals(this.diagramType, "Container")) {
        //                 goDeeper = false;
        //                 displayType = "Database";
        //             }
        //             else if (item.items.length === 0) {
        //                 displayType = "Database";
        //             }
        //             else {
        //                 displayType = "Database Boundary";
        //             }
        //         }
        //         break;
        // }

        // var displayLabel: string = `\"<strong><u>${item.label}</u></strong>`;
        // var brokenDescription: string = item.description.replace("`", "<br/>");

        // if (item.description.length !== 0) {
        //     displayLabel = displayLabel + `<br/>${brokenDescription}`;
        // }

        // displayLabel += `<br/>&#171;${displayType}&#187;\"`;

        // if (!goDeeper || (item.items.length === 0)) {
        //     sb.append(`${indentation}${item.id}[${displayLabel}]`);
        //     sb.append("\r\n");
        // }
        // else {
        //     sb.append(`${indentation}subgraph ${item.id}[${displayLabel}]`);
        //     sb.append("\r\n");
        //     indent++;

        //     var item2: C4Item;
        //     for (var itmNum = 0; itmNum < item.items.length; itmNum++) {
        //         item2 = item.items[itmNum];
        //         sb.append(this.mermaidItem(item2, indent).trimEnd());
        //         sb.append("\r\n");
        //     }
        //     sb.append(`${indentation}end`);
        //     sb.append("\r\n");
        // }

        return sb.text;
    }

    public toIsoString(date : Date) : string {
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var dt = date.getDate();

        var dtString: string = dt.toString();
        var monthString: string = month.toString();
        
        if (dt < 10) {
            dtString = '0' + dt.toString();
        }
        if (month < 10) {
            monthString = '0' + month.toString();
        }
        
        return(year+'-' + monthString + '-'+ dtString);
    }

    public label: string = "";
    public description: string = "";
    public external: boolean = false;
    public technology: string = "";
    public database: boolean = false;
    private _id: string = "";

    // https://stackoverflow.com/questions/2140627/how-to-do-case-insensitive-string-comparison
    ciEquals(a: string, b: string) {
        return typeof a === 'string' && typeof b === 'string'
            ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
            : a === b;
    }
}