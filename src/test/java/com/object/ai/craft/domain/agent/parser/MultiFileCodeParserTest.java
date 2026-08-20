package com.object.ai.craft.domain.agent.parser;

import com.object.ai.craft.domain.agent.model.MultiHtmlCodeResult;
import com.object.ai.craft.types.exception.BusinessException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class MultiFileCodeParserTest {

    private final MultiFileCodeParser parser = new MultiFileCodeParser();

    @Test
    void shouldParseAllCodeBlocks() {
        String output = """
                ```html
                <main class="page">Hello</main>
                ```
                ```css
                .page { color: #2c2c2c; }
                ```
                ```javascript
                document.querySelector('.page');
                ```
                """;

        MultiHtmlCodeResult result = parser.parse(output);

        assertEquals("<main class=\"page\">Hello</main>", result.getHtmlCode());
        assertEquals(".page { color: #2c2c2c; }", result.getCssCode());
        assertEquals("document.querySelector('.page');", result.getJsCode());
        assertEquals("", result.getDescription());
    }

    @Test
    void shouldSupportJsLanguageTagAndSurroundingText() {
        String output = """
                以下是生成结果：
                ```html
                <div>content</div>
                ```
                ```css
                div { display: block; }
                ```
                ```js
                console.log('ready');
                ```
                生成完成。
                """;

        MultiHtmlCodeResult result = parser.parse(output);

        assertEquals("<div>content</div>", result.getHtmlCode());
        assertEquals("div { display: block; }", result.getCssCode());
        assertEquals("console.log('ready');", result.getJsCode());
    }

    @Test
    void shouldRejectMissingCodeBlock() {
        String output = """
                ```html
                <div>content</div>
                ```
                ```css
                div { display: block; }
                ```
                """;

        assertThrows(BusinessException.class, () -> parser.parse(output));
    }

    @Test
    void shouldRejectEmptyCodeBlock() {
        String output = """
                ```html
                ```
                ```css
                div { display: block; }
                ```
                ```js
                console.log('ready');
                ```
                """;

        assertThrows(BusinessException.class, () -> parser.parse(output));
    }

    @Test
    void shouldRejectDuplicateCodeBlock() {
        String output = """
                ```html
                <div>first</div>
                ```
                ```html
                <div>second</div>
                ```
                ```css
                div { display: block; }
                ```
                ```js
                console.log('ready');
                ```
                """;

        assertThrows(BusinessException.class, () -> parser.parse(output));
    }

}
