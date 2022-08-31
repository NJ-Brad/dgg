import { StringBuilder } from "../Stringbuilder";

export class LineParser {
    // Escape characters are not available in strucurizr  https://github.com/neovim/neovim/issues/17413
    public parse(lineText: string): string[] {
        var parts: string[] = [];
        var sb: StringBuilder = new StringBuilder();

        var inQuote: boolean = false;

        var character: string;

        for (var i = 0; i < lineText.length; i++) {
            character = lineText.charAt(i);
            switch (character) {
                case '"':
                    inQuote = !inQuote;
                    //sb.Append(character);
                    break;
                case ' ':
                case '\t':
                    if (inQuote) {
                        sb.append(character);
                    }
                    else {
                        // this avoids creating blank fields
                        if (sb.text.length > 0) {
                            // treat as end of field
                            parts.push(sb.text.trim());
                            sb.text = "";
                        }
                    }
                    break;
                default:
                    sb.append(character);
                    break;
            }
        }

        if (sb.text.length > 0) {
            parts.push(sb.text.trim());
            sb.text = "";
        }

        return parts;
    }
}
