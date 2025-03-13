import { StateNode, Editor, TLShapeId, createShapeId, toRichText } from 'tldraw'

let START_POS_X = 200;
let START_POS_Y = 100;
let SPACE_X = 35;
let SPACE_Y = 120;
let WRAP_TEXT = true;
let TEXT_MAX_CHAR_WIDTH = 80;
let TEXT_SIZE_STYLE = 'm';
let ADD_BLANK_LINES = false;
let INSERT_TEXT = '';

function reflow_text(text: string, max_width = 60, add_blank_lines = false): string {
    // Split the text into paragraphs at blank lines.
    const paragraphs = text.split(/\n\s*\n/);

    // Process each paragraph.
    // Preserve existing line breaks, such as in verses.
    const processed_paragraphs = paragraphs.map(paragraph => {
        const par_lines = paragraph.split(/\n/);

        const processed_par_lines = par_lines.map(p_line => {
            const words = p_line.split(/\s+/);
            const lines = [];
            let current_line = '';
            let current_width = 0;

            for (const word of words) {
                const word_width = word.length;

                if (current_width + word_width + 1 > max_width) {
                    lines.push(current_line.trim());
                    current_line = word;
                    current_width = word_width;
                } else {
                    if (current_line !== '') {
                        current_line += ' ';
                        current_width++;
                    }
                    current_line += word;
                    current_width += word_width;
                }
            }

            if (current_line !== '') {
                lines.push(current_line.trim());
            }

            return lines.join('\n');
        });

        return processed_par_lines.join('\n');
    });

    let ret_text = "";

    if (add_blank_lines) {
        // Join the processed paragraphs with a blank line between them
        ret_text = processed_paragraphs.join('\n\n');
    } else {
        ret_text = processed_paragraphs.join('\n');
    }

    return ret_text;
}

function tldraw_text_insert(text: string, editor: Editor): void {
    let lines = [];

    text = text.trim();

    if (WRAP_TEXT) {
        lines = reflow_text(text, TEXT_MAX_CHAR_WIDTH, ADD_BLANK_LINES).split("\n");
    } else {
        // Split the lines and eliminate empty items
        // "one\n\ntwo".split("\n") => [ "one", "", "two" ]
        lines = text.split("\n").filter(e => e);
    }

    let cur_x = START_POS_X;
    let cur_y = START_POS_Y;

    const date_now = `${Date.now()}`;

    lines.forEach(function (line, line_idx) {
        const words = line.split(/\s+/);
        let shape_id: TLShapeId | null = null;

        words.forEach(function (word, word_idx) {

            shape_id = createShapeId("text-" + date_now + "_" + line_idx + "_" + word_idx);

            editor.createShape({
                type: "text",
                id: shape_id,
                x: cur_x,
                y: cur_y,
                props: {
                    richText: toRichText(word),
                    size: TEXT_SIZE_STYLE, // DefaultSizeStyle: 'l' | 'm' | 's' | 'xl'
                    // NOTE: better not to set the color, it will the the currently selected color in the palette, which defaults to black for light theme and white for dark theme.
                    // color: TEXT_COLOR, // DefaultColorStyle: 'black' | 'white' | etc.
                    font: 'serif', // DefaultFontStyle: 'draw' | 'mono' | 'sans' | 'serif'
                    textAlign: 'start', // DefaultTextAlignStyle: 'end' | 'middle' | 'start'
                },
            });

            const b = editor.getShapePageBounds(shape_id);
            if (b) {
                cur_x = b.maxX + SPACE_X;
            } else {
                alert("Missing shape");
            }
        });

        cur_x = START_POS_X;
        if (!shape_id) {
            alert("Missing shape id");
            return;
        }
        const b = editor.getShapePageBounds(shape_id);
        if (b) {
            cur_y = b.maxY + SPACE_Y;
        } else {
            alert("Missing shape");
        }
    });
}

function open_modal() {
    const modal = document.getElementById('tltxt-modal');
    if (!modal) {
        alert("Can't find the modal.");
        return;
    }
    modal.style.display = 'block';
}

function close_modal() {
    const modal = document.getElementById('tltxt-modal');
    if (!modal) {
        alert("Can't find the modal.");
        return;
    }
    modal.style.display = 'none';
}

function update_tltxt_form() {
    (document.getElementById('start_pos_x') as HTMLInputElement).value = START_POS_X.toString();
    (document.getElementById('start_pos_y') as HTMLInputElement).value = START_POS_Y.toString();

    (document.getElementById('space_x') as HTMLInputElement).value = SPACE_X.toString();
    (document.getElementById('space_y') as HTMLInputElement).value = SPACE_Y.toString();

    (document.getElementById('wrap_text') as HTMLInputElement).checked = WRAP_TEXT;

    (document.getElementById('text_max_char_width') as HTMLInputElement).value = TEXT_MAX_CHAR_WIDTH.toString();
    (document.getElementById('text_size_style') as HTMLInputElement).value = TEXT_SIZE_STYLE;

    (document.getElementById('add_blank_lines') as HTMLInputElement).checked = ADD_BLANK_LINES;

    (document.getElementById('insert_text') as HTMLInputElement).value = INSERT_TEXT;
}

function set_tltxt_values_and_insert(editor: Editor) {
    START_POS_X = Number((document.getElementById('start_pos_x') as HTMLInputElement).value);
    START_POS_Y = Number((document.getElementById('start_pos_y') as HTMLInputElement).value);
    SPACE_X = Number((document.getElementById('space_x') as HTMLInputElement).value);
    SPACE_Y = Number((document.getElementById('space_y') as HTMLInputElement).value);
    WRAP_TEXT = (document.getElementById('wrap_text') as HTMLInputElement).checked;
    TEXT_MAX_CHAR_WIDTH = Number((document.getElementById('text_max_char_width') as HTMLInputElement).value);

    TEXT_SIZE_STYLE = (document.getElementById('text_size_style') as HTMLInputElement).value;
    ADD_BLANK_LINES = (document.getElementById('add_blank_lines') as HTMLInputElement).checked;
    INSERT_TEXT = (document.getElementById('insert_text') as HTMLInputElement).value;

    close_modal();
    tldraw_text_insert(INSERT_TEXT, editor);

    editor.setCurrentTool('select');
}

export class TltxtTool extends StateNode {
    static override id = 'tltxt';

    override onEnter() {
        this.editor.setCursor({ type: 'cross', rotation: 0 });
    }

    override onPointerDown() {
        const { currentPagePoint } = this.editor.inputs;
        START_POS_X = currentPagePoint.x;
        START_POS_Y = currentPagePoint.y;

        const modal = document.getElementById('tltxt-modal');
        if (!modal) {
            alert("Can't find the modal.");
            return;
        }

        const the_editor = this.editor;

        const ok_btn = modal.querySelector('#okButton');
        if (ok_btn) {
            ok_btn.addEventListener('click', function () { set_tltxt_values_and_insert(the_editor) });
        } else {
            alert("Missing OK button");
        }

        const cancel_btn = modal.querySelector('#cancelButton');
        if (cancel_btn) {
            cancel_btn.addEventListener('click', close_modal);
        } else {
            alert("Missing Cancel button");
        }

        navigator.clipboard
            .readText()
            .then((text) => {
                INSERT_TEXT = text;
                update_tltxt_form();
                this.editor.setCursor({ type: 'default' });
                open_modal();
            });
    }
}
