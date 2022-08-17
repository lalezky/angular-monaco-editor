import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";

import * as monaco from "monaco-editor";
import { Uri } from "monaco-editor";
import { setDiagnosticsOptions, DiagnosticsOptions } from "monaco-yaml";

window.MonacoEnvironment = {
  getWorker(moduleId, label) {
    switch (label) {
      case "editorWorkerService":
        return new Worker(
          new URL("monaco-editor/esm/vs/editor/editor.worker", import.meta.url)
        );
      case "yaml":
        return new Worker(
          new URL("node_modules/monaco-yaml/yaml.worker", import.meta.url)
        );
      default:
        throw new Error(`Unknown label ${label}`);
    }
  },
};

@Component({
  selector: "app-monaco-editor",
  templateUrl: "./monaco-editor.component.html",
  styleUrls: ["./monaco-editor.component.scss"],
})
export class MonacoEditorComponent implements AfterViewInit {
  @ViewChild("editorContainer") _editorContainer: ElementRef;

  @Input() code = "";
  @Output() codeChange = new EventEmitter<String>();

  codeEditorInstance: monaco.editor.IStandaloneCodeEditor;

  constructor() {}

  ngAfterViewInit() {
    const yamlOptions: DiagnosticsOptions = {
      validate: true,
      enableSchemaRequest: true,
      format: true,
      hover: true,
      completion: true,
      schemas: [
        {
          uri: "https://spec.openapis.org/oas/3.1/schema/2021-09-28",
          fileMatch: ["monaco-yaml.yaml"],
          schema: {
            type: "object",
            properties: {
              enum: {
                description: "Pick your starter",
                enum: ["Bulbasaur", "Squirtle", "Charmander", "Pikachu"],
              },
              number: {
                description: "Numbers work!",
                minimum: 42,
                maximum: 1337,
              },
              Execution: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    targetRoles: {
                      type: "array",
                      minItems: 1,
                      items: {
                        type: "string",
                      },
                    },
                    Flow: {
                      type: "array",
                      minItems: 1,
                      items: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ],
    };

    setDiagnosticsOptions(yamlOptions);

    const value = `enum: `.replace(/:$/m, ": ");

    const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
      automaticLayout: true,
      quickSuggestions: true,
      formatOnPaste: true,
      model: monaco.editor.createModel(
        value,
        undefined,
        Uri.parse("monaco-yaml.yaml")
      ),
      theme: "vs-dark",
    };
    monaco.editor.create(this._editorContainer.nativeElement, editorOptions);
  }
}
