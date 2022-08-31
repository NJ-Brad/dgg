import { Block } from "./Block";
import { StringBuilder } from "../Stringbuilder";
import { StringStream } from "./StringStream";

export class BlockParser {
    public parseText(sr: StringStream): Block {
        var block: Block;
        block = new Block();
        block.blockText = "Top Level";

        this.parse(block.children, sr, 1);

        return block;
    }

    public parse(blocks: Block[], sr: StringStream, level: number) {

        var rtnVal: Block = new Block();
        var inQuote: boolean = false;

        var sb: StringBuilder;
        sb = new StringBuilder();

        var character: string;
        var keepGoing: boolean;
        keepGoing = true;

        while (!sr.isEnd() && keepGoing) {
            character = sr.read();
            switch (character) {
                case '"': {
                    inQuote = !inQuote;
                    sb.append(character);
                    break;
                }
                case '\n':
                case '\r':
                    if (sb.text.length > 0) {
                        rtnVal.blockText = sb.text.trim();
                        if (rtnVal.blockText.length > 0) {
                            blocks.push(rtnVal);
                        }
                        sb.text = "";

                        rtnVal = new Block();
                    }
                    break;
                case '[':
                    if (!inQuote) {
                        // add to the previous node (Not the potential new one)
                        this.parse(blocks[blocks.length - 1].children, sr, level + 1);
                    }
                    else {
                        sb.append(character);
                    }
                    break;
                case ']':
                    if (!inQuote) {
                        level--;
                        keepGoing = false;
                    }
                    else {
                        sb.append(character);
                    }
                    break;
                default:
                    sb.append(character);
                    break;
            }
        }

        if (sb.text.length > 0) {
            rtnVal.blockText = sb.text.trim();
            if (rtnVal.blockText.length > 0) {
                blocks.push(rtnVal);
            }
            sb.text = "";
        }
        return;
    }
}
