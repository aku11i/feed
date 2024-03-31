import { Client } from "@notionhq/client";
import { Feed } from "feed";
import { isFullPage } from "@notionhq/client";
import { ensureIsDefined } from "./utils.ts";

const DATABASE_ID = "28aea411e9304d638cd0ac6a8ce277d1";

const notion = new Client({
  auth: Deno.env.get("NOTION_TOKEN"),
});

const articles = await notion.databases.query({
  database_id: DATABASE_ID,
  sorts: [
    {
      timestamp: "created_time",
      direction: "descending",
    },
  ],
  page_size: 20,
});

const feed = new Feed({
  title: "雑記",
  id: "https://aku11i.notion.site/28aea411e9304d638cd0ac6a8ce277d1?v=ec1ee45f8cf644538b4ec9000c33ae83&pvs=4",
  copyright: "aku11i",
});

articles.results.forEach((article) => {
  if (!isFullPage(article)) {
    throw new Error();
  }

  const props = {
    title: ensureIsDefined(article.properties["タイトル"]),
    tag: ensureIsDefined(article.properties["タグ"]),
  };

  if (props.title.type !== "title") {
    throw new Error();
  }

  if (props.tag.type !== "multi_select") {
    throw new Error();
  }

  const title = ensureIsDefined(props.title.title[0]).plain_text;
  const tags = props.tag.multi_select.map((tag) => tag.name);
  const createdAt = article.created_time;

  const url = ensureIsDefined(article.public_url);

  feed.addItem({
    id: url,
    title,
    category: tags.map((tag) => ({ name: tag })),
    link: url,
    date: new Date(createdAt),
  });
});

const atom = feed.atom1();

await Deno.writeTextFile("public/feed.xml", atom);
