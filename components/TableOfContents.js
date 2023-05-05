import { useRouter } from "next/router";
import Link from "next/link";
import { useFetchArticle } from "hooks";

const ROOT_LEVEL = 1;

function preOrderTraversal(tree, callback) {
  function traverse(tree, callback, context = []) {
    for (const node of tree) {
      const newContext = callback(node, context);
      if (node.children) {
        traverse(node.children, callback, newContext);
      }
    }
  }
  traverse(tree.children, callback);
}

const SectionLink = ({ title, level, sectionSlug, rootSlug, listOfSlugs }) => {
  const leftMarginSize = level - ROOT_LEVEL;

  const remainingSlugs = listOfSlugs.join("/") + (listOfSlugs ? "/" : "");
  const route =
    rootSlug === sectionSlug
      ? `/a/${rootSlug}/`
      : `/a/${rootSlug}/${remainingSlugs}`;

  return (
    <div className={`pl-${leftMarginSize}`}>
      <Link href={route}>{title}</Link>
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
  preOrderTraversal(data, (node, prevSlugs) => {
    listOfSections.push(
      <SectionLink
        key={node.uuid}
        title={node.title}
        level={node.level}
        sectionSlug={node.uuid}
        rootSlug={rootSlug}
        listOfSlugs={[...prevSlugs, node.uuid]}
      />
    );
    return [...prevSlugs, node.uuid];
  });

  return <div className={props.className}>{listOfSections}</div>;
};

export default TableOfContents;
