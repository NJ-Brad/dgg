export class StringBuilder {
    public text: string;

    constructor() {
        this.text = "";
    }

    public append(additionalText: string) {
        this.text = this.text.concat(additionalText);
    }

    public appendLine(additionalText: string) {
        this.text = this.text.concat(additionalText);
        this.text = this.text.concat("\r\n");
    }
}
