import { CodeBlock } from "@/components/CodeBlock";
import { Heading } from "@/components/Heading";

/** Featured discussion content for the getit demo post. */
export function ReadingABTreePageByHand() {
  return (
    <>
      <p className="lede">There is a point where learning SQL stops being about memorising syntax and starts being about asking a better question.</p>
      <p>That was the shift for me. Instead of trying to remember every clause, I started describing the answer in plain language first: which rows do I need, how are they related, and what should happen when there is no match?</p>
      <aside className="callout"><strong>Small reminder.</strong> You do not need to know everything before writing a query. Start with one table, inspect the result, and add one idea at a time.</aside>

      <Heading level={2}>Start with the question</Heading>
      <p>For example: “show the posts in the dbms subgetit, newest first.” The first version can be deliberately boring:</p>
      <CodeBlock lang="sql" code={"SELECT title, created_at\nFROM posts\nWHERE subgetit = 'dbms'\nORDER BY created_at DESC;"} />
      <p>Only after that works do you add the author, comments, vote score, or filters. Each join should answer a visible part of the question.</p>

      <Heading level={2}>Make the result useful</Heading>
      <p>A good community feed usually needs the post, its author, a score, and a conversation count:</p>
      <CodeBlock lang="sql" code={"SELECT p.title, u.username, p.karma, COUNT(c.comment_id) AS comments\nFROM posts p\nJOIN users u ON u.user_id = p.user_id\nLEFT JOIN comments c ON c.post_id = p.post_id\nGROUP BY p.post_id, u.username\nORDER BY p.karma DESC;"} />
      <p>The <code>LEFT JOIN</code> matters: a post with zero comments should still appear in the feed. That is the kind of small detail that makes a query feel like a product feature instead of an exercise.</p>

      <Heading level={2}>Ask the community</Heading>
      <p>What made SQL click for you? Was it drawing the tables, writing reports, debugging a strange result, or building something where the data finally mattered?</p>
      <p>Drop your answer in the comments. Upvote the explanation that helps the next person, and downvote only when something genuinely sends them in the wrong direction.</p>
    </>
  );
}
