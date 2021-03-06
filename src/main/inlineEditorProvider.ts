//   Copyright 2013-2014 François de Campredon
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.

'use strict';

//TODO that part of the application is not well tested and just 'work' it needs to be refactored

import ServiceConsumer = require('./serviceConsumer');

var DocumentManager = brackets.getModule('document/DocumentManager'),
    MultiRangeInlineEditor = brackets.getModule('editor/MultiRangeInlineEditor').MultiRangeInlineEditor;

    
    
 function typeScriptInlineEditorProvider(hostEditor: brackets.Editor, pos: CodeMirror.Position): JQueryPromise<brackets.InlineWidget> {
    if (hostEditor.getModeForSelection() !== 'typescript') {
        return null;
    }

    var sel = hostEditor.getSelection(false);
    if (sel.start.line !== sel.end.line) {
        return null;
    }
    var deferred = $.Deferred();
    ServiceConsumer.getService().then(service => {
        var fileName = hostEditor.document.file.fullPath;
        
        service.getDefinitionAtPosition(fileName, hostEditor.indexFromPos(pos)).then(definitions => {
            if (!definitions || definitions.length === 0) {
                deferred.reject();
            }

            var codeMirror = (<any>hostEditor._codeMirror);
            if (codeMirror) {
                definitions = definitions.filter(definition => 
                    definition.fileName !== fileName || 
                    codeMirror.posFromIndex(definition.textSpan.start).line !== pos.line
                );
            }

           
            if (definitions.length === 0) {
                deferred.reject();
            }

            var promises: JQueryPromise<any>[] = [],
                ranges: brackets.MultiRangeInlineEditorRange[] = [];

            definitions.forEach(definition => {
                promises.push(
                    DocumentManager.getDocumentForPath(definition.fileName)
                        .then(doc => {
                            (<any>doc)._ensureMasterEditor();
                            var codeMirror = (<any>doc)._masterEditor._codeMirror;
                            var lineStart = codeMirror.posFromIndex(definition.textSpan.start).line;
                            var lineEnd = codeMirror.posFromIndex(definition.textSpan.start + definition.textSpan.length).line
                            ranges.push({
                                document : doc,
                                name: definition.name,
                                lineStart: lineStart,  
                                lineEnd: lineEnd,
                                fileName: definition.fileName
                            });    
                        })
                );
            });

            return $.when.apply($, promises).then(() => {
                var inlineEditor = new MultiRangeInlineEditor(ranges);
                inlineEditor.load(hostEditor);
                deferred.resolve(inlineEditor);
            });
        }).catch(e => {
            deferred.reject();
        });
    });    
    return deferred.promise();
};

export = typeScriptInlineEditorProvider;
