export class FlowchartItem {
    public items: FlowchartItem[] = [];

    public itemType: string = "";
    public label: string = "";
    public description: string = "";
    private _id: string = "";

    get id() {
        return this._id;
    }

    set id(value) {

        if (value.length === 0) {
            //alias = Guid.NewGuid().ToString().Replace('-', '_');
            this._id = this.label.replace(' ', '_').replace('-', '_');
        }
        else {
            this._id = value;
        }
    }
}