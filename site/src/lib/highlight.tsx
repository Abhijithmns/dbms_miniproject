import type { ReactNode } from "react";

/*
 * A tiny highlighter for the example post's code: SQL and shell. It produces the same <span>s
 * the HTML version has hand-written (tok-k keywords, tok-s strings, tok-n numbers, tok-c comments,
 * tok-f functions and commands), styled by the --tok-* colours in globals.css. Other languages
 * (and "text" output) are shown as they are.
 */

const SQL_KEYWORDS = new Set(
  "CREATE EXTENSION IF NOT EXISTS TABLE GENERATED ALWAYS AS IDENTITY PRIMARY KEY NULL INSERT INTO SELECT FROM WHERE LIMIT INDEX ON BETWEEN AND bigint text".split(
    " ",
  ),
);

const tok = (kind: string, text: string, key: number) => (
  <span key={key} className={`tok-${kind}`}>
    {text}
  </span>
);

function sql(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let key = 0;
  code.split("\n").forEach((line, i) => {
    if (i) out.push("\n");
    const re = /(--.*$)|('[^']*')|(\b\d+\b)|([A-Za-z_]\w*)(?=\()|([A-Za-z_]\w*)|([^A-Za-z_\d']+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      if (m[1]) out.push(tok("c", m[1], key++));
      else if (m[2]) out.push(tok("s", m[2], key++));
      else if (m[3]) out.push(tok("n", m[3], key++));
      else if (m[4]) out.push(tok("f", m[4], key++));
      else if (m[5]) out.push(SQL_KEYWORDS.has(m[5]) ? tok("k", m[5], key++) : m[5]);
      else out.push(m[6]);
    }
  });
  return out;
}

function shell(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  code.split("\n").forEach((line, i) => {
    if (i) out.push("\n");
    if (line.startsWith("#")) {
      out.push(tok("c", line, i));
      return;
    }
    const [cmd, ...rest] = line.split(" ");
    out.push(tok("f", cmd, i));
    if (rest.length) out.push(" " + rest.join(" "));
  });
  return out;
}

/** Highlighted code for a language ("sql", "bash"/"sh"), or the code as it is. */
export function highlightCode(lang: string, code: string): ReactNode {
  if (lang === "sql") return sql(code);
  if (lang === "bash" || lang === "sh") return shell(code);
  return code;
}
