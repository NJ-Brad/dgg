import { FlowchartItem } from "./FlowchartItem";
import { FlowchartRelationship } from "./FlowchartRelationship";

export class FlowchartWorkspace {
    public items: FlowchartItem[] = [];
    public relationships: FlowchartRelationship[] = [];
}