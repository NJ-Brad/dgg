import { WorkItemDependency } from "./WorkItemDependency";

export class WorkItem {
    //public items: WorkItem[] = [];

    public id: string = "";
    public label: string = "";
    public duration: string = "";
    public dependencies: WorkItemDependency[] = [];
}