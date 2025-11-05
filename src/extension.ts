import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('TODO Highlighter is now active!');

    let todoDecoration: vscode.TextEditorDecorationType;
    let fixDecoration: vscode.TextEditorDecorationType;

    function createDecorations() {
        todoDecoration?.dispose();
        fixDecoration?.dispose();

        const config = vscode.workspace.getConfiguration('todoHighlighter');
        
        todoDecoration = vscode.window.createTextEditorDecorationType({
            color: config.get('todoColor', '#ffcc00'),
            fontWeight: 'bold',
            backgroundColor: 'rgba(255, 204, 0, 0.1)'
        });

        fixDecoration = vscode.window.createTextEditorDecorationType({
            color: config.get('fixColor', '#ff5555'),
            fontWeight: 'bold', 
            backgroundColor: 'rgba(255, 85, 85, 0.1)'
        });
    }

    function updateDecorations() {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }

        const text = activeEditor.document.getText();
        const todoMatches: vscode.DecorationOptions[] = [];
        const fixMatches: vscode.DecorationOptions[] = [];

        const todoRegex = /\/\/.*?\b(TODO|NOTE|HACK)\b.*$/gim;
        const fixRegex = /\/\/.*?\b(FIX|FIXME|BUG|XXX)\b.*$/gim;

        let match;
        while ((match = todoRegex.exec(text))) {
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(match.index + match[0].length);
            const decoration: vscode.DecorationOptions = {
                range: new vscode.Range(startPos, endPos),
                hoverMessage: `**TODO**: ${match[0].replace('//', '').trim()}`
            };
            todoMatches.push(decoration);
        }

        while ((match = fixRegex.exec(text))) {
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(match.index + match[0].length);
            const decoration: vscode.DecorationOptions = {
                range: new vscode.Range(startPos, endPos),
                hoverMessage: `**FIXME**: ${match[0].replace('//', '').trim()}`
            };
            fixMatches.push(decoration);
        }

        activeEditor.setDecorations(todoDecoration, todoMatches);
        activeEditor.setDecorations(fixDecoration, fixMatches);
    }

    createDecorations();

    let disposable = vscode.commands.registerCommand('todo-highlighter.forceUpdate', () => {
        updateDecorations();
        vscode.window.showInformationMessage('TODO decorations updated!');
    });

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
            updateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('todoHighlighter')) {
            createDecorations();
            updateDecorations();
        }
    }, null, context.subscriptions);

    if (vscode.window.activeTextEditor) {
        updateDecorations();
    }

    context.subscriptions.push(disposable);
}

export function deactivate() {

}