import { Block } from "../Block";
import { C4Item } from "./C4Item";
import { C4Relationship } from "./C4Relationship";
import { C4Workspace } from "./C4Workspace";
import { LineParser } from "../LineParser";



export class BlockToC4Converter {
    public convert(block: Block): C4Workspace {
        var rtnVal: C4Workspace = new C4Workspace();

        for (var child of block.children) {
            if (this.ciEquals(child.blockText, "workspace")) {
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

    convertWorkspace(block: Block): C4Workspace {
        var rtnVal: C4Workspace = new C4Workspace();

        for (var child of block.children) {
            if (this.ciEquals(child.blockText, "items")) {
                for (var grandChild of child.children) {
                    this.convertItem(rtnVal.items, grandChild);
                }
            }

            if (this.ciEquals(child.blockText, "connections")) {
                for (var grandChild of child.children) {
                    this.convertConnection(rtnVal.relationships, grandChild);
                }
            }
        }

        return rtnVal;
    }

    convertItem(items: C4Item[], block: Block) {
        var newItem: C4Item = new C4Item();

        var parts: string[];

        var lp: LineParser = new LineParser();

        // allow for comment
        if (block.blockText.trim()[0] === "'") {
            return;
        }
        parts = lp.parse(block.blockText);

        var itemType: string = "";
        var itemId: string = "";
        var technology: string = "";
        var label: string = "";
        var description: string = "";

        var nextIsTechnology: boolean = false;

        var pn: number;
        pn = 0;

        for (var str of parts) {
            if (pn === 0) {
                itemType = str;
            }
            else if (pn === 1) {
                itemId = str;
            }
            else {
                if (this.ciEquals(str, "utilizing")) {
                    nextIsTechnology = true;
                }
                else if (nextIsTechnology) {
                    technology = str;
                    nextIsTechnology = false;
                }
                else if (str[0] === "(") {
                    description = str.trim();
                    description = description.substring(1, description.length - 1);
                }
                else {
                    label = str.trim();
                }
            }
            pn++;
        }

        itemType = itemType.toUpperCase();
        switch (itemType) {
            case "PERSON":
                newItem = new C4Item();
                newItem.itemType = itemType;
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                break;
            case "EXTERNAL_PERSON":
                newItem = new C4Item();
                newItem.itemType = "PERSON";
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                newItem.external = true;
                break;
            case "COMPONENT":
                newItem = new C4Item();
                newItem.itemType = itemType;
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                newItem.technology = technology;
                break;
            case "EXTERNAL_COMPONENT":
                newItem = new C4Item();
                newItem.itemType = "COMPONENT";
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                newItem.technology = technology;
                newItem.external = true;
                break;
            case "SYSTEM":
                newItem = new C4Item();
                newItem.itemType = itemType;
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                break;
            case "EXTERNAL_SYSTEM":
                newItem = new C4Item();
                newItem.itemType = "SYSTEM";
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                newItem.external = true;
                break;
            case "DATABASE":
                newItem = new C4Item();
                newItem.itemType = itemType;
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                newItem.technology = technology;
                newItem.database = true;
                break;
            case "EXTERNAL_DATABASE":
                newItem = new C4Item();
                newItem.itemType = "DATABASE";
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                newItem.technology = technology;
                newItem.external = true;
                newItem.database = true;
                break;
            case "SYSTEM_BOUNDARY":
                newItem = new C4Item();
                newItem.itemType = itemType;
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                break;
            case "CONTAINER_BOUNDARY":
                newItem = new C4Item();
                newItem.itemType = itemType;
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                break;
            case "ENTERPRISE_BOUNDARY":
                newItem = new C4Item();
                newItem.itemType = itemType;
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                break;
            case "NODE":
                newItem = new C4Item();
                newItem.itemType = itemType;
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                break;
            case "ENTERPRISE":
                newItem = new C4Item();
                newItem.itemType = itemType;
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                break;
            case "CONTAINER":
                newItem = new C4Item();
                newItem.itemType = itemType;
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                newItem.technology = technology;
                break;
            case "TABLE":
                newItem = new C4Item();
                newItem.itemType = "TABLE";
                newItem.label = label;
                newItem.id = itemId;
                newItem.description = description;
                newItem.technology = technology;
                break;
        }

        if (newItem !== null) {
            for (var child of block.children) {
                this.convertItem(newItem.items, child);
            }

            items.push(newItem);
        }
    }

    convertConnection(connections: C4Relationship[], block: Block) {
        var newItem: C4Relationship = new C4Relationship();

        var parts: string[];

        var lp: LineParser = new LineParser();
        // allow for comment
        if (block.blockText.trim()[0] === "'") {
            return;
        }
        parts = lp.parse(block.blockText);

        var origin: string = "";
        var destination: string = "";
        var technology: string = "";
        var label: string = "";

        var nextIsTechnology: boolean = false;

        var pn: number;
        pn = 0;

        for (var str of parts) {
            if (pn === 0) {
                origin = str;
            }
            else if (pn === 1) {
                label = str.trim();
            }
            else if (pn === 2) {
                destination = str;
            }
            else {
                if (this.ciEquals(str, "utilizing")) {
                    nextIsTechnology = true;
                }
                else if (nextIsTechnology) {
                    technology = str;
                    nextIsTechnology = false;
                }
            }
            pn++;
        }

        newItem = new C4Relationship();
        newItem.from = origin;
        newItem.to = destination;
        newItem.label = label;
        newItem.technology = technology;

        if (newItem !== null) {
            connections.push(newItem);
        }
    }
}
