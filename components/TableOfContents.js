import { useRouter } from "next/router";
import Link from "next/link";
import { useFetchTableOfContents } from "hooks";

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

const SectionLink = ({ title, level, isHighlighted, listOfSlugs }) => {
  const leftMarginSize = {
    0: "pl-0",
    1: "pl-0",
    2: "pl-4",
    3: "pl-6",
    4: "pl-8",
    5: "pl-10",
    6: "pl-12",
    7: "pl-14",
    8: "pl-16",
  };

  return (
    <div
      className={`hover:bg-blue-200 ${leftMarginSize[level]} ${
        isHighlighted ? "bg-blue-300" : ""
      }`}
    >
      <Link href={listOfSlugs.join("/")}>
        <div className="overflow-ellipsis whitespace-nowrap overflow-hidden w-full">
          {title}
        </div>
      </Link>
    </div>
  );
};

const TableOfContents = (props) => {
  const slug = useRouter().query.slug || [];
  const rootSlug = slug[0];
  const currentSectionSlug = slug[slug.length - 1];
  const { isLoading, isError, data, error } = useFetchTableOfContents(rootSlug);

  if (isLoading) return;
  if (isError) return;

  const listOfSections = [];
  preOrderTraversal(data, (node, listOfSlugs) => {
    listOfSections.push(
      <SectionLink
        key={node.uuid}
        title={node.title}
        level={node.level}
        isHighlighted={currentSectionSlug === node.uuid}
        listOfSlugs={[...listOfSlugs, node.uuid]}
      />
    );
    return [...listOfSlugs, node.uuid];
  });
  return <div className={props.className}>{listOfSections}</div>;
};

export default TableOfContents;
