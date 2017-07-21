import { Converter } from 'showdown';

export class TextUtil {

    static stripTags(html: string): string {
        if (!html) {
            return '';
        }

        // this will create a description string without any HTML tags in it
        let div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || html;
    }

    static getMarkdownConverter(): Converter {
        let c = new Converter();

        c.setOption('openLinksInNewWindow', 'true');
        c.setOption('simplifiedAutoLink', 'true');
        c.setOption('excludeTrailingPunctuationFromURLs ', 'true');

        return c;
    }

    static renderDescription(str?: string): string {
        if (str) {
            let converter = this.getMarkdownConverter();
            return converter.makeHtml(str);
        } else {
            return 'No Description';
        }
    }

}