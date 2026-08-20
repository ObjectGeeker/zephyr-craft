package com.object.ai.craft.domain.agent.parser;

import com.object.ai.craft.domain.agent.model.HtmlCodeResult;
import com.object.ai.craft.types.exception.BusinessException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class HtmlCodeParserTest {

    private final HtmlCodeParser parser = new HtmlCodeParser();

    @Test
    void shouldParseSingleHtmlCodeBlock() {
        String output = """
                生成结果如下：
                ```html
                <!doctype html>
                <html><body><h1>Hello</h1></body></html>
                ```
                """;

        HtmlCodeResult result = parser.parse(output);

        assertEquals("<!doctype html>\n<html><body><h1>Hello</h1></body></html>", result.getHtmlCode());
        assertEquals("", result.getDescription());
    }

    @Test
    void shouldRejectMissingSingleHtmlCodeBlock() {
        assertThrows(BusinessException.class, () -> parser.parse("plain text"));
    }

}
