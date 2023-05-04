import { useRouter } from "next/router";
import Link from "next/link";
import { useFetchArticle } from "hooks";

const SectionLink = ({ title, level, uuid }) => {
  console.log("rendering section link");
  console.log(title, level, uuid);
  const tabDistance = level - 1;
  return (
    <div className={`pl-${tabDistance}`}>
      <Link href={`/a/${uuid}`}>{title}</Link>
    </div>
  );
};

const TableOfContents = (props) => {
  const { articleUuid } = useRouter().query;
  const { isLoading, isError, data, error } = useFetchArticle(articleUuid);

  function preOrderTraversal(tree, callback) {
    const stack = [];
    function traverse(tree, callback) {
      for (const node of tree) {
        stack.push(
          <SectionLink title={node.title} level={node.level} uuid={node.uuid} />
        );
        if (node.children) {
          traverse(node.children, callback);
        }
      }
    }
    traverse(tree.children, callback);
    return stack;
  }

  if (isLoading) return;
  if (isError) return;
  return (
    <div id="TOC" className={props.className}>
      {preOrderTraversal(data, (node) => traversalCallback(node))}
    </div>
  );
};

export default TableOfContents;
