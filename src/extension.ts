import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const todoDecoration = vscode.window.createTextEditorDecorationType({
    color: '#ffcc00',
    fontWeight: 'bold'
  });

  const fixDecoration = vscode.window.createTextEditorDecorationType({
    color: '#ff5555',
    fontWeight: 'bold'
  });

  const activeEditor = vscode.window.activeTextEditor;

  function updateDecorations() {
    if (!activeEditor) return;
    const text = activeEditor.document.getText();

    const todoMatches: vscode.DecorationOptions[] = [];
    const fixMatches: vscode.DecorationOptions[] = [];

    const todoRegex = /\/\/.*?(TODO)\b.*/g;
    const fixRegex = /\/\/.*?(FIX|FIXME|BUG)\b.*/g;

    let match;
    while ((match = todoRegex.exec(text))) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(match.index + match[0].length);
      todoMatches.push({ range: new vscode.Range(startPos, endPos) });
    }

    while ((match = fixRegex.exec(text))) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(match.index + match[0].length);
      fixMatches.push({ range: new vscode.Range(startPos, endPos) });
    }

    activeEditor.setDecorations(todoDecoration, todoMatches);
    activeEditor.setDecorations(fixDecoration, fixMatches);
  }

  if (activeEditor) {
    updateDecorations();
  }

  vscode.workspace.onDidChangeTextDocument(updateDecorations);
  vscode.window.onDidChangeActiveTextEditor(updateDecorations);
}
