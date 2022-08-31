export class C4Item {
    public items: C4Item[] = [];

    public itemType: string = "";
    public label: string = "";
    public description: string = "";
    public external: boolean = false;
    public technology: string = "";
    public database: boolean = false;
    private _id: string = "";

    get id() {
        return this._id;
    }

    set id(value) {

        if (value.length === 0) {
            this._id = this.label.replace(' ', '_').replace('-', '_');
        }
        else {
            this._id = value;
        }
    }
}