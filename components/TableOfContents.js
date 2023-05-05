import { useRouter } from "next/router";
import Link from "next/link";
import { useFetchArticle } from "hooks";

const ROOT_LEVEL = 1;

function preOrderTraversal(tree, callback) {
  function traverse(tree, callback, prevSlugs = []) {
    for (const node of tree) {
      callback(node, prevSlugs);
      if (node.children) {
        prevSlugs.push(node.uuid);
        traverse(node.children, callback, prevSlugs);
        prevSlugs.pop();
      }
    }
  }
  const prevSlugs = [];
  traverse(tree.children, callback, prevSlugs);
}

// I want the section link to be able to pass the middleSlugs to the SectionLink component
// but in order to do that I need to keep track of the path of slugs in the preOrderTraversal
// function. I'm not sure how to do that.

const SectionLink = ({ title, level, sectionSlug, rootSlug, prevSlugs }) => {
  const leftMarginSize = level - ROOT_LEVEL;
  const route =
    rootSlug === sectionSlug
      ? `/a/${rootSlug}/`
      : `/a/${rootSlug}/${prevSlugs.join("/")}/${sectionSlug}/`;

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
    console.log(node.uuid, prevSlugs);
    listOfSections.push(
      <SectionLink
        title={node.title}
        level={node.level}
        sectionSlug={node.uuid}
        rootSlug={rootSlug}
        prevSlugs={[...prevSlugs]}
      />
    );
  });

  return <div className={props.className}>{listOfSections}</div>;
};

export default TableOfContents;
