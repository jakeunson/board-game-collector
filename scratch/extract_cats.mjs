import fs from 'fs';
const text = fs.readFileSync('scratch/boardlife_1421.html', 'utf-8');

const extractSection = (sectionName) => {
  const regex = new RegExp(`<div class='title-info[^>]*>${sectionName}.*?</div>(.*?(?:<div class='credits-row'>.*?</div>\\s*)*)`, 'is');
  const match = text.match(regex);
  if (match) {
    const content = match[1];
    // extract all texts inside <a class='title' ...>...</a>
    const items = [];
    const itemRegex = /<a class='title'[^>]*>(.*?)<\/a>/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(content)) !== null) {
      items.push(itemMatch[1].trim());
    }
    // But wait, the content might include the next section if we are not careful with regex.
    // It's better to split by "credits-box" first.
  }
};

// Better approach: split by credits-box
const boxes = text.split("class='credits-box'>");
for (const box of boxes) {
  const titleMatch = box.match(/class='title-info[^>]*>(.*?)<\/div>/is);
  if (titleMatch) {
    let title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
    if (title === '카테고리' || title === '테마' || title === '진행방식') {
      const items = [];
      const itemRegex = /<a class='title'[^>]*>(.*?)<\/a>/g;
      let itemMatch;
      while ((itemMatch = itemRegex.exec(box)) !== null) {
        items.push(itemMatch[1].trim());
      }
      console.log(`[${title}]`, items.join(', '));
    }
  }
}
