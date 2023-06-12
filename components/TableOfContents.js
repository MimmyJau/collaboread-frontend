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

const SectionLink = ({ title, slug, level, isHighlighted }) => {
  // Levels start at 1 (not 0)
  const leftMarginSize = {
    1: "pl-0",
    2: "pl-0",
    3: "pl-4",
    4: "pl-6",
    5: "pl-8",
    6: "pl-10",
    7: "pl-12",
    8: "pl-14",
    9: "pl-16",
  };

  return (
    <div
      className={`hover:bg-blue-200 ${leftMarginSize[level]} ${
        isHighlighted ? "bg-blue-300" : ""
      }`}
    >
      <Link href={slug}>
        <div className="overflow-ellipsis whitespace-nowrap overflow-hidden w-full">
          {title}
        </div>
      </Link>
    </div>
  );
};

const TableOfContents = (props) => {
  const slugList = useRouter().query.slug || [];
  const rootSlug = slugList[0];
  const currentSlug = slugList.join("/");
  const { isLoading, isError, data, error } = useFetchTableOfContents(rootSlug);

  if (isLoading) return;
  if (isError) return;

  const listOfSections = [];
  console.log(data);
  preOrderTraversal(data, (node, []) => {
    listOfSections.push(
      <SectionLink
        key={node.uuid}
        slug={node.slugFull}
        title={node.title}
        level={node.level}
        isHighlighted={currentSlug=== node.slugFull}
      />
    );
    return [];
  });
  return <div className={props.className}>{listOfSections}</div>;
};

export default TableOfContents;
