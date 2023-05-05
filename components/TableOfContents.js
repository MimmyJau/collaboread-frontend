import { useRouter } from "next/router";
import Link from "next/link";
import { useFetchArticle } from "hooks";

const ROOT_LEVEL = 1;

function preOrderTraversal(root, callback) {
  function traverse(tree, callback, context = []) {
    for (const node of tree) {
      const newContext = callback(node, context);
      if (node.children) {
        traverse(node.children, callback, newContext);
      }
    }
  }
  traverse(root.children, callback, [root.uuid]);
}

const SectionLink = ({ title, level, listOfSlugs }) => {
  const leftMarginSize = level - ROOT_LEVEL;

  return (
    <div className={`pl-${leftMarginSize}`}>
      <Link href={listOfSlugs.join("/")}>{title}</Link>
    </div>
  );
};

const TableOfContents = (props) => {
  const slug = useRouter().query.slug || [];
  const rootSlug = slug[0];
  const { isLoading, isError, data, error } = useFetchArticle(rootSlug);

  if (isLoading) return;
  if (isError) return;

  const listOfSections = [];
  preOrderTraversal(data, (node, listOfSlugs) => {
    listOfSections.push(
      <SectionLink
        key={node.uuid}
        title={node.title}
        level={node.level}
        listOfSlugs={[...listOfSlugs, node.uuid]}
      />
    );
    return [...listOfSlugs, node.uuid];
  });

  return <div className={props.className}>{listOfSections}</div>;
};

export default TableOfContents;
