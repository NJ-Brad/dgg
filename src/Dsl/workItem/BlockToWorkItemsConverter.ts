import { Block } from "../Block";
import { WorkItem } from "./WorkItem";
import { WorkItemWorkspace } from "./WorkItemWorkspace";
import { LineParser } from "../LineParser";

export class BlockToWorkItemsConverter {
    public convert(block: Block): WorkItemWorkspace {
        var rtnVal: WorkItemWorkspace = new WorkItemWorkspace();

        for (var child of block.children) {
            //if (this.ciEquals(child.blockText, "workspace")) {
            if (child.blockText.startsWith("Title:")) {
                rtnVal.title = child.blockText.substring(6);
            }
            else if (child.blockText.startsWith("StartDate:")) {
                rtnVal.startDate = child.blockText.substring(10);
            }
            else
            {
                this.convertItem(rtnVal.items, child);
            }
        }

        return rtnVal;
    }

    // https://stackoverflow.com/questions/2140627/how-to-do-case-insensitive-string-comparison
    ciEquals(a: string, b: string) {
        return typeof a === 'string' && typeof b === 'string'
            ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
            : a === b;
    }

    convertWorkspace(block: Block): WorkItemWorkspace {
        var rtnVal: WorkItemWorkspace = new WorkItemWorkspace();

        for (var child of block.children) {
            if (this.ciEquals(child.blockText, "items")) {
                for (var grandChild of child.children) {
                    this.convertItem(rtnVal.items, grandChild);
                }
            }

            // if (this.ciEquals(child.blockText, "connections")) {
            //     for (var grandChild of child.children) {
            //         this.convertConnection(rtnVal.relationships, grandChild);
            //     }
            // }
        }

        return rtnVal;
    }

    convertItem(items: WorkItem[], block: Block) {
        var newItem: WorkItem = new WorkItem();

        var parts: string[];

        var lp: LineParser = new LineParser();

        // allow for comment
        if (block.blockText.trim()[0] === "'") {
            return;
        }
        parts = lp.parse2(block.blockText, "`");

        var pn: number;
        pn = 0;

        for (var str of parts) {
            switch(pn)
            {
                case 0: {
                    newItem.id = str;
                    break;
                }
                case 1: {
                    newItem.label = str;
                    break;
                }
                case 2: {
                    newItem.duration = str;
                    break;
                }
                case 3: {
                // fillDependencies(parts[3], newItem.dependencies)
                    break;
                }
            }
            pn++;
        }
        items.push(newItem);
    }

    // convertConnection(connections: DependencyRelationship[], block: Block) {
    //     var newItem: DependencyRelationship = new DependencyRelationship();

    //     var parts: string[];

    //     var lp: LineParser = new LineParser();
    //     // allow for comment
    //     if (block.blockText.trim()[0] === "'") {
    //         return;
    //     }
    //     parts = lp.parse(block.blockText);

    //     var origin: string = "";
    //     var destination: string = "";
    //     var technology: string = "";
    //     var label: string = "";

    //     var nextIsTechnology: boolean = false;

    //     var pn: number;
    //     pn = 0;

    //     for (var str of parts) {
    //         if (pn === 0) {
    //             origin = str;
    //         }
    //         else if (pn === 1) {
    //             label = str.trim();
    //         }
    //         else if (pn === 2) {
    //             destination = str;
    //         }
    //         else {
    //             if (this.ciEquals(str, "utilizing")) {
    //                 nextIsTechnology = true;
    //             }
    //             else if (nextIsTechnology) {
    //                 technology = str;
    //                 nextIsTechnology = false;
    //             }
    //         }
    //         pn++;
    //     }

    //     newItem = new DependencyRelationship();
    //     newItem.from = origin;
    //     newItem.to = destination;
    //     newItem.label = label;
    //     newItem.technology = technology;

    //     if (newItem !== null) {
    //         connections.push(newItem);
    //     }
    // }
}
