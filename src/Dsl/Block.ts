
export class Block {
    public blockText: string;
    public children: Block[] = [];

    constructor() {
        this.blockText = "";
        this.children = [];
    }
}
