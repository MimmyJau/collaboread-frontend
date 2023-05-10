import { useRouter } from "next/router";
import Link from "next/link";
import { useMemo } from "react";
import { useFetchArticle } from "hooks";

const ROOT_LEVEL = 1;

function preOrderTraversal(root, callback) {
  function traverse(node, callback, context = []) {
    const newContext = callback(node, context);
    for (const child of node.children) {
      traverse(child, callback, newContext);
    }
  }
  traverse(root, callback);
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

  const listOfSections = useMemo(() => {
    if (isLoading || isError || !data) return null;

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
    return listOfSections;
  }, [data]);

  return <div className={props.className}>{listOfSections}</div>;
};

export default TableOfContents;
