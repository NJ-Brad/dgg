import { Block } from "../Block";
import { FlowchartItem } from "./FlowchartItem";
import { FlowchartRelationship } from "./FlowchartRelationship";
import { FlowchartWorkspace } from "./FlowchartWorkspace";
import { LineParser } from "../LineParser";



export class BlockToFlowchartConverter {
    public convert(block: Block): FlowchartWorkspace {
        var rtnVal: FlowchartWorkspace = new FlowchartWorkspace();

        for (var child of block.children) {
            if (this.ciEquals(child.blockText, "flow")) {
                rtnVal = this.convertWorkspace(child);
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

    convertWorkspace(block: Block): FlowchartWorkspace {
        var rtnVal: FlowchartWorkspace = new FlowchartWorkspace();

        for (var child of block.children) {
            this.convertFlowItem(rtnVal.items, rtnVal.relationships, child);
        }
        this.linkItems(rtnVal.items, rtnVal.relationships);

        return rtnVal;
    }

    linkItems(items: FlowchartItem[], connections: FlowchartRelationship[]) {
        var prevItemName: string = "";
        for (var item of items) {
            if (prevItemName !== "") {
                var newConn: FlowchartRelationship = new FlowchartRelationship();
                newConn.label = " ";
                newConn.from = prevItemName;
                newConn.to = item.id;
                connections.push(newConn);
            }
            if (item.itemType === "DECISION") {
                prevItemName = "";
            }
            else {
                prevItemName = item.id;
            }
        }
    }

    convertFlowItem(items: FlowchartItem[], connections: FlowchartRelationship[], block: Block) {
        var newItem: FlowchartItem = new FlowchartItem();

        var parts: string[];

        var lp: LineParser = new LineParser();
        parts = lp.parse(block.blockText);

        var itemType: string = "";
        var label: string = "";
        var itemId: string = "";
        var technology: string = "";
        var label: string = "";
        var description: string = "";

        // ignore a comment
        if (block.blockText[0] === '\'') {
            return;
        }

        if (parts.length === 1) {
            switch (parts[0].toUpperCase()) {
                case "START":
                case "END":
                    itemType = parts[0];
                    label = parts[0].trim();
                    itemId = this.fixId(parts[0]);
                    break;
                default:
                    itemType = "ACTION";
                    label = parts[0].trim();
                    itemId = this.fixId(parts[0]);
                    break;
            }
        }
        else if (block.blockText[0] === '"') {
            itemType = "ACTION";
            label = parts[0].trim();
            if (parts.length === 1) {
                itemId = this.fixId(parts[0]);
            }
            else {
                itemId = this.fixId(parts[1]);
            }
        }
        else {
            for (var pn = 0; pn < parts.length; pn++) {
                var str = parts[pn];

                if (pn === 0) {
                    itemType = str;
                }
                else if (pn === 1) {
                    label = str.trim();
                }
                else {
                    itemId = this.fixId(str);
                }
            }
        }

        itemType = itemType.toUpperCase();
        switch (itemType) {
            // case "BOUNDARY":
            //    newItem = new FlowchartItem ();
            //    newItem.itemType = itemType;
            //    newItem.label = label;
            //    newItem.id = itemId;
            //    newItem.description = description;
            //    for (var cn = 0; cn < block.children.length; cn++)
            //    {
            //         var child = block.children[cn];
            //         this.convertFlowItem(newItem.items, connections, child);
            //    }

            //     items.push(newItem);
            //     break;
            case "ACTION":
            case "SUB":
                newItem = new FlowchartItem();
                newItem.itemType = itemType;
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;

                for (var child of block.children) {
                    this.convertConnection(itemId, items, connections, child);
                }

                items.push(newItem);
                break;
            case "DECISION":
                newItem = new FlowchartItem();
                newItem.itemType = itemType;
                newItem.label = label;
                if (itemId === "") {
                    itemId = this.fixId(label);
                }
                newItem.id = itemId;
                newItem.description = description;
                for (var child of block.children) {
                    // for (var cn = 0; cn < block.children.length; cn++)
                    // {
                    //      var child = block.children[cn];
                    this.convertConnection(itemId, items, connections, child);
                }
                items.push(newItem);
                break;
            case "START":
                newItem = new FlowchartItem();
                newItem.itemType = itemType;
                newItem.label = "Start";
                if (itemId === "") {
                    itemId = this.fixId(label);
                }
                newItem.id = itemId;
                items.push(newItem);
                break;
            case "END":
                newItem = new FlowchartItem();
                newItem.itemType = itemType;
                newItem.label = "End";
                if (itemId === "") {
                    itemId = this.fixId(label);
                }
                newItem.id = itemId;
                items.push(newItem);
                break;
            case "CONNECTION":
                var newConn: FlowchartRelationship = new FlowchartRelationship();
                if (parts.length === 4) {
                    newConn.from = parts[1];
                    newConn.to = parts[2];
                    newConn.label = this.fixConnectionLabel(parts[3]);
                }

                if (parts.length === 3) {
                    newConn.from = parts[1];
                    newConn.to = parts[2];
                    newConn.label = " ";
                }

                if (newConn !== null) {
                    connections.push(newConn);
                }
                break;
            case "YES":
                var newConn: FlowchartRelationship = new FlowchartRelationship();
                newConn.from = parts[1];
                newConn.to = parts[2];
                newConn.label = "Yes";
                connections.push(newConn);
                break;
            case "NO":
                var newConn: FlowchartRelationship = new FlowchartRelationship();
                newConn.from = parts[1];
                newConn.to = parts[2];
                newConn.label = "No";
                connections.push(newConn);
                break;
        }
    }

    convertConnection(myId: string, items: FlowchartItem[], connections: FlowchartRelationship[], block: Block) {
        var parts: string[];

        var lp: LineParser = new LineParser();
        parts = lp.parse(block.blockText);

        var newConn: FlowchartRelationship = new FlowchartRelationship();
        newConn.label = this.fixConnectionLabel(parts[0]);
        newConn.from = myId;
        newConn.to = this.fixId(parts[1]);
        connections.push(newConn);
    }

    fixId(input: string): string {
        // https://bobbyhadz.com/blog/javascript-typeerror-replaceall-is-not-a-function

        var brokenLabel: string = input.trim().split(' ').join('_');
        return brokenLabel;
    }

    fixConnectionLabel(input: string): string {
        // https://bobbyhadz.com/blog/javascript-typeerror-replaceall-is-not-a-function

        var brokenLabel: string = input.trim();
        if (brokenLabel === "_") {
            brokenLabel = " ";
        }
        return brokenLabel;
    }
}
