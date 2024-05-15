import React, { useCallback, useMemo, useState, useEffect } from 'react'
import isHotkey from 'is-hotkey'
import { Editable, withReact, useSlate, Slate } from 'slate-react'
import { Editor, Transforms, createEditor, Text } from 'slate'
import { withHistory } from 'slate-history';
import escapeHtml from 'escape-html';
import { jsx } from 'slate-hyperscript';
import styled from 'styled-components';
import { Icon, Icons, Colors } from '@sellout/ui';
import Label from '@sellout/ui/build/components/Label';
import { media } from '@sellout/ui/build/utils/MediaQuery';

const Toolbar = styled.div`
  display: flex;
  height: 40px;
  border-radius: 10px 10px 0px 0px;
  border-bottom: 1px solid ${Colors.Grey5};
  align-items: center;
`;

type ButtonProps = {
  active?: boolean;
};
const Button = styled.div<ButtonProps>`
  margin-left: 20px;
  border-radius: 10px;
  height: 25px;
  width: 25px;
  background: ${props => (props.active ? `${Colors.Grey6}` : `${Colors.White}`)};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

type ContainerProps = {
  margin?: string;
}
const Container = styled.div<ContainerProps>`
  border: 1px solid ${Colors.Grey5};
  border-radius: 10px;
  background: ${Colors.White};
  margin: ${props => props.margin};
  min-height: 180px;
  ${media.mobile`
    max-width:350px;
  `};
`;

const EditorContainer = styled(Editable)`
  line-height: 160%;
  border-radius: 0px 0px 10px 10px;
  padding: 12px 16px;
  max-height: 240px;
  overflow: auto;
`;

const HOTKEYS: any = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const toggleBlock = (editor: any, format: any) => {
  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n: any) => LIST_TYPES.includes(n.type),
    split: true,
  })

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  })

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor: any, format: any) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor: any, format: any) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  })

  return !!match
}

const isMarkActive = (editor: any, format: any) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const Element = ({ attributes, children, element }: any) => {
  switch (element.type) {
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    default:
      return <p {...attributes}>{children}</p>
  }
}

const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

const BlockButton = ({ format, icon }: any) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon
        icon={icon}
        size={14}
        color={Colors.Grey1}
      />
    </Button>
  )
}

const MarkButton = ({ format, icon }: any) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon
        icon={icon}
        size={14}
        color={Colors.Grey1}
      />
    </Button>
  )
}

// https://docs.slatejs.org/concepts/09-serializing
// not working exactly as it needs.
// need to extend both serialize and desiarlize to handle
// more cases
const serialize = (node: any) => {
  if (Text.isText(node)) {
    return escapeHtml(node.text) || '';
  }
  const children = node.children.map((n: any) => serialize(n)).join('');
  if (children === "")
    return children;

  switch (node.type) {
    case 'quote':
      return `<blockquote><p>${children}</p></blockquote>`;
    case 'paragraph':
      return `<p>${children}</p>`;
    case 'link':
      return `<a href="${escapeHtml(node.url)}">${children}</a>`
    case 'numbered-list':
      return `<ol>${children}</ol>`;
    case 'bulleted-list':
      return `<ul>${children}</ul>`
    case 'list-item':
      return `<li>${children}</li>`
    default:
      return children
  }
}

const deserialize = (el: any) => {
  if (el.nodeType === 3) {
    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  }

  const children: any = Array.from(el.childNodes).map(deserialize);
  switch (el.nodeName) {
    case 'BODY':
      return jsx('fragment', {}, children)
    case 'BR':
      return '\n'
    case 'BLOCKQUOTE':
      return jsx('element', { type: 'quote' }, children)
    case 'P':
      return jsx('element', { type: 'paragraph' }, children)
    case 'A':
      return jsx(
        'element',
        { type: 'link', url: el.getAttribute('href') },
        children
      )
    default:
      return el.textContent
  }
}

type RichTextEditorProps = {
  value: string; // must be valid html string or empty or it will break
  onChange: any;
  label?: string;
  margin?: string;
  subLabel?: string;
  tip?: string;
  placeholder?: string;
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label,
  margin,
  subLabel,
  tip,
  placeholder,
}) => {

  const initialEditorValue = [{
    type: 'paragraph',
    children: [{ text: '' }],
  }];

  const [jsonValue, setJsonValue] = useState(deserialize((new DOMParser().parseFromString(value, 'text/html')).body));
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  
  useEffect(() => {
    if (value === "")
      setJsonValue(initialEditorValue);
  }, [value]);

  return (
    <>
      {label && <Label text={label} subText={subLabel} tip={tip} />}
      <Container margin={margin}>
        <Slate
          editor={editor}
          value={jsonValue}
          onChange={jsonValue => {
            setJsonValue(jsonValue as any);
            const html = jsonValue.reduce((html, node) => {
              return html + serialize(node);
            },'');
            onChange(html);
          }}>
          <Toolbar>
            <MarkButton format="bold" icon={Icons.BoldRegular} />
            <MarkButton format="italic" icon={Icons.ItalicRegular} />
            <MarkButton format="underline" icon={Icons.UnderlineRegular} />
            <BlockButton format="numbered-list" icon={Icons.OListRegular} />
            <BlockButton format="bulleted-list" icon={Icons.UListRegular} />
          </Toolbar>
          <EditorContainer
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={placeholder || "Enter some rich text…"}
            spellCheck
            onKeyDown={event => {

              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, (event as any))) {
                  event.preventDefault()
                  const mark = HOTKEYS[hotkey]
                  toggleMark(editor, mark)
                }
              }
            }}
          />
        </Slate>
      </Container>
    </>
  )
}

export default RichTextEditor