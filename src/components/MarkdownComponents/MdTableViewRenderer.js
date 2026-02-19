import { useProcessController } from "../../store/useMessagesStore";
import { convertToJson } from "../../utils/helpers";
import { BasicLoader } from "../Loaders";
import TablePaginatedView from "./TablePaginated";

const MdTableViewRenderer = ({ content, message_id }) => {
  const tableConfig = convertToJson(content);
  const process = useProcessController(
    (state) => state.message_process?.[message_id],
  );

  if (process?.id === message_id && !tableConfig) {
    return (
      <div className="py-4 px-1.5 flex items-center gap-1.5">
        <BasicLoader /> please wait...
      </div>
    );
  }

  if (!tableConfig) {
    return <div className="p-4">No data to display</div>;
  }

  if (tableConfig?.type === "TABLE_PAGINATED") {
    return <TablePaginatedView config={tableConfig} />;
  }

  return <div className="p-4">{content}</div>;
};

export default MdTableViewRenderer;
