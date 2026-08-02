export function parseMarkdownList(
  lines: string[],
  startIndex: number,
  ordered: boolean,
) {
  const itemPattern = ordered ? /^\s*\d+\.\s+(.+)$/ : /^\s*[-*]\s+(.+)$/;
  const items: string[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const match = lines[index].match(itemPattern);
    if (!match) break;

    const itemLines = [match[1]];
    index += 1;

    while (index < lines.length && !lines[index].match(itemPattern)) {
      const continuation = lines[index].match(/^\s{2,}(\S.*)$/);
      if (!continuation) break;

      itemLines.push(continuation[1]);
      index += 1;
    }

    items.push(itemLines.join(" "));
  }

  return { items, nextIndex: index };
}
