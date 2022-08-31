export class StringStream {
    text: string;
    position: number;

    constructor(startingText: string) {
        this.text = startingText;
        this.position = 0;
    }

    public peek(): string {
        var rtnVal: string = "";
        if (!this.isEnd()) {
            rtnVal = this.text[this.position];
        }
        return rtnVal;
    }

    public read(): string {
        var rtnVal: string = "";
        if (!this.isEnd()) {
            rtnVal = this.text[this.position];
            this.position++;
        }
        return rtnVal;
    }

    public isEnd(): boolean {
        return (this.position >= this.text.length);
    }
}
