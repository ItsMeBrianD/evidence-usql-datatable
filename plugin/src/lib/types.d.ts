import type {Table} from "apache-arrow/Arrow.dom"
export type ArrowTable = Table;
export type PrqlMod = typeof import("prql-js/dist/node");
export type UniversalSqlMod = typeof import("@evidence-dev/universal-sql/client-duckdb");
export type QueryFunction = (...args: Parameters<UniversalSqlMod["query"]>) => ArrowTable;


export type PrqlCompileError = {
    /** Message kind. Currently only Error is implemented. */
    kind: "Error" | "Warning" | "Lint";
    /** Machine-readable identifier of the error */
    code: string | null;
    /** Plain text of the error */
    reason: string;
    /** A list of suggestions of how to fix the error */
    hint: string | null;
    /** Character offset of error origin within a source file */
    span: [number, number] | null;
  
    /** Annotated code, containing cause and hints. */
    display: string | null;

    /**
     * Location within the source file.
     * Tuples contain:
     * - line number (0-based),
     * - column number within that line (0-based),
     */ 
    location: {
        start: [number, number];
      
        end: [number, number];
      } | null;
  }
   